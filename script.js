// ===================== ÜRÜN VERİLERİ (güncellendi: brand, attributes) =====================
const products = [
    {
        id: 1,
        name: "Wireless Headphones Pro",
        price: 1299.99,
        category: "electronics",
        brand: "Acme",
        description: "Premium wireless headphones with noise cancellation",
        emoji: "🎧",
        rating: 4.8,
        reviews: 245,
        attributes: {color: 'Black', connectivity: 'Wireless', warranty: '2 years'}
    },
    {
        id: 2,
        name: "Smart Watch Ultra",
        price: 2499.99,
        category: "electronics",
        brand: "Omega",
        description: "Advanced smartwatch with health tracking features",
        emoji: "⌚",
        rating: 4.7,
        reviews: 189,
        attributes: {color: 'Silver', size: '42mm', warranty: '1 year'}
    },
    {
        id: 3,
        name: "4K Webcam Pro",
        price: 1499.99,
        category: "electronics",
        brand: "Acme",
        description: "Professional 4K webcam for streaming and video calls",
        emoji: "📹",
        rating: 4.6,
        reviews: 156,
        attributes: {resolution: '4K', color: 'Black', warranty: '2 years'}
    },
    {
        id: 4,
        name: "Mechanical Keyboard RGB",
        price: 1999.99,
        category: "electronics",
        brand: "KeyMaster",
        description: "Gaming mechanical keyboard with RGB lighting",
        emoji: "⌨️",
        rating: 4.9,
        reviews: 312,
        attributes: {switch: 'Blue', layout: 'TKL', warranty: '3 years'}
    },
    {
        id: 5,
        name: "Ergonomic Mouse",
        price: 799.99,
        category: "accessories",
        brand: "Clicky",
        description: "Ergonomic wireless mouse with precision tracking",
        emoji: "🖱️",
        rating: 4.5,
        reviews: 128,
        attributes: {color: 'White', connectivity: 'Wireless', warranty: '1 year'}
    },
    {
        id: 6,
        name: "USB-C Hub Pro",
        price: 899.99,
        category: "accessories",
        brand: "HubWorks",
        description: "Multi-port USB-C hub with high-speed connectivity",
        emoji: "🔌",
        rating: 4.7,
        reviews: 201,
        attributes: {ports: '7', material: 'Aluminum', warranty: '1 year'}
    },
    {
        id: 7,
        name: "Portable SSD 2TB",
        price: 2199.99,
        category: "electronics",
        brand: "StorageX",
        description: "1TB portable SSD with fast read/write speeds",
        emoji: "💾",
        rating: 4.8,
        reviews: 287,
        attributes: {capacity: '2TB', interface: 'USB-C', warranty: '2 years'}
    },
    {
        id: 8,
        name: "Phone Stand Premium",
        price: 299.99,
        category: "accessories",
        brand: "StandUp",
        description: "Adjustable phone stand for desk and travel",
        emoji: "📱",
        rating: 4.4,
        reviews: 95,
        attributes: {material: 'Aluminum', color: 'Silver', warranty: '1 year'}
    },
    {
        id: 9,
        name: "Wireless Charger",
        price: 499.99,
        category: "accessories",
        brand: "ChargeIt",
        description: "Fast wireless charging pad for all devices",
        emoji: "🔋",
        rating: 4.6,
        reviews: 172,
        attributes: {watt: '15W', color: 'Black', warranty: '1 year'}
    },
    {
        id: 10,
        name: "Laptop Stand",
        price: 599.99,
        category: "accessories",
        brand: "StandUp",
        description: "Adjustable aluminum laptop stand",
        emoji: "💻",
        rating: 4.7,
        reviews: 143,
        attributes: {material: 'Aluminum', color: 'Silver', warranty: '2 years'}
    }
];


// ===================== FACET STATE & HELPERS =====================
const facetsState = {
    q: '',
    brand: new Set(),
    attributes: {}, // { attrName: Set(values) }
    priceMin: null,
    priceMax: null,
    minRating: 0
};

function debounce(fn, delay = 300){
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

const debouncedSearch = debounce((e) => {
    facetsState.q = e.target.value || '';
    applyFiltersAndSearch();
}, 300);

function buildFacets(items){
    const brands = {};
    const attributes = {};
    let minPrice = Infinity, maxPrice = -Infinity;

    items.forEach(p => {
        // brands
        if(p.brand){
            brands[p.brand] = (brands[p.brand] || 0) + 1;
        }
        // attributes
        if(p.attributes){
            Object.entries(p.attributes).forEach(([k, v]) => {
                attributes[k] = attributes[k] || {};
                attributes[k][v] = (attributes[k][v] || 0) + 1;
            });
        }
        // price
        if(p.price < minPrice) minPrice = p.price;
        if(p.price > maxPrice) maxPrice = p.price;
    });

    return {brands, attributes, minPrice: isFinite(minPrice)?minPrice:0, maxPrice: isFinite(maxPrice)?maxPrice:0};
}

function renderFacetBrand(brands){
    const container = document.getElementById('facet-brand');
    container.innerHTML = '';
    Object.entries(brands).forEach(([brand, count]) => {
        const id = `facet-brand-${brand}`;
        const el = document.createElement('label');
        el.innerHTML = `<input type="checkbox" data-brand="${brand}" id="${id}"> ${brand} <span class='facet-count'>(${count})</span>`;
        container.appendChild(el);
        el.querySelector('input').addEventListener('change', (e) => {
            if(e.target.checked) facetsState.brand.add(brand); else facetsState.brand.delete(brand);
            applyFiltersAndSearch();
        });
    });
}

function renderFacetAttributes(attributes){
    const section = document.getElementById('attributesSection');
    const container = document.getElementById('facet-attributes');
    container.innerHTML = '';
    const keys = Object.keys(attributes);
    if(keys.length === 0){ section.style.display = 'none'; return; }
    section.style.display = 'block';

    keys.forEach(attr => {
        const wrapper = document.createElement('div');
        wrapper.className = 'attr-group';
        const title = document.createElement('h5');
        title.textContent = attr;
        wrapper.appendChild(title);
        Object.entries(attributes[attr]).forEach(([val, count]) => {
            const id = `facet-attr-${attr}-${val}`.replace(/\s+/g, '-');
            const el = document.createElement('label');
            el.innerHTML = `<input type="checkbox" data-attr="${attr}" data-val="${val}" id="${id}"> ${val} <span class='facet-count'>(${count})</span>`;
            wrapper.appendChild(el);
            el.querySelector('input').addEventListener('change', (e) => {
                facetsState.attributes[attr] = facetsState.attributes[attr] || new Set();
                if(e.target.checked) facetsState.attributes[attr].add(val); else facetsState.attributes[attr].delete(val);
                applyFiltersAndSearch();
            });
        });
        container.appendChild(wrapper);
    });
}

function updatePriceInputs(min, max){
    const minInput = document.getElementById('priceMin');
    const maxInput = document.getElementById('priceMax');
    if(minInput) minInput.value = Math.floor(min);
    if(maxInput) maxInput.value = Math.ceil(max);
}

function applyFiltersAndSearch(){
    const productsGrid = document.getElementById('productsGrid');
    if(!productsGrid) return;

    let results = products.slice();

    // category filter
    if(currentFilter !== 'all') results = results.filter(p => p.category === currentFilter);

    // brand filter
    if(facetsState.brand.size){
        results = results.filter(p => p.brand && facetsState.brand.has(p.brand));
    }

    // attributes filter (all selected values for each attribute must match)
    Object.entries(facetsState.attributes).forEach(([attr, set]) => {
        if(set && set.size){
            results = results.filter(p => set.has(p.attributes?.[attr]));
        }
    });

    // price filter
    if(facetsState.priceMin !== null) results = results.filter(p => p.price >= facetsState.priceMin);
    if(facetsState.priceMax !== null) results = results.filter(p => p.price <= facetsState.priceMax);

    // rating filter
    if(facetsState.minRating && facetsState.minRating > 0) results = results.filter(p => Math.floor(p.rating) >= facetsState.minRating);

    // search
    if(facetsState.q && facetsState.q.trim()){ 
        const q = facetsState.q.trim().toLowerCase();
        results = results.filter(p => (p.name + ' ' + p.description + ' ' + (p.brand||'')).toLowerCase().includes(q));
    }

    renderProducts(results);

    // update facet counts based on full product set (could be results depending on UX)
    const facets = buildFacets(products);
    renderFacetBrand(facets.brands);
    renderFacetAttributes(facets.attributes);
}

function renderProducts(list){
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    if(list.length === 0) { productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;'>Ürün bulunamadı 😢</p>'; return; }

    list.forEach(product => {
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
                <div class="product-meta">${product.brand ? '<strong>Marka:</strong> ' + product.brand : ''}</div>
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

// init facets on DOMContentLoaded (also existing listener will call displayProducts so we override)
function initFacets(){
    const facets = buildFacets(products);
    renderFacetBrand(facets.brands);
    renderFacetAttributes(facets.attributes);
    updatePriceInputs(facets.minPrice, facets.maxPrice);

    document.getElementById('priceApply').addEventListener('click', () => {
        const minVal = parseFloat(document.getElementById('priceMin').value);
        const maxVal = parseFloat(document.getElementById('priceMax').value);
        facetsState.priceMin = isNaN(minVal) ? null : minVal;
        facetsState.priceMax = isNaN(maxVal) ? null : maxVal;
        applyFiltersAndSearch();
    });

    document.getElementById('clearFilters').addEventListener('click', () => {
        facetsState.brand.clear();
        facetsState.attributes = {};
        facetsState.priceMin = null;
        facetsState.priceMax = null;
        facetsState.minRating = 0;
        facetsState.q = '';
        document.getElementById('searchInput').value = '';
        applyFiltersAndSearch();
    });

    // rating checkboxes
    document.querySelectorAll('#facet-rating input[type="checkbox"]').forEach(ch => {
        ch.addEventListener('change', (e) => {
            const vals = Array.from(document.querySelectorAll('#facet-rating input[type="checkbox"]:checked')).map(x => parseInt(x.value));
            facetsState.minRating = vals.length ? Math.max(...vals) : 0;
            applyFiltersAndSearch();
        });
    });
}

// Replace initial DOMContentLoaded logic to init facets
document.addEventListener('DOMContentLoaded', () => {
    // previous init
    updateCartCount();
    loadOrders();
    showPage('home');
    // new init
    initFacets();
    applyFiltersAndSearch();
});

// keep existing functions below (addToCart, cart handling, checkout, etc.) unchanged...

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
{