let products = [];

async function loadProducts() {

  const response = await fetch("../data/products.json");

  products = await response.json();

  displayProducts(products);
}

function displayProducts(items) {

  const container =
    document.getElementById("productsContainer");

  container.innerHTML = "";

  items.forEach(product => {

    container.innerHTML += `
      <div class="product-card">

        <img src="${product.image}" alt="${product.name}">

        <div class="product-info">

          <h4>${product.name}</h4>

          <p>${product.category}</p>

          <p class="product-price">
            Le ${product.price}
          </p>

          <p>⭐ ${product.rating}</p>

          <a
            href="product-details.html?id=${product.id}"
            class="btn"
          >
            View Details
          </a>

        </div>

      </div>
    `;
  });
}

loadProducts();

const searchInput =
document.getElementById("searchInput");

if (searchInput) {

  searchInput.addEventListener("input", e => {

    const searchText =
      e.target.value.toLowerCase();

    const filteredProducts =
      products.filter(product =>
        product.name.toLowerCase()
        .includes(searchText)
      );

    displayProducts(filteredProducts);

  });
}

const categoryButtons =
document.querySelectorAll(".category-btn");

categoryButtons.forEach(button => {

  button.addEventListener("click", () => {

    const category =
      button.dataset.category;

    if (category === "All") {

      displayProducts(products);

      return;
    }

    const filteredProducts =
      products.filter(product =>
        product.category === category
      );

    displayProducts(filteredProducts);

  });
});
