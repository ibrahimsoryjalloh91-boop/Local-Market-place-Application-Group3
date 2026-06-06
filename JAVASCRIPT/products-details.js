const params =
new URLSearchParams(window.location.search);

const productId =
parseInt(params.get("id"));

async function getProduct() {

  const response =
  await fetch("../data/products.json");

  const products =
  await response.json();

  const product =
  products.find(
    item => item.id === productId
  );

  document.getElementById(
    "productDetails"
  ).innerHTML = `

    <img
      src="${product.image}"
      alt="${product.name}"
      style="width:100%; max-width:500px;"
    >

    <h1>${product.name}</h1>

    <h3>Le ${product.price}</h3>

    <p>${product.description}</p>

    <p>Seller: ${product.seller}</p>

    <p>⭐ ${product.rating}</p>

    <button class="btn">
      Add To Cart
    </button>

  `;
}

getProduct();