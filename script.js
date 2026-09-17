
let products = [];
let cart = [];
let discountAmount = 0;


document.addEventListener("DOMContentLoaded", function () {

    const productGrid = document.getElementById("productGrid");

    if (!productGrid) {
        console.error("productGrid not found in HTML");
        return;
    }

    fetch("./products.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("products.json could not be loaded");
            }
            return response.json();
        })
        .then(data => {
            console.log("JSON Loaded:", data);

            products = data;

            displayProducts();
        })
        .catch(error => {
            console.error("ERROR:", error);

            productGrid.innerHTML = `
                <div class="loading">
                    ❌ Products could not be loaded.
                    <br>
                    Make sure products.json is in the same folder as index.html.
                </div>
            `;
        });


    document.getElementById("cartButton").addEventListener("click", function () {
        document.getElementById("cartModal").style.display = "flex";
        displayCart();
    });


    document.getElementById("closeCart").addEventListener("click", function () {
        document.getElementById("cartModal").style.display = "none";
    });


    document.getElementById("promoButton").addEventListener("click", function () {

        const promoInput = document.getElementById("promoInput");
        const code = promoInput.value.trim().toUpperCase();

        if (code === "SAVE20") {

            const subtotal = calculateSubtotal();

            discountAmount = subtotal * 0.20;

            alert("Promo code applied! 20% discount.");

        } else {

            discountAmount = 0;

            alert("Invalid promo code.");

        }

        displayCart();
    });


    document.getElementById("checkoutButton").addEventListener("click", function () {

        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        document.getElementById("cartModal").style.display = "none";
        document.getElementById("checkoutModal").style.display = "flex";

        showStep(1);
    });


    document.getElementById("closeCheckout").addEventListener("click", function () {
        document.getElementById("checkoutModal").style.display = "none";
    });


    document.getElementById("paymentNext").addEventListener("click", function () {

        if (validateDetails()) {
            showStep(2);
        }

    });


    document.getElementById("confirmNext").addEventListener("click", function () {

        if (validatePayment()) {

            createOrderSummary();

            showStep(3);
        }

    });


    document.getElementById("detailsBack").addEventListener("click", function () {
        showStep(1);
    });


    document.getElementById("paymentBack").addEventListener("click", function () {
        showStep(2);
    });


    document.getElementById("placeOrder").addEventListener("click", function () {

        alert("🎉 Order placed successfully!");

        cart = [];
        discountAmount = 0;

        updateCartCount();

        document.getElementById("checkoutModal").style.display = "none";

        displayCart();
    });

});


function displayProducts() {

    const productGrid = document.getElementById("productGrid");

    productGrid.innerHTML = "";

    if (products.length === 0) {

        productGrid.innerHTML = `
            <div class="loading">
                No products found.
            </div>
        `;

        return;
    }


    products.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `

            <img 
                src="${product.image}" 
                alt="${product.name}"
                onerror="this.src='https://via.placeholder.com/300x220?text=Image+Not+Found'"
            >

            <div class="product-info">

                <h3>${product.name}</h3>

                <p>${product.description}</p>

                <div class="product-bottom">

                    <strong>₹${product.price}</strong>

                    <span>Stock: ${product.stock}</span>

                </div>

                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>

            </div>
        `;

        productGrid.appendChild(card);

    });

}


function addToCart(productId) {

    const product = products.find(p => p.id === productId);

    if (!product) {
        alert("Product not found.");
        return;
    }


    const existingItem = cart.find(item => item.id === productId);


    if (existingItem) {

        if (existingItem.quantity < product.stock) {

            existingItem.quantity++;

        } else {

            alert("Maximum stock reached.");

        }

    } else {

        cart.push({
            id: product.id,
            quantity: 1
        });

    }


    updateCartCount();

    alert(product.name + " added to cart!");
}


function updateCartCount() {

    const count = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    document.getElementById("cartCount").textContent = count;
}


function displayCart() {

    const cartItems = document.getElementById("cartItems");

    cartItems.innerHTML = "";


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="loading">
                Your cart is empty.
            </p>
        `;

        updateTotals();

        return;
    }


    cart.forEach(item => {

        const product = products.find(
            p => p.id === item.id
        );

        if (!product) return;


        const div = document.createElement("div");

        div.className = "cart-item";


        div.innerHTML = `

            <img 
                src="${product.image}"
                alt="${product.name}"
                onerror="this.src='https://via.placeholder.com/100?text=Image'"
            >

            <div>

                <h3>${product.name}</h3>

                <p>₹${product.price}</p>

                <div class="quantity">

                    <button onclick="decreaseQuantity(${product.id})">
                        -
                    </button>

                    <span>${item.quantity}</span>

                    <button onclick="increaseQuantity(${product.id})">
                        +
                    </button>

                </div>

                <button onclick="removeFromCart(${product.id})">
                    Remove
                </button>

            </div>
        `;


        cartItems.appendChild(div);

    });


    updateTotals();
}


function increaseQuantity(productId) {

    const item = cart.find(
        item => item.id === productId
    );

    const product = products.find(
        p => p.id === productId
    );


    if (!item || !product) return;


    if (item.quantity < product.stock) {

        item.quantity++;

    } else {

        alert("Maximum stock reached.");

    }


    displayCart();

    updateCartCount();
}


function decreaseQuantity(productId) {

    const item = cart.find(
        item => item.id === productId
    );


    if (!item) return;


    item.quantity--;


    if (item.quantity <= 0) {

        cart = cart.filter(
            item => item.id !== productId
        );

    }


    displayCart();

    updateCartCount();
}




function removeFromCart(productId) {

    cart = cart.filter(
        item => item.id !== productId
    );


    displayCart();

    updateCartCount();
}


function calculateSubtotal() {

    let subtotal = 0;


    cart.forEach(item => {

        const product = products.find(
            p => p.id === item.id
        );


        if (product) {

            subtotal += product.price * item.quantity;

        }

    });


    return subtotal;
}


function updateTotals() {

    const subtotal = calculateSubtotal();

    const discount = discountAmount;

    const afterDiscount = subtotal - discount;

    const tax = afterDiscount * 0.05;

    const grandTotal = afterDiscount + tax;


    document.getElementById("subtotal").textContent =
        "₹" + subtotal.toFixed(2);


    document.getElementById("discount").textContent =
        "₹" + discount.toFixed(2);


    document.getElementById("tax").textContent =
        "₹" + tax.toFixed(2);


    document.getElementById("grandTotal").textContent =
        "₹" + grandTotal.toFixed(2);
}


function showStep(step) {

    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "none";
    document.getElementById("step3").style.display = "none";


    document.getElementById("step" + step).style.display = "block";


    document.getElementById("indicator1").classList.remove("active");
    document.getElementById("indicator2").classList.remove("active");
    document.getElementById("indicator3").classList.remove("active");


    document.getElementById("indicator" + step)
        .classList.add("active");

}

function validateDetails() {

    let valid = true;


    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const address =
        document.getElementById("address").value.trim();


    if (name === "") {

        document.getElementById("nameError").textContent =
            "Name is required.";

        valid = false;

    } else {

        document.getElementById("nameError").textContent = "";

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        document.getElementById("emailError").textContent =
            "Enter a valid email.";

        valid = false;

    } else {

        document.getElementById("emailError").textContent = "";

    }

    if (!/^[0-9]{10}$/.test(phone)) {

        document.getElementById("phoneError").textContent =
            "Enter a valid 10-digit phone number.";

        valid = false;

    } else {

        document.getElementById("phoneError").textContent = "";

    }


    

    if (address === "") {

        document.getElementById("addressError").textContent =
            "Address is required.";

        valid = false;

    } else {

        document.getElementById("addressError").textContent = "";

    }


    return valid;
}


function validatePayment() {

    let valid = true;


    const card =
        document.getElementById("card").value.trim();

    const expiry =
        document.getElementById("expiry").value.trim();

    const cvv =
        document.getElementById("cvv").value.trim();


    if (!/^[0-9]{16}$/.test(card)) {

        document.getElementById("cardError").textContent =
            "Card number must contain 16 digits.";

        valid = false;

    } else {

        document.getElementById("cardError").textContent = "";

    }

    const expiryPattern =
        /^(0[1-9]|1[0-2])\/[0-9]{2}$/;


    if (!expiryPattern.test(expiry)) {

        document.getElementById("expiryError").textContent =
            "Use MM/YY format.";

        valid = false;

    } else {

        document.getElementById("expiryError").textContent = "";

    }


    if (!/^[0-9]{3}$/.test(cvv)) {

        document.getElementById("cvvError").textContent =
            "CVV must contain 3 digits.";

        valid = false;

    } else {

        document.getElementById("cvvError").textContent = "";

    }


    return valid;
}


function createOrderSummary() {

    const summary =
        document.getElementById("orderSummary");


    const subtotal = calculateSubtotal();

    const discount = discountAmount;

    const afterDiscount = subtotal - discount;

    const tax = afterDiscount * 0.05;

    const total = afterDiscount + tax;


    summary.innerHTML = `

        <h3>Order Summary</h3>

        <p>
            Subtotal:
            <strong>₹${subtotal.toFixed(2)}</strong>
        </p>

        <p>
            Discount:
            <strong>₹${discount.toFixed(2)}</strong>
        </p>

        <p>
            Tax:
            <strong>₹${tax.toFixed(2)}</strong>
        </p>

        <hr>

        <p>
            Grand Total:
            <strong>₹${total.toFixed(2)}</strong>
        </p>

    `;
}
