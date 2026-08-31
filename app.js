const API_URL = "http://127.0.0.1:8000/products/";
const CART_API_URL = "http://127.0.0.1:8000/cart/"; // Added the cart endpoint

async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();

        const container = document.getElementById("product-container");
        container.innerHTML = ""; 

        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.className = "product-card";
            
            const formattedPrice = `$${product.price.toFixed(2)}`;
            const imgSource = product.image_url ? product.image_url : "https://via.placeholder.com/150";

            productCard.innerHTML = `
                <img src="${imgSource}" alt="${product.name}" style="width: 100%; max-width: 200px;">
                <p class="category" style="color: gray; font-size: 0.8em; text-transform: uppercase;">${product.category || 'Uncategorized'}</p>
                <h3>${product.name}</h3>
                <p class="brand">Brand: ${product.brand || 'No Brand'}</p>
                <p class="description">${product.description || 'No description available.'}</p>
                <p class="price" style="font-weight: bold; color: green;">${formattedPrice}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            `;
            
            container.appendChild(productCard);
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        document.getElementById("product-container").innerHTML = "<p>Failed to load products.</p>";
    }
}

// --- THIS IS THE ONLY PART THAT CHANGED ---
async function addToCart(productId) {
    // 1. Check if the user is logged in by looking at LocalStorage
    const loggedInUserId = localStorage.getItem("loggedInUserId");

    if (!loggedInUserId) {
        alert("You must be logged in to add items to your cart!");
        return; // Stop the function here if they aren't logged in
    }

    try {
        // 2. Send the data to your FastAPI database route
        const response = await fetch(CART_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                user_id: parseInt(loggedInUserId), // Convert string ID to a number
                product_id: productId, 
                quantity: 1 
            })
        });

        if (response.ok) {
            console.log("Saved product ID " + productId + " to the database cart!");
            alert("Successfully added to your database cart!");
        } else {
            const errorData = await response.json();
            alert("Backend Error: " + JSON.stringify(errorData));
        }
    } catch (error) {
        console.error("Error adding to database cart:", error);
        alert("Failed to connect to the server.");
    }
}
// ------------------------------------------

loadProducts();