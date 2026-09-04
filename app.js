const PRODUCT_API_URL = "http://127.0.0.1:8000/products/";
const CART_API_URL = "http://127.0.0.1:8000/cart/"; 


// --- PROFILE MENU & DASHBOARD AUTH LOGIC ---
function toggleDropdown() {
    document.getElementById("profile-dropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.profile-icon')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('show')) {
                dropdowns[i].classList.remove('show');
            }
        }
    }
}

// Check session and update the avatar initial on page load
document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
    
    if (username) {
        // Change the '?' to the first letter of their username
        document.getElementById("profile-icon").innerText = username.charAt(0).toUpperCase();
        document.getElementById("welcome-message").innerText = `Welcome back, ${username}!`;
    } else {
        // If they are not logged in, kick them back to the login page
        window.location.href = "log.html";
    }
});

// --- PROFILE MENU & AUTH LOGIC ---
function toggleDropdown() {
    document.getElementById("profile-dropdown").classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.matches('.profile-icon')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('show')) {
                dropdowns[i].classList.remove('show');
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
    if(username) {
        document.getElementById("profile-icon").innerText = username.charAt(0).toUpperCase();
        document.getElementById("welcome-message").innerText = `Welcome back, ${username}!`;
    } else {
        window.location.href = "log.html"; // Protect the dashboard
    }
});

// --- PRODUCT & CART LOGIC ---
async function loadProducts() {
    try {
        const response = await fetch(PRODUCT_API_URL);
        const products = await response.json();

        const container = document.getElementById("product-container");
        container.innerHTML = ""; 

        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.className = "product-card";
            productCard.style = "border: 1px solid #ddd; padding: 15px; border-radius: 8px;"; // Basic card styling
            
            const formattedPrice = `$${product.price.toFixed(2)}`;
            const imgSource = product.image_url ? product.image_url : "https://via.placeholder.com/150";

            productCard.innerHTML = `
                <img src="${imgSource}" alt="${product.name}" style="width: 100%; max-width: 200px;">
                <p class="category" style="color: gray; font-size: 0.8em; text-transform: uppercase;">${product.category || 'Uncategorized'}</p>
                <h3>${product.name}</h3>
                <p class="brand">Brand: ${product.brand || 'No Brand'}</p>
                <p class="description">${product.description || 'No description available.'}</p>
                <p class="price" style="font-weight: bold; color: green;">${formattedPrice}</p>
                <button onclick="addToCart(${product.id})" style="padding: 8px 12px; cursor: pointer;">Add to Cart</button>
            `;
            
            container.appendChild(productCard);
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        document.getElementById("product-container").innerHTML = "<p>Failed to load products.</p>";
    }
}

async function addToCart(productId) {
    // FIXED KEY: Changed from 'loggedInUserId' to 'user_id' to match your auth flow
    const loggedInUserId = localStorage.getItem("user_id");

    if (!loggedInUserId) {
        alert("You must be logged in to add items to your cart!");
        return; 
    }

    try {
        const response = await fetch(CART_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                user_id: parseInt(loggedInUserId), 
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

loadProducts();