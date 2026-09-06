const form        = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');
const successMsg  = document.getElementById('form-success');
const errorMsg    = document.getElementById('form-error');
const textarea    = document.getElementById('f-melding');
const wordCounter = document.getElementById('word-counter');

const MAX_WORDS = 2000;
let isSubmitting = false;

/* ── Theme toggle ─────────────────────────────────── */
const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
  themeToggle.setAttribute('aria-pressed', String(document.documentElement.getAttribute('data-theme') === 'dark'));

  themeToggle.addEventListener('click', () => {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';

    root.setAttribute('data-theme', next);
    themeToggle.setAttribute('aria-pressed', String(!isDark));

    try { localStorage.setItem('scopey-theme', next); } catch (e) { /* ignore */ }
  });
}

/* ── Nav toggle ───────────────────────────────────── */
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    toggle.classList.toggle('open');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
    });
  });
}

/* ── Word counter ─────────────────────────────────── */
function countWords(str) {
  return str.trim() === '' ? 0 : str.trim().split(/\s+/).length;
}

textarea.addEventListener('input', function () {
  const words = countWords(this.value);

  wordCounter.textContent = `${words} / ${MAX_WORDS} ord`;

  if (words > MAX_WORDS) {
    wordCounter.classList.add('over');
  } else {
    wordCounter.classList.remove('over');
  }
});

/* ── Validation helpers ───────────────────────────── */
function showError(fieldId, errorId, show) {
  const field = document.getElementById(fieldId);
  const err = document.getElementById(errorId);

  if (show) {
    field.classList.add('invalid');
    field.classList.remove('valid');
    err.style.display = 'block';
  } else {
    field.classList.remove('invalid');
    field.classList.add('valid');
    err.style.display = 'none';
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, '');

  // Krever minst 8 sifre
  return digits.length >= 8;
}

/* ── Live validation ─────────────────────────────── */
document.getElementById('f-navn').addEventListener('blur', function () {
  showError('f-navn', 'err-navn', this.value.trim() === '');
});

document.getElementById('f-telefon').addEventListener('blur', function () {
  showError('f-telefon', 'err-telefon', !validatePhone(this.value.trim()));
});

document.getElementById('f-epost').addEventListener('blur', function () {
  showError('f-epost', 'err-epost', !validateEmail(this.value.trim()));
});

textarea.addEventListener('blur', function () {
  const words = countWords(this.value);
  showError('f-melding', 'err-melding', words === 0 || words > MAX_WORDS);
});

/* ── Submit ───────────────────────────────────────── */
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  if (isSubmitting) return;

  const navn = document.getElementById('f-navn').value.trim();
  const telefon = document.getElementById('f-telefon').value.trim();
  const epost = document.getElementById('f-epost').value.trim();
  const melding = textarea.value.trim();
  const words = countWords(melding);

  let hasError = false;

  if (!navn) {
    showError('f-navn', 'err-navn', true);
    hasError = true;
  } else {
    showError('f-navn', 'err-navn', false);
  }

  if (!validatePhone(telefon)) {
    showError('f-telefon', 'err-telefon', true);
    hasError = true;
  } else {
    showError('f-telefon', 'err-telefon', false);
  }

  if (!validateEmail(epost)) {
    showError('f-epost', 'err-epost', true);
    hasError = true;
  } else {
    showError('f-epost', 'err-epost', false);
  }

  if (words === 0 || words > MAX_WORDS) {
    showError('f-melding', 'err-melding', true);
    hasError = true;
  } else {
    showError('f-melding', 'err-melding', false);
  }

  if (hasError) {
    const firstInvalid = form.querySelector('.invalid');

    if (firstInvalid) {
      firstInvalid.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

    return;
  }

  isSubmitting = true;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sender...';
  errorMsg.style.display = 'none';

  try {
    const response = await fetch('https://formspree.io/f/xwvzgwbn', {
      method: 'POST',
      body: new FormData(form),
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Server error');
    }

    form.style.display = 'none';
    successMsg.style.display = 'block';

    successMsg.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

  } catch (err) {
    console.error('Form submission failed:', err);

    errorMsg.style.display = 'block';
    isSubmitting = false;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send';
  }
});