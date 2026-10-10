document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

navToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

siteNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});


const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = '';
  document.body.style.overflow = '';
}

document.querySelectorAll('.gallery-photo-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const img = btn.querySelector('img');
    openLightbox(img.src, img.alt);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
});

const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', () => {
  const digits = phoneInput.value.replace(/\D/g, '').slice(0, 10);
  let formatted = digits;
  if (digits.length > 6) {
    formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length > 3) {
    formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else if (digits.length > 0) {
    formatted = `(${digits}`;
  }
  phoneInput.value = formatted;
});

const pickupDetail = document.getElementById('pickupDetail');
const deliveryDetail = document.getElementById('deliveryDetail');
const addressInput = document.getElementById('address');

document.querySelectorAll('input[name="fulfillment"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    if (!radio.checked) return;
    const isDelivery = radio.value === 'Delivery';
    pickupDetail.hidden = isDelivery;
    deliveryDetail.hidden = !isDelivery;
    addressInput.required = isDelivery;
    if (!isDelivery) addressInput.value = '';
  });
});

const ORDER_EMAIL = 'kenny@arancinikitchen.com';

function mailtoFallback(f) {
  const items = [
    ['Buffalo Chicken ($8)', f.qtyBuffalo.value],
    ['Traditional ($8)', f.qtyTraditional.value],
    ['Ham & Cheese ($8)', f.qtyHamCheese.value],
    ['White Chocolate Sweet Cini ($6)', f.qtySweetCini.value],
  ].filter(([, qty]) => Number(qty) > 0);

  const fulfillment = f.fulfillment.value || '—';
  const fulfillmentDetails = fulfillment === 'Delivery'
    ? [`Delivery Time: ${f.deliveryTime.value || '—'}`, `Delivery Address: ${f.address.value || '—'}`]
    : [`Pickup Time: ${f.pickupTime.value || '—'}`];

  const lines = [
    `Name: ${f.name.value}`,
    `Phone: ${f.phone.value}`,
    `Email: ${f.email.value}`,
    `Date needed: ${f.needBy.value}`,
    `Pickup or Delivery: ${fulfillment}`,
    ...fulfillmentDetails,
    '',
    'Items:',
    ...(items.length ? items.map(([label, qty]) => `  ${qty} x ${label}`) : ['  (none selected)']),
    '',
    `Notes: ${f.notes.value || '—'}`,
  ];

  const subject = encodeURIComponent(`Order request — ${f.name.value || 'New order'}`);
  const body = encodeURIComponent(lines.join('\n'));
  window.location.href = `mailto:${ORDER_EMAIL}?subject=${subject}&body=${body}`;
}

const orderForm = document.getElementById('orderForm');
const orderFormHint = document.getElementById('orderFormHint');
const orderSubmit = document.getElementById('orderSubmit');

orderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (orderSubmit.disabled) return;
  const f = e.target;
  const data = new URLSearchParams(new FormData(f)).toString();

  // Lock the button immediately so a slow connection can't trigger duplicate orders.
  orderSubmit.disabled = true;
  orderSubmit.textContent = 'Sending…';

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: data,
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Netlify Forms responded ${res.status}`);
      orderSubmit.hidden = true;
      orderFormHint.textContent = "Thanks — your order request is in! We'll be in touch shortly.";
      orderFormHint.classList.add('order-success');
      orderFormHint.scrollIntoView({ behavior: 'smooth', block: 'center' });
    })
    .catch(() => {
      // Not deployed on Netlify (e.g. local preview) — fall back to opening an email.
      orderSubmit.disabled = false;
      orderSubmit.textContent = 'Send Order Request';
      mailtoFallback(f);
    });
});
