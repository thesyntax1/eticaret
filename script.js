// Ürün Verileri
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 299.99,
        description: "Premium wireless headphones with noise cancellation",
        emoji: "🎧"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 399.99,
        description: "Advanced smartwatch with health tracking features",
        emoji: "⌚"
    },
    {
        id: 3,
        name: "4K Webcam",
        price: 149.99,
        description: "Professional 4K webcam for streaming and video calls",
        emoji: "📹"
    },
    {
        id: 4,
        name: "Mechanical Keyboard",
        price: 199.99,
        description: "Gaming mechanical keyboard with RGB lighting",
        emoji: "⌨️"
    },
    {
        id: 5,
        name: "Wireless Mouse",
        price: 79.99,
        description: "Ergonomic wireless mouse with precision tracking",
        emoji: "🖱️"
    },
    {
        id: 6,
        name: "USB-C Hub",
        price: 89.99,
        description: "Multi-port USB-C hub with high-speed connectivity",
        emoji: "🔌"
    },
    {
        id: 7,
        name: "Portable SSD",
        price: 129.99,
        description: "1TB portable SSD with fast read/write speeds",
        emoji: "💾"
    },
    {
        id: 8,
        name: "Phone Stand",
        price: 29.99,
        description: "Adjustable phone stand for desk and travel",
        emoji: "📱"
    }
];

// Sepet Verileri
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Sayfa Yükleme
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    updateCartCount();
    loadCart();
});

// Ürünleri Ekrana Yazdır
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">₺${product.price}</div>
                    <button class="btn-primary" onclick="addToCart(${product.id})">Sepete Ekle</button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Sepete Ürün Ekle
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`${product.name} sepete eklendi!`);
}

// Sepeti Kaydet (localStorage)
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Sepeti Yükle ve Göster
function loadCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 20px;">Sepetiniz boş</p>';
        return;
    }

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <div>${item.emoji} ${item.name}</div>
                <div class="cart-item-price">₺${item.price} x ${item.quantity}</div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="number" min="1" value="${item.quantity}" 
                       onchange="updateQuantity(${index}, this.value)" 
                       style="width: 50px; padding: 5px;">
                <button class="btn-danger" onclick="removeFromCart(${index})">Sil</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    updateTotalPrice();
}

// Adet Güncelle
function updateQuantity(index, quantity) {
    cart[index].quantity = parseInt(quantity);
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        saveCart();
        loadCart();
    }
}

// Sepetten Ürün Çıkar
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    loadCart();
}

// Sepet Sayısını Güncelle
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-count').textContent = totalItems;
}

// Toplam Fiyatı Hesapla
function updateTotalPrice() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('totalPrice').textContent = total.toFixed(2);
}

// Sepet Modalını Aç
function openCart() {
    loadCart();
    document.getElementById('cartModal').classList.add('active');
}

// Sepet Modalını Kapat
function closeCart() {
    document.getElementById('cartModal').classList.remove('active');
}

// Ödeme Modalını Aç
function checkout() {
    if (cart.length === 0) {
        alert('Sepetiniz boş! Lütfen ürün seçiniz.');
        return;
    }
    closeCart();
    document.getElementById('checkoutModal').classList.add('active');
}

// Ödeme Modalını Kapat
function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
}

// Siparişi Tamamla
function completeOrder(event) {
    event.preventDefault();
    
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    
    const order = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toLocaleDateString('tr-TR'),
        customer: name,
        email: email,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    // Siparişi localStorage'a kaydet
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Sepeti temizle
    cart = [];
    saveCart();
    updateCartCount();

    // Başarı mesajı göster
    closeCheckout();
    showOrderSuccess(order);
}

// Başarılı Sipariş Gösterimi
function showOrderSuccess(order) {
    const modal = document.getElementById('checkoutModal');
    modal.classList.add('active');
    
    const content = modal.querySelector('.modal-content');
    content.innerHTML = `
        <span class="close" onclick="closeCheckout()">&times;</span>
        <div class="success-message">
            <h2>✅ Sipariş Başarıyla Tamamlandı!</h2>
            <p style="margin-top: 15px;">
                <strong>Sipariş No:</strong> ${order.id}<br>
                <strong>Tarih:</strong> ${order.date}<br>
                <strong>Toplam:</strong> ₺${order.total.toFixed(2)}<br>
                <strong>Onay emaili gönderildi:</strong> ${order.email}
            </p>
        </div>
        <button class="btn-primary" onclick="finishOrder()" style="width: 100%; margin-top: 20px;">Ana Sayfaya Dön</button>
    `;
}

// Siparişi Bitir
function finishOrder() {
    closeCheckout();
    scrollToProducts();
}

// Bildirim Göster
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 999;
        animation: slideIn 0.3s ease-in;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Ürünlere Kaydır
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Sepet Linki Tıklaması
document.addEventListener('DOMContentLoaded', () => {
    const cartLink = document.querySelector('.cart-link');
    if (cartLink) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    }
});

// CSS Animasyonları
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
