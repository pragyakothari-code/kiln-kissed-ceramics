const CART_KEY = 'kkc_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartBadge();
  renderCartDrawer();
}

function findProduct(id) {
  return (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).find((p) => p.id === id);
}

function addToCart(id, qty = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, qty });
  }
  saveCart(cart);
  openCart();
}

function removeFromCart(id) {
  saveCart(getCart().filter((item) => item.id !== id));
}

function setQty(id, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  if (qty <= 0) {
    removeFromCart(id);
    return;
  }
  item.qty = qty;
  saveCart(cart);
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function cartLines() {
  return getCart()
    .map((item) => {
      const product = findProduct(item.id);
      if (!product) return null;
      return { ...item, product, lineTotal: product.price * item.qty };
    })
    .filter(Boolean);
}

function cartTotal() {
  return cartLines().reduce((sum, line) => sum + line.lineTotal, 0);
}

function formatPrice(n) {
  return `$${n.toFixed(2)}`;
}

function renderCartBadge() {
  const count = cartCount();
  document.querySelectorAll('.cart-link').forEach((el) => {
    el.textContent = `Cart (${count})`;
  });
}

function openCart() {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-backdrop')?.classList.add('open');
}

function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-backdrop')?.classList.remove('open');
}

function renderCartDrawer() {
  const body = document.getElementById('cart-drawer-body');
  const footer = document.getElementById('cart-drawer-footer');
  if (!body) return;
  const lines = cartLines();
  if (!lines.length) {
    body.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    if (footer) footer.innerHTML = '';
    return;
  }
  body.innerHTML = lines
    .map(
      (line) => `
      <div class="cart-line" data-id="${line.id}">
        <div class="cart-line-img"><img src="${line.product.img}" alt="${line.product.alt}" style="${line.product.imgStyle || ''}"></div>
        <div class="cart-line-info">
          <h4>${line.product.name}</h4>
          <span class="cart-line-price">${formatPrice(line.product.price)}</span>
          <div class="cart-qty">
            <button class="qty-btn" data-action="dec" data-id="${line.id}" aria-label="Decrease quantity">&minus;</button>
            <span>${line.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${line.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="cart-remove" data-action="remove" data-id="${line.id}" aria-label="Remove item">&times;</button>
      </div>`
    )
    .join('');
  if (footer) {
    footer.innerHTML = `
      <div class="cart-subtotal">
        <span>Subtotal</span>
        <span>${formatPrice(cartTotal())}</span>
      </div>
      <a class="btn cart-checkout-btn" href="checkout.html">Checkout</a>
    `;
  }
}

function injectCartDrawer() {
  if (document.getElementById('cart-drawer')) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="cart-backdrop" class="cart-backdrop"></div>
    <aside id="cart-drawer" class="cart-drawer">
      <div class="cart-drawer-head">
        <h3>Your Cart</h3>
        <button id="cart-close" class="cart-close" aria-label="Close cart">&times;</button>
      </div>
      <div id="cart-drawer-body" class="cart-drawer-body"></div>
      <div id="cart-drawer-footer" class="cart-drawer-footer"></div>
    </aside>
  `;
  document.body.appendChild(wrap);
  document.getElementById('cart-backdrop').addEventListener('click', closeCart);
  document.getElementById('cart-close').addEventListener('click', closeCart);
  document.getElementById('cart-drawer-body').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (btn.dataset.action === 'inc' && item) setQty(id, item.qty + 1);
    if (btn.dataset.action === 'dec' && item) setQty(id, item.qty - 1);
    if (btn.dataset.action === 'remove') removeFromCart(id);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  injectCartDrawer();
  renderCartBadge();
  renderCartDrawer();

  document.querySelectorAll('.cart-link').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  });

  document.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      addToCart(btn.dataset.addToCart, 1);
    });
  });
});
