const form        = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');
const successMsg  = document.getElementById('form-success');
const errorMsg    = document.getElementById('form-error');
const textarea    = document.getElementById('f-melding');
const wordCounter = document.getElementById('word-counter');


  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
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


const MAX_WORDS = 2000;

/* ── Word counter ─────────────────────────────────── */
function countWords(str) {
  return str.trim() === '' ? 0 : str.trim().split(/\s+/).length;
}

textarea.addEventListener('input', function () {
  const words = countWords(this.value);
  wordCounter.textContent = words + ' / ' + MAX_WORDS + ' ord';

  if (words > MAX_WORDS) {
    wordCounter.classList.add('over');
    const trimmed = this.value.trim().split(/\s+/).slice(0, MAX_WORDS).join(' ');
    this.value = trimmed;
    wordCounter.textContent = MAX_WORDS + ' / ' + MAX_WORDS + ' ord';
  } else {
    wordCounter.classList.remove('over');
  }
});

/* ── Validation helpers ───────────────────────────── */
function showError(fieldId, errorId, show) {
  const field = document.getElementById(fieldId);
  const err   = document.getElementById(errorId);
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

/* ── Live validation on blur ──────────────────────── */
document.getElementById('f-navn').addEventListener('blur', function () {
  showError('f-navn', 'err-navn', this.value.trim() === '');
});
document.getElementById('f-telefon').addEventListener('blur', function () {
  showError('f-telefon', 'err-telefon', this.value.trim() === '');
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

  const navn    = document.getElementById('f-navn').value.trim();
  const telefon = document.getElementById('f-telefon').value.trim();
  const epost   = document.getElementById('f-epost').value.trim();
  const melding = textarea.value.trim();
  const words   = countWords(melding);

  let hasError = false;

  if (!navn)                 { showError('f-navn',    'err-navn',    true);  hasError = true; }
  else                       { showError('f-navn',    'err-navn',    false); }

  if (!telefon)              { showError('f-telefon', 'err-telefon', true);  hasError = true; }
  else                       { showError('f-telefon', 'err-telefon', false); }

  if (!validateEmail(epost)) { showError('f-epost',   'err-epost',   true);  hasError = true; }
  else                       { showError('f-epost',   'err-epost',   false); }

  if (words === 0 || words > MAX_WORDS) {
    showError('f-melding', 'err-melding', true);
    document.getElementById('err-melding').style.display = 'block';
    hasError = true;
  } else {
    showError('f-melding', 'err-melding', false);
    document.getElementById('err-melding').style.display = 'none';
  }

  if (hasError) {
    const firstInvalid = form.querySelector('.invalid');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Send to Formspree
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sender...';
  errorMsg.style.display = 'none';

  try {
    const response = await fetch('https://formspree.io/f/xwvzgwbn', {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      form.style.display = 'none';
      successMsg.style.display = 'block';
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    errorMsg.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send';
  }
});
