const seedProducts = [
  { id: "soundwave-pro", name: "Soundwave Pro Headphones", category: "Audio", price: 7999, compareAt: 9999, rentPrice: 299, rating: "4.9", badge: "BESTSELLER", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=760&q=82", description: "Lose yourself in rich, immersive sound. All-day comfort, beautifully balanced audio, and a battery that keeps going." },
  { id: "studio-buds", name: "Studio Buds Wireless", category: "Audio", price: 3499, compareAt: 4499, rentPrice: 149, rating: "4.8", badge: "JUST IN", image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=760&q=82", description: "Small buds. Big sound. Your everyday soundtrack, with a pocket-sized charging case." },
  { id: "pixelate-phone", name: "Pixelate 9 Smartphone", category: "Phones", price: 54999, compareAt: 59999, rentPrice: 899, rating: "4.9", badge: "STAFF PICK", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=760&q=82", description: "A brilliant camera, a bright display, and the kind of battery life that makes you forget your charger." },
  { id: "daylight-watch", name: "Daylight Smartwatch", category: "Wearables", price: 8999, compareAt: 10999, rentPrice: 399, rating: "4.7", badge: "GOOD PICK", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=760&q=82", description: "Keep your day in rhythm with thoughtful health tracking, helpful notifications, and a clean, classic design." },
  { id: "keyframe-keys", name: "Keyframe Mechanical Keys", category: "Computers", price: 6299, compareAt: 7499, rentPrice: 249, rating: "4.8", badge: "A FAN FAVOURITE", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=760&q=82", description: "A satisfying, tactile keyboard for work, play, and everything in between. Made for your desk, and your flow." },
  { id: "pocket-speaker", name: "Pocket Beat Speaker", category: "Audio", price: 4299, compareAt: 5299, rentPrice: 199, rating: "4.6", badge: "TAKE IT OUTSIDE", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=760&q=82", description: "Take your playlist beyond the living room with bold portable sound and a rugged, splash-ready build." },
  { id: "everyday-camera", name: "Everyday Mirrorless Camera", category: "Cameras", price: 64999, compareAt: 72999, rentPrice: 1299, rating: "4.9", badge: "CREATOR PICK", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=760&q=82", description: "Bring your ideas into focus with crisp, beautiful detail. A versatile companion for your next creative adventure." },
  { id: "comfort-mouse", name: "Comfort Arc Mouse", category: "Computers", price: 2299, compareAt: 2799, rentPrice: 99, rating: "4.7", badge: "FEELS RIGHT", image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=760&q=82", description: "A comfortable shape and precise tracking make this the easy upgrade your everyday setup deserves." }
];

const storageKeys = { products: "techyy.products.v1", cart: "techyy.cart.v1", user: "techyy.user.v1", qr: "techyy.qr.v1", orders: "techyy.orders.v1" };
const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const getStored = (key, fallback) => {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : JSON.parse(raw);
};
let products = getStored(storageKeys.products, seedProducts);
let cart = getStored(storageKeys.cart, []);
let user = getStored(storageKeys.user, null);
let orders = getStored(storageKeys.orders, []);
let upiQr = getStored(storageKeys.qr, "");
let activeCategory = "All";
let activeMode = "buy";
let searchTerm = "";
let sortMode = "featured";
let activeDrawer = "";
let authMode = "login";
let toastTimer;

const productGrid = document.querySelector("#product-grid");
const categoryList = document.querySelector("#category-list");
const emptyState = document.querySelector("#empty-state");
const overlay = document.querySelector("#overlay");
const drawerTitle = document.querySelector("#drawer-title");
const drawerEyebrow = document.querySelector("#drawer-eyebrow");
const drawerContent = document.querySelector("#drawer-content");
const toastElement = document.querySelector("#toast");

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function notify(message) {
  toastElement.textContent = message;
  toastElement.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastElement.classList.remove("show"), 2800);
}

function money(amount) {
  return currency.format(Number(amount) || 0);
}

function categories() {
  return ["All", ...new Set(products.map((product) => product.category))];
}

function renderCategories() {
  if (!categories().includes(activeCategory)) activeCategory = "All";
  categoryList.innerHTML = categories().map((category) =>
    `<button class="category-button${activeCategory === category ? " active" : ""}" type="button" data-category="${escapeHTML(category)}" aria-pressed="${activeCategory === category}">${escapeHTML(category)}</button>`
  ).join("");
}

function filteredProducts() {
  const query = searchTerm.trim().toLocaleLowerCase();
  const visible = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = !query || `${product.name} ${product.category} ${product.description || ""}`.toLocaleLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  if (sortMode === "price-low") visible.sort((a, b) => a.price - b.price);
  if (sortMode === "price-high") visible.sort((a, b) => b.price - a.price);
  return visible;
}

function renderProducts() {
  renderCategories();
  const visible = filteredProducts();
  productGrid.innerHTML = visible.map((product) => {
    const favorited = getStored("techyy.favorites.v1", []).includes(product.id);
    return `<article class="product-card">
      <div class="product-image-wrap">
        <span class="product-badge">${escapeHTML(product.badge || "CURATED PICK")}</span>
        <button class="favorite-button${favorited ? " favorite" : ""}" type="button" data-favorite="${escapeHTML(product.id)}" aria-label="${favorited ? "Remove from" : "Add to"} favourites">${favorited ? "♥" : "♡"}</button>
        <img class="product-image" src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy">
        <button class="product-add" type="button" data-add="${escapeHTML(product.id)}" aria-label="Add ${escapeHTML(product.name)} to bag">+</button>
      </div>
      <div class="product-info">
        <div class="product-category">${escapeHTML(product.category)}</div>
        <div class="product-name-row"><h3 class="product-name">${escapeHTML(product.name)}</h3><span class="rating"><span>★</span> ${escapeHTML(product.rating || "4.8")}</span></div>
        <div class="product-price-row"><span class="product-price">${money(product.price)}</span><span class="product-compare">${money(product.compareAt || product.price * 1.15)}</span>${activeMode === "rent" ? `<span class="rent-price">· ${money(product.rentPrice || 199)}/day</span>` : ""}</div>
        ${activeMode === "rent" ? `<button class="product-card-admin" type="button" data-rent="${escapeHTML(product.id)}">Rent this item →</button>` : ""}
      </div>
    </article>`;
  }).join("");
  emptyState.classList.toggle("hidden", visible.length > 0);
  productGrid.classList.toggle("hidden", visible.length === 0);
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelector("#cart-count").textContent = count > 99 ? "99+" : String(count);
}

function addToCart(productId, mode = activeMode) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const existing = cart.find((item) => item.productId === productId && item.mode === mode);
  if (existing) existing.quantity += 1;
  else cart.push({ productId, mode, quantity: 1, days: 3 });
  save(storageKeys.cart, cart);
  updateCartCount();
  notify(`${product.name} added to your bag`);
}

function openDrawer(name) {
  activeDrawer = name;
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  renderDrawer();
  document.querySelector("#close-drawer").focus();
}

function closeDrawer() {
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  activeDrawer = "";
}

function drawerHeader(eyebrow, title) {
  drawerEyebrow.textContent = eyebrow;
  drawerTitle.textContent = title;
}

function renderDrawer() {
  if (activeDrawer === "cart") renderCart();
  if (activeDrawer === "auth") renderAuth();
  if (activeDrawer === "admin") renderAdmin();
  if (activeDrawer === "checkout") renderCheckout();
}

function cartLines() {
  return cart.map((item, index) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) return null;
    const unitPrice = item.mode === "rent" ? (Number(product.rentPrice) || 199) * Math.max(1, Number(item.days) || 3) : Number(product.price);
    return { item, product, index, unitPrice, lineTotal: unitPrice * item.quantity };
  }).filter(Boolean);
}

function cartTotal() {
  return cartLines().reduce((sum, line) => sum + line.lineTotal, 0);
}

function renderCart() {
  drawerHeader("YOUR GOOD STUFF", "Your bag");
  const lines = cartLines();
  if (lines.length === 0) {
    drawerContent.innerHTML = `<div class="drawer-empty"><span class="drawer-empty-icon">⌑</span><h3>Your bag is taking a breather.</h3><p>Find something you love, then it’ll be right here.</p><button class="button button-dark drawer-primary" type="button" data-close-drawer>Keep exploring <span>→</span></button></div>`;
    return;
  }
  const lineMarkup = lines.map(({ item, product, index, unitPrice }) => `<div class="cart-item">
      <img src="${escapeHTML(product.image)}" alt="">
      <div>
        <h3 class="cart-item-name">${escapeHTML(product.name)}</h3>
        <span class="cart-item-mode">${item.mode === "rent" ? `Rent · ${item.days} days · ${money(product.rentPrice)}/day` : "Purchase"}</span>
        ${item.mode === "rent" ? `<label class="form-field" style="margin-top:8px">Rental days <select data-days="${index}">${[1, 3, 7, 14, 30].map((days) => `<option value="${days}" ${Number(item.days) === days ? "selected" : ""}>${days} ${days === 1 ? "day" : "days"}</option>`).join("")}</select></label>` : ""}
        <div class="quantity-control"><button type="button" data-quantity="${index}" data-change="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-quantity="${index}" data-change="1" aria-label="Increase quantity">+</button><span class="cart-item-price">${money(unitPrice * item.quantity)}</span></div>
      </div>
      <button class="remove-item" type="button" data-remove="${index}" aria-label="Remove ${escapeHTML(product.name)}">×</button>
    </div>`).join("");
  drawerContent.innerHTML = `${lineMarkup}
    <div class="cart-total"><span>Subtotal</span><span>${money(cartTotal())}</span></div>
    <p class="cart-caption">Delivery, deposit, and any rental terms will be confirmed by the store before payment.</p>
    <button class="button button-dark drawer-primary" type="button" data-checkout>Continue to checkout <span>→</span></button>
    <div class="cart-notice">Buying and renting are both available. This demo stores your bag in this browser only.</div>`;
}

function renderAuth() {
  drawerHeader("WELCOME TO TECHYY", user ? "Your account" : "Good to have you.");
  if (user) {
    drawerContent.innerHTML = `<div class="admin-notice">You're signed in on this device as <strong>${escapeHTML(user.name)}</strong> (${escapeHTML(user.email)}).</div><button class="button button-dark drawer-primary" type="button" data-sign-out>Sign out</button><p class="form-footnote">Account details in this prototype stay in this browser; no account is created on a server.</p>`;
    return;
  }
  drawerContent.innerHTML = `<div class="form-tabs"><button type="button" class="form-tab${authMode === "login" ? " active" : ""}" data-auth-mode="login">Sign in</button><button type="button" class="form-tab${authMode === "signup" ? " active" : ""}" data-auth-mode="signup">Create account</button></div>
    <form class="form-stack" id="auth-form">
      ${authMode === "signup" ? `<label class="form-field">Your name<input name="name" autocomplete="name" placeholder="e.g. Alex Morgan" required></label>` : ""}
      <label class="form-field">Email address<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required></label>
      <label class="form-field">Password<input name="password" type="password" autocomplete="${authMode === "signup" ? "new-password" : "current-password"}" minlength="6" placeholder="At least 6 characters" required></label>
      <button class="button button-dark drawer-primary" type="submit">${authMode === "signup" ? "Create your account" : "Sign in"} <span>→</span></button>
    </form>
    <p class="form-footnote">Prototype only: these screens save a local profile in your browser and do not provide real authentication or account security.</p>`;
}

function renderAdmin() {
  drawerHeader("YOUR STORE TOOLS", "Admin workspace");
  const itemRows = products.map((product) => `<div class="admin-product-row"><img src="${escapeHTML(product.image)}" alt=""><div><strong>${escapeHTML(product.name)}</strong><span>${money(product.price)} · ${escapeHTML(product.category)}</span></div><button type="button" data-delete-product="${escapeHTML(product.id)}">Remove</button></div>`).join("");
  drawerContent.innerHTML = `<div class="admin-notice"><strong>Local demo mode.</strong> Admin changes are saved in this browser only. For a live store, add server-side sign-in, a database, and a payment provider.</div>
    <div class="admin-stats"><div class="admin-stat"><strong>${products.length}</strong><span>Products in catalogue</span></div><div class="admin-stat"><strong>${orders.length}</strong><span>Orders on this device</span></div></div>
    <section class="admin-section"><h3>Add a product</h3>
      <form class="form-stack" id="product-form">
        <label class="form-field">Product name<input name="name" placeholder="e.g. Studio headphones" required maxlength="70"></label>
        <div class="form-grid"><label class="form-field">Category<input name="category" placeholder="Audio" required maxlength="24"></label><label class="form-field">Price (₹)<input name="price" type="number" min="1" step="1" placeholder="4999" required></label></div>
        <div class="form-grid"><label class="form-field">Rent price per day (₹)<input name="rentPrice" type="number" min="1" step="1" placeholder="199" required></label><label class="form-field">Image URL<input name="image" type="url" placeholder="https://..." required></label></div>
        <button class="button button-dark drawer-primary" type="submit">Add to catalogue <span>+</span></button>
      </form>
    </section>
    <section class="admin-section"><h3>Your UPI payment QR</h3><p>Upload an image of your UPI QR. It will be shown at checkout and saved only in this browser.</p>
      <label class="upload-label">Choose QR image<input id="qr-upload" type="file" accept="image/*"></label>
      <div id="qr-preview">${upiQr ? `<div class="qr-preview"><img src="${upiQr}" alt="Your UPI payment QR code"></div><button class="product-card-admin" type="button" data-remove-qr>Remove QR image</button>` : `<div class="qr-empty">No UPI QR uploaded yet.</div>`}</div>
    </section>
    <section class="admin-section"><h3>Manage products <span style="color:#92968d;font-size:9px;font-weight:400">(${products.length})</span></h3>${itemRows || `<p>No products yet.</p>`}</section>`;
}

function renderCheckout() {
  drawerHeader("ONE LAST THING", "Checkout");
  const lines = cartLines();
  if (lines.length === 0) {
    drawerContent.innerHTML = `<div class="drawer-empty"><h3>Your bag is empty.</h3><button class="button button-dark drawer-primary" type="button" data-open-cart>Back to bag</button></div>`;
    return;
  }
  const summary = lines.map(({ item, product, lineTotal }) => `<div><span>${escapeHTML(product.name)} × ${item.quantity}${item.mode === "rent" ? ` · ${item.days}d rental` : ""}</span><span>${money(lineTotal)}</span></div>`).join("");
  drawerContent.innerHTML = `<div class="checkout-summary">${summary}<div class="checkout-total"><span>Estimated total</span><strong>${money(cartTotal())}</strong></div></div>
    <p class="cart-caption">This is a demo checkout. No payment is taken and no delivery or rental booking is placed.</p>
    <form class="form-stack" id="checkout-form">
      <label class="form-field">Full name<input name="name" autocomplete="name" value="${escapeHTML(user?.name || "")}" required></label>
      <label class="form-field">Email address<input name="email" type="email" autocomplete="email" value="${escapeHTML(user?.email || "")}" required></label>
      <label class="form-field">Delivery address<textarea name="address" autocomplete="street-address" placeholder="Your delivery address" required></textarea></label>
      <button class="button button-dark drawer-primary" type="submit">Review UPI payment <span>→</span></button>
    </form>
    ${upiQr ? `<div class="payment-panel"><h3>UPI QR is set up</h3><p>The QR will be displayed for reference in this demo. No payment will be processed.</p><img src="${upiQr}" alt="Merchant UPI QR code"></div>` : `<div class="payment-unavailable">No UPI QR is set up yet. The store admin can upload one in the Admin workspace.</div>`}`;
}

function setAuthMode(mode) {
  authMode = mode;
  renderAuth();
}

function submitAuth(form) {
  const data = new FormData(form);
  const email = String(data.get("email")).trim();
  const name = authMode === "signup" ? String(data.get("name")).trim() : email.split("@")[0];
  if (!email || !name) return notify("Please enter your name and email.");
  user = { name, email };
  save(storageKeys.user, user);
  notify(authMode === "signup" ? "Your local demo profile is ready." : "Welcome back.");
  renderAuth();
}

function submitOrder(form) {
  const data = new FormData(form);
  const email = String(data.get("email")).trim();
  const name = String(data.get("name")).trim();
  if (!name || !email || !String(data.get("address")).trim()) return notify("Please complete all checkout fields.");
  const order = { id: `TY-${Date.now().toString().slice(-7)}`, email, name, total: cartTotal(), items: cartLines().map(({ item, product }) => ({ name: product.name, quantity: item.quantity, mode: item.mode, days: item.days })), createdAt: new Date().toISOString() };
  orders.unshift(order);
  save(storageKeys.orders, orders);
  drawerContent.innerHTML = `<div class="success-state"><span>✓</span><h3>Demo order noted.</h3><p>Reference <strong>${escapeHTML(order.id)}</strong> is saved on this device. No payment was taken and no order was sent to a store.</p><button class="button button-dark drawer-primary" type="button" data-finish-order>Done <span>→</span></button></div>`;
}

function handleAdminUpload(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) return notify("Choose an image file for your UPI QR.");
  if (file.size > 1024 * 1024) return notify("Please choose an image smaller than 1 MB.");
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    upiQr = String(reader.result);
    try {
      save(storageKeys.qr, upiQr);
      renderAdmin();
      notify("UPI QR saved in this browser.");
    } catch (error) {
      upiQr = "";
      notify(`Could not save this image in browser storage: ${error.message}`);
    }
  });
  reader.addEventListener("error", () => notify("Could not read the selected image."));
  reader.readAsDataURL(file);
}

function addProduct(form) {
  const data = new FormData(form);
  const name = String(data.get("name")).trim();
  const category = String(data.get("category")).trim();
  const image = String(data.get("image")).trim();
  const price = Number(data.get("price"));
  const rentPrice = Number(data.get("rentPrice"));
  if (!name || !category || !image || !Number.isFinite(price) || price <= 0 || !Number.isFinite(rentPrice) || rentPrice <= 0) return notify("Enter valid product details and prices.");
  const product = { id: `custom-${Date.now()}`, name, category, price, compareAt: Math.round(price * 1.12), rentPrice, rating: "New", badge: "JUST ADDED", image, description: "" };
  products.push(product);
  save(storageKeys.products, products);
  renderProducts();
  renderAdmin();
  notify(`${name} added to the catalogue.`);
}

function removeProduct(productId) {
  const product = products.find((entry) => entry.id === productId);
  if (!product) return;
  products = products.filter((entry) => entry.id !== productId);
  cart = cart.filter((item) => item.productId !== productId);
  save(storageKeys.products, products);
  save(storageKeys.cart, cart);
  updateCartCount();
  renderProducts();
  renderAdmin();
  notify(`${product.name} removed.`);
}

document.querySelector("#search-input").addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderProducts();
});
document.querySelector("#sort-select").addEventListener("change", (event) => {
  sortMode = event.target.value;
  renderProducts();
});
document.querySelectorAll(".mode-option").forEach((button) => button.addEventListener("click", () => {
  activeMode = button.dataset.mode;
  document.querySelectorAll(".mode-option").forEach((option) => option.classList.toggle("active", option === button));
  const note = document.querySelector("#active-mode-note span:last-child");
  note.textContent = activeMode === "rent" ? "Try it for a day, a week, or as long as you need." : "Good tech, yours to keep.";
  renderProducts();
}));
document.querySelectorAll("[data-rent-link]").forEach((link) => link.addEventListener("click", () => {
  activeMode = "rent";
  document.querySelectorAll(".mode-option").forEach((option) => option.classList.toggle("active", option.dataset.mode === "rent"));
  document.querySelector("#active-mode-note span:last-child").textContent = "Try it for a day, a week, or as long as you need.";
  renderProducts();
}));
categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (button) { activeCategory = button.dataset.category; renderProducts(); }
});
productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const rentButton = event.target.closest("[data-rent]");
  const favoriteButton = event.target.closest("[data-favorite]");
  if (addButton) addToCart(addButton.dataset.add);
  if (rentButton) addToCart(rentButton.dataset.rent, "rent");
  if (favoriteButton) {
    const favorites = getStored("techyy.favorites.v1", []);
    const index = favorites.indexOf(favoriteButton.dataset.favorite);
    if (index >= 0) favorites.splice(index, 1); else favorites.push(favoriteButton.dataset.favorite);
    save("techyy.favorites.v1", favorites);
    renderProducts();
  }
});
document.querySelector("#clear-filters").addEventListener("click", () => {
  activeCategory = "All";
  searchTerm = "";
  document.querySelector("#search-input").value = "";
  renderProducts();
});
document.querySelector("#cart-button").addEventListener("click", () => openDrawer("cart"));
document.querySelector("#account-button").addEventListener("click", () => openDrawer("auth"));
document.querySelector("#admin-link").addEventListener("click", () => openDrawer("admin"));
document.querySelector("#close-drawer").addEventListener("click", closeDrawer);
overlay.addEventListener("click", (event) => { if (event.target === overlay) closeDrawer(); });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !overlay.classList.contains("hidden")) closeDrawer();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.querySelector("#search-input").focus();
  }
});
drawerContent.addEventListener("click", (event) => {
  const closeButton = event.target.closest("[data-close-drawer]");
  const modeButton = event.target.closest("[data-auth-mode]");
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  const checkoutButton = event.target.closest("[data-checkout]");
  const signOutButton = event.target.closest("[data-sign-out]");
  const deleteButton = event.target.closest("[data-delete-product]");
  const removeQrButton = event.target.closest("[data-remove-qr]");
  const finishOrderButton = event.target.closest("[data-finish-order]");
  const openCartButton = event.target.closest("[data-open-cart]");
  if (closeButton) closeDrawer();
  if (modeButton) setAuthMode(modeButton.dataset.authMode);
  if (quantityButton) {
    const index = Number(quantityButton.dataset.quantity);
    if (!cart[index]) return;
    cart[index].quantity += Number(quantityButton.dataset.change);
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    save(storageKeys.cart, cart);
    updateCartCount();
    renderCart();
  }
  if (removeButton) {
    cart.splice(Number(removeButton.dataset.remove), 1);
    save(storageKeys.cart, cart);
    updateCartCount();
    renderCart();
  }
  if (checkoutButton) { activeDrawer = "checkout"; renderCheckout(); }
  if (signOutButton) {
    user = null;
    localStorage.removeItem(storageKeys.user);
    renderAuth();
    notify("Signed out on this device.");
  }
  if (deleteButton) removeProduct(deleteButton.dataset.deleteProduct);
  if (removeQrButton) {
    upiQr = "";
    localStorage.removeItem(storageKeys.qr);
    renderAdmin();
    notify("UPI QR removed.");
  }
  if (finishOrderButton) {
    cart = [];
    save(storageKeys.cart, cart);
    updateCartCount();
    closeDrawer();
    notify("Thanks for trying Techyy.");
  }
  if (openCartButton) { activeDrawer = "cart"; renderCart(); }
});
drawerContent.addEventListener("change", (event) => {
  if (event.target.matches("[data-days]")) {
    const index = Number(event.target.dataset.days);
    if (!cart[index]) return;
    cart[index].days = Number(event.target.value);
    save(storageKeys.cart, cart);
    renderCart();
  }
  if (event.target.id === "qr-upload") handleAdminUpload(event.target.files[0]);
});
drawerContent.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.id === "auth-form") submitAuth(event.target);
  if (event.target.id === "checkout-form") submitOrder(event.target);
  if (event.target.id === "product-form") addProduct(event.target);
});
document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#newsletter-status").textContent = "Thanks for joining the good tech list!";
  event.target.reset();
});
window.addEventListener("storage", (event) => {
  if (event.key === storageKeys.products) { products = getStored(storageKeys.products, seedProducts); renderProducts(); }
  if (event.key === storageKeys.cart) { cart = getStored(storageKeys.cart, []); updateCartCount(); }
});

renderProducts();
updateCartCount();
