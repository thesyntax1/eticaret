// ===================== ÜRÜN VERİLERİ =====================
const products = [
    {
        id: 1,
        name: "Wireless Headphones Pro",
        price: 1299.99,
        category: "electronics",
        description: "Premium wireless headphones with noise cancellation",
        emoji: "🎧",
        rating: 4.8,
        reviews: 245,
        image: "🎧"
    },
    {
        id: 2,
        name: "Smart Watch Ultra",
        price: 2499.99,
        category: "electronics",
        description: "Advanced smartwatch with health tracking features",
        emoji: "⌚",
        rating: 4.7,
        reviews: 189,
        image: "⌚"
    },
    {
        id: 3,
        name: "4K Webcam Pro",
        price: 1499.99,
        category: "electronics",
        description: "Professional 4K webcam for streaming and video calls",
        emoji: "📹",
        rating: 4.6,
        reviews: 156,
        image: "📹"
    },
    {
        id: 4,
        name: "Mechanical Keyboard RGB",
        price: 1999.99,
        category: "electronics",
        description: "Gaming mechanical keyboard with RGB lighting",
        emoji: "⌨️",
        rating: 4.9,
        reviews: 312,
        image: "⌨️"
    },
    {
        id: 5,
        name: "Ergonomic Mouse",
        price: 799.99,
        category: "accessories",
        description: "Ergonomic wireless mouse with precision tracking",
        emoji: "🖱️",
        rating: 4.5,
        reviews: 128,
        image: "🖱️"
    },
    {
        id: 6,
        name: "USB-C Hub Pro",
        price: 899.99,
        category: "accessories",
        description: "Multi-port USB-C hub with high-speed connectivity",
        emoji: "🔌",
        rating: 4.7,
        reviews: 201,
        image: "🔌"
    },
    {
        id: 7,
        name: "Portable SSD 2TB",
        price: 2199.99,
        category: "electronics",
        description: "1TB portable SSD with fast read/write speeds",
        emoji: "💾",
        rating: 4.8,
        reviews: 287,
        image: "💾"
    },
    {
        id: 8,
        name: "Phone Stand Premium",
        price: 299.99,
        category: "accessories",
        description: "Adjustable phone stand for desk and travel",
        emoji: "📱",
        rating: 4.4,
        reviews: 95,
        image: "📱"
    },
    {
        id: 9,
        name: "Wireless Charger",
        price: 499.99,
        category: "accessories",
        description: "Fast wireless charging pad for all devices",
        emoji: "🔋",
        rating: 4.6,
        reviews: 172,
        image: "🔋"
    },
    {
        id: 10,
        name: "Laptop Stand",
        price: 599.99,
        category: "accessories",
        description: "Adjustable aluminum laptop stand",
        emoji: "💻",
        rating: 4.7,
        reviews: 143,
        image: "💻"
    }
];

// ===================== GLOBAL DEĞİŞKENLER =====================
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let currentFilter = 'all';
let currentTab = 'profile';

// ===================== SAYFA BAŞLADIĞINDA =====================
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    updateCartCount();
    loadOrders();
    showPage('home');
});

// ===================== SAYFA NAVİGASYONU =====================
function showPage(pageName) {
    // Tüm sayfaları gizle
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Seçilen sayfayı göster
    const selectedPage = document.getElementById(pageName + '-page');
    if (selectedPage) {
        selectedPage.classList.add('active');
        window.scrollTo(0, 0);
        
        // Ürünler sayfası seçilirse ürünleri yeniden yükle
        if (pageName === 'products') {
            displayProducts();
        }
    }
}

// ===================== ÜRÜN GÖRÜNTÜLEME =====================
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';

    let filteredProducts = products;
    
    // Kategori filtreleme
    if (currentFilter !== 'all') {
        filteredProducts = products.filter(p => p.category === currentFilter);
    }
    
    // Arama filtreleme
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        const searchTerm = searchInput.value.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Ürün bulunamadı 😢</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-header">
                <div class="product-badge">${product.rating}⭐</div>
                <div class="product-image">${product.emoji}</div>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-rating">
                    <span class="stars">${'⭐'.repeat(Math.floor(product.rating))}</span>
                    <span class="reviews">(${product.reviews} değerlendirme)</span>
                </div>
                <div class="product-footer">
                    <div class="product-price">₺${product.price.toLocaleString('tr-TR')}</div>
                    <button class="btn-primary" onclick="addToCart(${product.id})">➕ Ekle</button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// ===================== FİLTRELEME =====================
function filterProducts(category) {
    currentFilter = category;
    
    // Butonları güncelle
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayProducts();
    showNotification(`${category === 'all' ? 'Tüm' : category === 'electronics' ? 'Elektronik' : 'Aksesuar'} ürünler gösteriliyor`);
}

// ===================== ÜRÜN ARAMA =====================
function searchProducts() {
    displayProducts();
}

// ===================== SEPET FONKSİYONLARI =====================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
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
    showNotification(`✅ ${product.name} sepete eklendi!`);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Sepetiniz boş 🛒</p>';
        return;
    }

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-content">
                <div class="cart-item-emoji">${item.emoji}</div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₺${item.price.toLocaleString('tr-TR')}</div>
                </div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="updateQuantity(${index}, ${item.quantity - 1})">−</button>
                <input type="number" class="qty-input" min="1" value="${item.quantity}" 
                       onchange="updateQuantity(${index}, this.value)">
                <button class="qty-btn" onclick="updateQuantity(${index}, ${item.quantity + 1})">+</button>
                <button class="btn-danger" onclick="removeFromCart(${index})">🗑️</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    updateTotalPrice();
}

function updateQuantity(index, quantity) {
    quantity = parseInt(quantity);
    if (quantity <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = quantity;
        saveCart();
        loadCart();
    }
}

function removeFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    loadCart();
    showNotification(`🗑️ ${removedItem.name} sepetten çıkarıldı`);
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-count').textContent = totalItems;
}

function updateTotalPrice() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('totalPrice').textContent = total.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function openCart() {
    loadCart();
    document.getElementById('cartModal').classList.add('active');
}

function closeCart() {
    document.getElementById('cartModal').classList.remove('active');
}

// ===================== ÖDEME İŞLEMLERİ =====================
function checkout() {
    if (cart.length === 0) {
        alert('❌ Sepetiniz boş! Lütfen ürün seçiniz.');
        return;
    }
    closeCart();
    document.getElementById('checkoutModal').classList.add('active');
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
}

function completeOrder(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const order = {
        id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toLocaleDateString('tr-TR'),
        time: new Date().toLocaleTimeString('tr-TR'),
        customer: form.querySelector('input[type="text"]').value,
        email: form.querySelector('input[type="email"]').value,
        phone: form.querySelector('input[type="tel"]').value,
        address: form.querySelector('textarea').value,
        items: JSON.parse(JSON.stringify(cart)),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'Hazırlanıyor',
        estimatedDelivery: getEstimatedDelivery()
    };

    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Sepeti temizle
    cart = [];
    saveCart();
    updateCartCount();

    // Başarı mesajı göster
    showOrderSuccess(order);
}

function showOrderSuccess(order) {
    const modal = document.getElementById('checkoutModal');
    const content = modal.querySelector('.modal-content');
    content.innerHTML = `
        <span class="close" onclick="closeCheckout()">&times;</span>
        <div class="success-message">
            <div class="success-icon">✅</div>
            <h2>Sipariş Başarıyla Tamamlandı!</h2>
            <div class="order-confirmation">
                <div class="confirmation-item">
                    <strong>📦 Sipariş No:</strong> ${order.id}
                </div>
                <div class="confirmation-item">
                    <strong>👤 Ad Soyad:</strong> ${order.customer}
                </div>
                <div class="confirmation-item">
                    <strong>📧 Email:</strong> ${order.email}
                </div>
                <div class="confirmation-item">
                    <strong>📅 Tarih:</strong> ${order.date}
                </div>
                <div class="confirmation-item">
                    <strong>💰 Toplam:</strong> ₺${order.total.toLocaleString('tr-TR', {minimumFractionDigits: 2})}
                </div>
                <div class="confirmation-item">
                    <strong>🚚 Tahmini Teslimat:</strong> ${order.estimatedDelivery}
                </div>
                <div class="confirmation-item">
                    <strong>📬 Onay E-maili:</strong> ${order.email} adresine gönderildi
                </div>
            </div>
        </div>
        <button class="btn-primary" onclick="finishOrder()" style="width: 100%; margin-top: 20px;">✅ Anlaştım</button>
    `;
}

function finishOrder() {
    closeCheckout();
    showPage('home');
    showNotification('🎉 Siparişiniz başarıyla tamamlandı!');
}

function getEstimatedDelivery() {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString('tr-TR');
}

// ===================== HESAP YÖNETİMİ =====================
function showTab(tabName) {
    currentTab = tabName;
    
    // Tüm tab'ları gizle
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Tüm butonları güncelle
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Seçilen tab'ı göster
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Seçilen butonu vurgula
    event.target.classList.add('active');
    
    // Siparişler tab'ı seçilirse yükle
    if (tabName === 'orders') {
        loadOrders();
    }
}

function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Henüz siparişiniz yok 📦</p>';
        return;
    }

    orders.forEach((order, index) => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="order-header">
                <div>
                    <strong>📦 ${order.id}</strong>
                    <span class="order-status">${order.status}</span>
                </div>
                <div class="order-date">${order.date}</div>
            </div>
            <div class="order-details">
                <p><strong>Ürün Sayısı:</strong> ${order.items.length}</p>
                <p><strong>Toplam Tutar:</strong> ₺${order.total.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</p>
                <p><strong>Tahmini Teslimat:</strong> ${order.estimatedDelivery}</p>
            </div>
            <button class="btn-secondary" onclick="toggleOrderItems(${index})">📋 Detayları Gör</button>
            <div id="order-items-${index}" class="order-items-details" style="display: none; margin-top: 15px;">
                ${order.items.map(item => `
                    <div class="order-item-row">
                        <span>${item.emoji} ${item.name}</span>
                        <span>x${item.quantity}</span>
                        <span>₺${(item.price * item.quantity).toLocaleString('tr-TR', {minimumFractionDigits: 2})}</span>
                    </div>
                `).join('')}
            </div>
        `;
        ordersList.appendChild(orderItem);
    });
}

function toggleOrderItems(index) {
    const element = document.getElementById(`order-items-${index}`);
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
}

function saveProfile() {
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    const address = document.getElementById('profileAddress').value;
    
    localStorage.setItem('userProfile', JSON.stringify({name, email, phone, address}));
    showNotification('✅ Profil bilgileriniz kaydedildi!');
}

function changePassword() {
    alert('⚠️ Şifre değiştirme özelliği yakında eklenecektir.');
}

function deleteAccount() {
    if (confirm('⚠️ Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
        localStorage.removeItem('cart');
        localStorage.removeItem('orders');
        localStorage.removeItem('userProfile');
        alert('✅ Hesabınız başarıyla silindi.');
        showPage('home');
    }
}

// ===================== İLETİŞİM FORMÜ =====================
function sendMessage(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const subject = form.querySelectorAll('input[type="text"]')[1].value;
    const message = form.querySelector('textarea').value;
    
    const messageData = {
        name, email, subject, message,
        date: new Date().toLocaleString('tr-TR')
    };
    
    let messages = JSON.parse(localStorage.getItem('messages')) || [];
    messages.push(messageData);
    localStorage.setItem('messages', JSON.stringify(messages));
    
    form.reset();
    showNotification('✅ Mesajınız başarıyla gönderildi! 📧');
}

// ===================== BÜLTEN ABONE OLMA =====================
function subscribeNewsletter() {
    const email = document.getElementById('newsletterEmail').value;
    if (!email) {
        showNotification('❌ Lütfen e-mail adresinizi girin');
        return;
    }
    
    let subscribers = JSON.parse(localStorage.getItem('subscribers')) || [];
    if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('subscribers', JSON.stringify(subscribers));
    }
    
    document.getElementById('newsletterEmail').value = '';
    showNotification('✅ Bültene abone oldunuz! Yeni tekliflerden haberdar kalacaksınız.');
}

// ===================== BİLDİRİM GÖRÜNTÜLEME =====================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animasyon
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-in';
    }, 10);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===================== FOOTER BAĞLANTILARI =====================
document.addEventListener('DOMContentLoaded', () => {
    // Footer linklerini dinamik hale getir
    document.querySelectorAll('.footer-links a').forEach(link => {
        if (link.textContent.includes('Gizlilik')) {
            link.onclick = (e) => {
                e.preventDefault();
                showNotification('📋 Gizlilik Politikası: Kişisel verileriniz korunur.');
            };
        }
    });
});

// ===================== GENEL YARDIMCI FONKSİYONLAR =====================
function getCurrentDate() {
    return new Date().toLocaleDateString('tr-TR');
}

function formatPrice(price) {
    return price.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// ===================== DARK MODE DESTEĞI (FUTURE) =====================
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Sayfa yüklediğinde dark mode'u kontrol et
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// ===================== KEYBOARD SHORTCUTS =====================
document.addEventListener('keydown', (e) => {
    // Ctrl+H = Ana Sayfa
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        showPage('home');
    }
    // Ctrl+P = Ürünler
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        showPage('products');
    }
    // Ctrl+C = Sepet
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        openCart();
    }
});

console.log('🎉 TechStore yüklendi!');
