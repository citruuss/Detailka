// работа с api
const API_BASE_URL = 'http://localhost/courswork/back/api';

// РАБОТА С ПОЛЬЗОВАТЕЛЕМ

// Получить текущего пользователя
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            console.log('Текущий пользователь:', user);
            return user;
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Вход пользователя
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.message || 'Ошибка входа' };
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        return { success: false, error: 'Ошибка соединения с сервером' };
    }
}

// Регистрация пользователя
async function registerUser(name, email, password, age = null) {
    try {
        const response = await fetch(`${API_BASE_URL}/index.php/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, password: password, age: age })
        });
        
        const data = await response.json();
        
        if (response.ok && !data.error) {
            await loginUser(email, password);
            return { success: true, user: data };
        } else {
            return { success: false, error: data.error || 'Ошибка регистрации' };
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        return { success: false, error: 'Ошибка соединения с сервером' };
    }
}

// Выход из системы
async function logoutUser() {
    try {
        await fetch(`${API_BASE_URL}/logout.php`, {
            method: 'POST'
        });
    } catch (error) {
        console.error('Ошибка выхода:', error);
    }

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');

    updateUI();

    showNotification('Вы вышли из системы');

    // если пользователь находится в админке
    if (window.location.pathname.includes('admin.html')) {
        window.location.href = 'index.html';
    }
}

// РАБОТА С КОРЗИНОЙ 

function getCart() {
    const cart = localStorage.getItem('cart');
    if (!cart) return [];
    try {
        return JSON.parse(cart);
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
}

function addToCart(productId, quantity = 1) {
    let cart = getCart();
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + quantity;
    } else {
        let productName = '', productPrice = 0, productArticle = '';
        
        const productCard = document.querySelector(`.product-item[data-id="${productId}"]`);
        if (productCard) {
            productName = productCard.getAttribute('data-name') || 'Товар';
            productPrice = parseInt(productCard.getAttribute('data-price')) || 0;
            productArticle = productCard.getAttribute('data-article') || '---';
        } else if (window.productsData && window.productsData[productId]) {
            productName = window.productsData[productId].name;
            productPrice = window.productsData[productId].price;
            productArticle = window.productsData[productId].article;
        } else {
            productName = `Товар ${productId}`;
            productPrice = 0;
            productArticle = '---';
        }
        
        cart.push({
            id: productId,
            quantity: quantity,
            name: productName,
            price: productPrice,
            article: productArticle
        });
    }
    
    saveCart(cart);
    showNotification('Товар добавлен в корзину!', 'success');
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    
    if (window.location.pathname.includes('cart.html') && typeof loadCartItems === 'function') {
        loadCartItems();
    }
    
    showNotification('Товар удалён из корзины');
}

function clearCart() {
    if (confirm('Вы уверены, что хотите очистить корзину?')) {
        saveCart([]);
        if (window.location.pathname.includes('cart.html') && typeof loadCartItems === 'function') {
            loadCartItems();
        }
        showNotification('Корзина очищена');
    }
}

// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА 

function updateLogoutButton() {
    const user = getCurrentUser();
    const logoutItem = document.getElementById('logoutNavItem');
    if (logoutItem) {
        logoutItem.style.display = user ? 'block' : 'none';
        console.log('Кнопка выхода:', user ? 'показана' : 'скрыта');
    }
}

function updateAdminButton() {
    const user = getCurrentUser();
    const adminItem = document.getElementById('adminNavItem');
    
    console.log('updateAdminButton - user:', user ? user.email : 'нет');
    console.log('updateAdminButton - adminItem найден:', adminItem ? 'да' : 'нет');
    
    if (adminItem) {
        if (user && user.role === 'admin') {
            adminItem.style.display = 'block';
            console.log('Админ-панель ПОКАЗАНА');
        } else {
            adminItem.style.display = 'none';
            console.log('Админ-панель СКРЫТА');
        }
    } else {
        console.warn('Элемент adminNavItem НЕ НАЙДЕН! Добавьте в HTML: <li class="nav-item" id="adminNavItem" style="display: none;"><a class="nav-link" href="admin.html">👑 Админ-панель</a></li>');
    }
}
function updateAdminOnlyLinks() {
    const user = getCurrentUser();
    const links = document.querySelectorAll('.admin-only-link');

    links.forEach(link => {
        if (user && user.role === 'admin') {
            link.style.display = 'inline-block';
        } else {
            link.style.display = 'none';
        }
    });
}

function updateProfileLink() {
    const user = getCurrentUser();
    const profileLink = document.querySelector('.nav-link[href="profile.html"]');
    if (profileLink) {
        if (user) {
            profileLink.innerHTML = `Аккаунт`;
        } else {
            profileLink.innerHTML = 'Профиль';
        }
    }
}

function updateUI() {
    console.log('updateUI вызвана');
    updateCartCount();
    updateProfileLink();
    updateAdminButton();
    updateLogoutButton();
    updateAdminOnlyLinks();
}

// УВЕДОМЛЕНИЯ 

function showNotification(message, type = 'info') {
    const oldNotifications = document.querySelectorAll('.custom-notification');
    oldNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.style.minWidth = '250px';
    notification.style.animation = 'slideIn 0.3s ease';
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавляем CSS для анимации уведомлений
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyle);

window.productsData = {
    1: { name: "Фара правая", price: 2450, article: "BP-001" },
    2: { name: "Фара левая", price: 2450, article: "BP-002" },
    3: { name: "Дворники", price: 3450, article: "OF-002" },
    4: { name: "Сигнализация", price: 3850, article: "SA-003" },
    5: { name: "Клаксон", price: 5200, article: "BT-004" },
    6: { name: "Аккумулятор", price: 17890, article: "TB-005" },
    7: { name: "Свеча зажигания", price: 1850, article: "BD-006" },
    8: { name: "Тормозные колодки", price: 1250, article: "SB-007" },
    9: { name: "Амортизатор", price: 1200, article: "SP-008" },
    10: { name: "Печка", price: 1200, article: "SP-009" },
    11: { name: "Кондиционер Ледышка", price: 15900, article: "AC-011" },
    12: { name: "Шина летняя Резиновый бублик", price: 4500, article: "TR-012" },
    13: { name: "Шина зимняя Злой резиновый бублик", price: 5800, article: "TR-013" },
    14: { name: "Выхлопная труба Пых-Пых", price: 3200, article: "EX-014" }
};

// ИНИЦИАЛИЗАЦИЯ 
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация...');
    updateUI();

    if (window.location.pathname.includes('admin.html')) {
        initAddProductForm();
    }
    
    // Обработчики форм
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const result = await loginUser(email, password);
            if (result.success) {
                showNotification(`Добро пожаловать, ${result.user.name}!`, 'success');
                updateUI();
                window.location.href = 'index.html';
            } else {
                const errorDiv = document.getElementById('errorMessage');
                if (errorDiv) {
                    errorDiv.textContent = result.error;
                    errorDiv.classList.remove('d-none');
                }
            }
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const age = document.getElementById('age').value;
            const password = document.getElementById('password').value;
            const result = await registerUser(name, email, password, age || null);
            if (result.success) {
                showNotification('Регистрация успешна!', 'success');
                updateUI();
                window.location.href = 'index.html';
            } else {
                const errorDiv = document.getElementById('errorMessage');
                if (errorDiv) {
                    errorDiv.textContent = result.error;
                    errorDiv.classList.remove('d-none');
                }
            }
        });
    }
});

function getCustomProducts() {
    const products = localStorage.getItem('customProducts');

    if (!products) {
        return [];
    }

    try {
        return JSON.parse(products);
    } catch (e) {
        return [];
    }
}

function saveCustomProducts(products) {
    localStorage.setItem('customProducts', JSON.stringify(products));
}

function addCustomProduct(product) {
    const products = getCustomProducts();
    products.push(product);
    saveCustomProducts(products);
}

function renderCustomProducts() {
    const container = document.getElementById('productsContainer');

    if (!container) {
        return;
    }

    const products = getCustomProducts();

    products.forEach(product => {
        const productHtml = `
            <div class="col-md-4 col-lg-3 product-item"
                 data-id="${product.id}"
                 data-category="${product.category}"
                 data-name="${product.name}"
                 data-price="${product.price}"
                 data-article="${product.article}">
                <div class="card product-card h-100">
                    <div class="text-center pt-3">
                        <img src="${product.image || 'images/placeholder.jpg'}"
                             alt="${product.name}"
                             class="product-card-img"
                             onerror="this.src='images/placeholder.jpg'">
                    </div>
                    <div class="card-body text-center">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text small text-muted">Артикул: ${product.article}</p>
                        <p class="card-text small">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="h5 mb-0">${Number(product.price).toLocaleString()} ₽</span>
                            <button class="btn btn-dark btn-sm" onclick="addToCart(${product.id}, 1)">В корзину</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', productHtml);

        window.productsData[product.id] = {
            name: product.name,
            price: Number(product.price),
            article: product.article
        };
    });
}

function initAddProductForm() {
    const form = document.getElementById('addProductForm');

    if (!form) {
        return;
    }

    if (form.dataset.initialized === 'true') {
        return;
    }

    form.dataset.initialized = 'true';

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const products = getCustomProducts();

        const newProduct = {
            id: Date.now(),
            name: document.getElementById('productName').value,
            article: document.getElementById('productArticle').value,
            price: Number(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value,
            image: document.getElementById('productImage').value || 'images/placeholder.jpg'
        };

        products.push(newProduct);
        saveCustomProducts(products);

        showNotification('Товар добавлен в каталог', 'success');
        form.reset();
    });
}

function deleteProductCard(productId) {
    const user = getCurrentUser();

    if (!user || user.role !== 'admin') {
        return;
    }

    if (!confirm('Удалить товар?')) {
        return;
    }

    // удаляем карточку со страницы
    const product = document.querySelector(
        `.product-item[data-id="${productId}"]`
    );

    if (product) {
        product.remove();
    }

    // удаляем товар из localStorage
    let products = getCustomProducts();

    products = products.filter(product => {
        return Number(product.id) !== Number(productId);
    });

    saveCustomProducts(products);

    // удаляем из корзины, если товар был добавлен
    let cart = getCart();

    cart = cart.filter(item => {
        return Number(item.id) !== Number(productId);
    });

    saveCart(cart);

    showNotification('Товар удалён', 'success');
}
function showAdminDeleteButtons() {

    const user = getCurrentUser();

    if (!user || user.role !== 'admin') {
        return;
    }

    const products = document.querySelectorAll('.product-item');

    products.forEach(product => {

        const id = product.dataset.id;

        const cardBody = product.querySelector('.card-body');

        if (!cardBody) return;

        const exists = cardBody.querySelector('.admin-delete-btn');

        if (exists) return;

        cardBody.insertAdjacentHTML(
            'beforeend',
            `
            <button
                class="btn btn-danger btn-sm mt-2 admin-delete-btn w-100"
                onclick="deleteProductCard(${id})">
                🗑 Удалить товар
            </button>
            `
        );
    });
}