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

const ORDER_EMAIL = 'kenny@arancinikitchen.com';

function mailtoFallback(f) {
  const items = [
    ['Buffalo Chicken ($5)', f.qtyBuffalo.value],
    ['Traditional ($5)', f.qtyTraditional.value],
    ['Ham & Cheese ($5)', f.qtyHamCheese.value],
    ['White Chocolate Sweet Cini ($4)', f.qtySweetCini.value],
  ].filter(([, qty]) => Number(qty) > 0);

  const fulfillment = f.fulfillment.value || '—';

  const lines = [
    `Name: ${f.name.value}`,
    `Phone: ${f.phone.value}`,
    `Email: ${f.email.value}`,
    `Date needed: ${f.needBy.value}`,
    `Pickup or Delivery: ${fulfillment}`,
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

orderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const data = new URLSearchParams(new FormData(f)).toString();

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: data,
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Netlify Forms responded ${res.status}`);
      f.hidden = true;
      orderFormHint.textContent = "Thanks — your order request is in! We'll be in touch shortly.";
    })
    .catch(() => {
      // Not deployed on Netlify (e.g. local preview) — fall back to opening an email.
      mailtoFallback(f);
    });
});
