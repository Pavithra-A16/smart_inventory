const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand, ScanCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const REGION = 'us-east-1'; // 🔁 Replace with your AWS region
const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
const TABLE_NAME = 'InventoryItems';
app.post('/add-item', async (req, res) => {
  const { itemId, name, quantity, imageUrl } = req.body;

  if (!itemId || !name || !quantity || !imageUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const item = {
    itemId,
    name,
    quantity,
    imageUrl,
    timestamp: Date.now()
  };

  try {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    }));
    res.json({ message: 'Item added successfully', item });
  } catch (err) {
    console.error('DynamoDB Error:', err);
    res.status(500).json({ error: 'Could not add item' });
  }
});
app.get('/items', async (req, res) => {
  try {
    const data = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME
    }));
    res.json(data.Items);
  } catch (err) {
    console.error('DynamoDB Scan Error:', err);
    res.status(500).json({ error: 'Could not retrieve items' });
  }
});

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('🚀 Smart Inventory Management API is running');
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
