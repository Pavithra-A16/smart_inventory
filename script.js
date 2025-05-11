const apiBase = "https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/items";
const s3BucketUrl = "https://your-s3-bucket.s3.amazonaws.com/";

document.getElementById("itemForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const fileInput = document.getElementById("image");
  let imageUrl = "";

  if (fileInput.files[0]) {
    const file = fileInput.files[0];
    const fileName = Date.now() + "_" + file.name;
    await uploadToS3(file, fileName);
    imageUrl = s3BucketUrl + fileName;
  }

  const item = {
    itemName: document.getElementById("itemName").value,
    quantity: parseInt(document.getElementById("quantity").value),
    category: document.getElementById("category").value,
    price: parseFloat(document.getElementById("price").value),
    imageUrl: imageUrl,
  };

  await fetch(apiBase, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  alert("Item added successfully!");
  loadItems();
});

async function uploadToS3(file, fileName) {
  const uploadUrl = s3BucketUrl + fileName;
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
}

async function loadItems() {
  const res = await fetch(apiBase);
  const data = await res.json();

  const container = document.getElementById("itemsContainer");
  container.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.itemName}" />
      <h3>${item.itemName}</h3>
      <p>Category: ${item.category}</p>
      <p>Quantity: ${item.quantity}</p>
      <p>Price: $${item.price}</p>
    `;
    container.appendChild(div);
  });
}

window.onload = loadItems;
