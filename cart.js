const CART_API_URL = "http://127.0.0.1:8000/cart/";
const API_URL = "http://127.0.0.1:8000/products/";

// Look at the shared "whiteboard" to see who is logged in
const loggedInUserId = localStorage.getItem("loggedInUserId");

async function loadCart() {
    const container = document.getElementById("cart-container");

    // If they aren't logged in, stop right here
    if (!loggedInUserId) {
        container.innerHTML = "<p>Please log in to view your cart.</p>";
        return;
    }

    try {
        // Ask FastAPI for this specific user's cart items
        // Added { cache: "no-store" } so the browser doesn't show old, stuck data!
        const response = await fetch(`${CART_API_URL}${loggedInUserId}`, { cache: "no-store" });
        const cartItems = await response.json();

        if (cartItems.length === 0) {
            container.innerHTML = "<p>Your cart is empty!</p>";
            document.getElementById("cart-total").innerText = "Total: $0.00";
            return;
        }

        container.innerHTML = ""; 
        let totalPrice = 0;

        // Draw the HTML for each item
        for (let item of cartItems) {
            // We have to fetch the product details using the product_id saved in the cart
            const productResponse = await fetch(`${API_URL}${item.product_id}`);
            const product = await productResponse.json();
            
            // Calculate total for this specific item (price * quantity)
            const itemTotal = product.price * item.quantity;
            totalPrice += itemTotal;

            const itemDiv = document.createElement("div");
            itemDiv.className = "cart-item";
            
            // This is your exact HTML so the images look perfect!
            itemDiv.innerHTML = `
                <img src="${product.image_url || 'https://via.placeholder.com/100'}" alt="${product.name}">
                <div>
                    <h3>${product.name}</h3>
                    <p>Price: $${product.price.toFixed(2)}</p>
                    <div class="controls">
                        <p>Quantity: ${item.quantity}</p>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <button onclick="removeItem(${item.id})" style="color: red;">Remove</button>
                    </div>
                </div>
            `;
            container.appendChild(itemDiv);
        }

        // Update the big total at the bottom
        document.getElementById("cart-total").innerText = `Total: $${totalPrice.toFixed(2)}`;

    } catch (error) {
        console.error("Error loading cart:", error);
        container.innerHTML = "<p>Error loading cart. Is the server running?</p>";
    }
}

// ==========================================
// THE MISSING FUNCTIONS FOR THE BUTTONS
// ==========================================

async function updateQuantity(cartItemId, newQuantity) {
    // If quantity goes to 0 or below, remove the item entirely
    if (newQuantity <= 0) {
        removeItem(cartItemId);
        return;
    }

    try {
        const response = await fetch(`${CART_API_URL}${cartItemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (response.ok) {
            // Reload the cart to show the new numbers immediately
            loadCart();
        } else {
            console.error("Failed to update quantity");
        }
    } catch (error) {
        console.error("Error updating quantity:", error);
    }
}

async function removeItem(cartItemId) {
    try {
        const response = await fetch(`${CART_API_URL}${cartItemId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            // Reload the cart so the item disappears immediately
            loadCart();
        } else {
            console.error("Failed to remove item");
        }
    } catch (error) {
        console.error("Error removing item:", error);
    }
}

// Run this the moment the page opens
loadCart();