/* ============================================================
   FORMULÁRIO DE INSCRIÇÃO — Hackathon App BiT
   Adicione este JS ao final do script.js existente,
   dentro do DOMContentLoaded, ou importe separado.
   ============================================================ */

(function () {
  'use strict';

  // ---- DOM refs ----
  const overlay     = document.getElementById('modal-inscricao');
  const modal       = overlay ? overlay.querySelector('.modal') : null;
  const closeBtn    = document.getElementById('modal-close');
  const form        = document.getElementById('form-inscricao');
  const successBox  = document.getElementById('modal-success');
  const btnPrev     = document.getElementById('btn-prev');
  const btnNext     = document.getElementById('btn-next');
  const btnSubmit   = document.getElementById('btn-submit');
  const btnSuccClose = document.getElementById('btn-success-close');

  if (!overlay || !form) return; // guard: modal not in DOM

  const steps       = form.querySelectorAll('.form-step');
  const indicators  = document.querySelectorAll('.step-indicator');
  const connectors  = document.querySelectorAll('.step-connector');
  const totalSteps  = steps.length;
  let currentStep   = 0;

  // ============================================================
  // OPEN / CLOSE MODAL
  // ============================================================

  // All "Inscreva-se" buttons open the modal
  function bindTriggers() {
    document.querySelectorAll('a[href="#inscricao"]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });
  }

  function openModal() {
    overlay.hidden = false;
    document.body.classList.add('modal-open');
    // Reset to step 0 if form was previously completed
    if (!successBox.hidden) {
      resetForm();
    }
    // Focus trap: focus first input
    setTimeout(function () {
      var firstInput = steps[currentStep].querySelector('input, select');
      if (firstInput) firstInput.focus();
    }, 350);
  }

  function closeModal() {
    overlay.hidden = true;
    document.body.classList.remove('modal-open');
  }

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Click on overlay background — disabled, only close button closes
  // overlay.addEventListener('click', function (e) {
  //   if (e.target === overlay) closeModal();
  // });

  // Escape key — disabled
  // document.addEventListener('keydown', function (e) {
  //   if (e.key === 'Escape' && !overlay.hidden) closeModal();
  // });

  // Success close
  if (btnSuccClose) {
    btnSuccClose.addEventListener('click', closeModal);
  }

  // ============================================================
  // STEPPER NAVIGATION
  // ============================================================

  function showStep(n) {
    // Clamp
    if (n < 0 || n >= totalSteps) return;
    currentStep = n;

    // Show/hide steps
    steps.forEach(function (step, i) {
      step.classList.toggle('active', i === n);
    });

    // Update indicators
    indicators.forEach(function (ind, i) {
      ind.classList.remove('active', 'completed');
      if (i < n) ind.classList.add('completed');
      else if (i === n) ind.classList.add('active');
    });

    // Update connectors
    connectors.forEach(function (conn, i) {
      conn.classList.toggle('completed', i < n);
    });

    // Show/hide nav buttons
    btnPrev.hidden = (n === 0);
    btnNext.hidden = (n === totalSteps - 1);
    btnSubmit.hidden = (n !== totalSteps - 1);

    // Scroll modal form to top
    var formEl = document.querySelector('.modal-form');
    if (formEl) formEl.scrollTop = 0;
  }

  // Next
  if (btnNext) {
    btnNext.addEventListener('click', function () {
      if (validateStep(currentStep)) {
        showStep(currentStep + 1);
      }
    });
  }

  // Previous
  if (btnPrev) {
    btnPrev.addEventListener('click', function () {
      showStep(currentStep - 1);
    });
  }

  // ============================================================
  // VALIDATION
  // ============================================================

  function validateStep(stepIndex) {
    var step = steps[stepIndex];
    var valid = true;
    var firstInvalid = null;

    // Clear previous errors in this step
    step.querySelectorAll('.form-error').forEach(function (err) {
      err.hidden = true;
    });
    step.querySelectorAll('.error').forEach(function (el) {
      el.classList.remove('error');
    });

    // ---- Text / Email / Tel / URL inputs ----
    step.querySelectorAll('.form-input[required], .form-select[required]').forEach(function (input) {
      // Skip hidden conditional fields
      var parent = input.closest('.form-conditional, .form-other-input');
      if (parent && parent.hidden) return;
      // Skip inputs inside hidden other-input
      if (input.classList.contains('form-other-input') && input.hidden) return;

      var val = input.value.trim();
      var isInvalid = false;

      if (!val) {
        isInvalid = true;
      } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        isInvalid = true;
      } else if (input.type === 'tel' && !/^\+?\d[\d\s\-()]{7,}$/.test(val)) {
        isInvalid = true;
      } else if (input.type === 'url' && !/^https?:\/\/.+/.test(val)) {
        isInvalid = true;
      }

      if (isInvalid) {
        valid = false;
        input.classList.add('error');
        showError(input);
        if (!firstInvalid) firstInvalid = input;
      }
    });

    // ---- Radio groups ----
    step.querySelectorAll('.form-radio-group[data-name]').forEach(function (group) {
      var name = group.getAttribute('data-name');
      var radios = group.querySelectorAll('input[type="radio"]');
      if (radios.length === 0) return;

      // Check if required (first radio has required attr)
      if (!radios[0].hasAttribute('required')) return;

      var checked = group.querySelector('input[type="radio"]:checked');
      if (!checked) {
        valid = false;
        showError(group);
        if (!firstInvalid) firstInvalid = group;
      }
    });

    // ---- Checkbox groups (at least one required) ----
    step.querySelectorAll('.form-checkbox-group[data-name]').forEach(function (group) {
      var checkboxes = group.querySelectorAll('input[type="checkbox"]');
      if (checkboxes.length === 0) return;

      // Check if parent form-group has a .req indicator
      var formGroup = group.closest('.form-group');
      if (!formGroup || !formGroup.querySelector('.req')) return;

      var anyChecked = group.querySelector('input[type="checkbox"]:checked');
      if (!anyChecked) {
        valid = false;
        showError(group);
        if (!firstInvalid) firstInvalid = group;
      }
    });

    // ---- LGPD checkbox (step 5) ----
    var lgpdCheckbox = step.querySelector('#lgpd-consent');
    if (lgpdCheckbox && !lgpdCheckbox.checked) {
      valid = false;
      var lgpdLabel = lgpdCheckbox.closest('.form-checkbox-label');
      if (lgpdLabel) lgpdLabel.classList.add('error');
      showError(lgpdCheckbox);
      if (!firstInvalid) firstInvalid = lgpdCheckbox;
    }

    // Scroll to first error
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
  }

  function showError(element) {
    var group = element.closest('.form-group');
    if (!group) return;
    var err = group.querySelector('.form-error');
    if (err) err.hidden = false;
  }

  // Clear error on input change
  form.addEventListener('input', function (e) {
    var el = e.target;
    el.classList.remove('error');
    var group = el.closest('.form-group');
    if (group) {
      var err = group.querySelector('.form-error');
      if (err) err.hidden = true;
      var lgpdLabel = group.querySelector('.form-lgpd-check');
      if (lgpdLabel) lgpdLabel.classList.remove('error');
    }
  });

  form.addEventListener('change', function (e) {
    var el = e.target;
    el.classList.remove('error');
    var group = el.closest('.form-group');
    if (group) {
      var err = group.querySelector('.form-error');
      if (err) err.hidden = true;
    }
  });

  // ============================================================
  // CONDITIONAL FIELDS
  // ============================================================

  // LinkedIn URL: show/hide based on radio
  var linkedinRadios = form.querySelectorAll('input[name="linkedin"]');
  var linkedinGroup  = document.getElementById('linkedin-url-group');
  var linkedinInput  = document.getElementById('linkedin-url');

  linkedinRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (this.value === 'Sim') {
        linkedinGroup.hidden = false;
      } else {
        linkedinGroup.hidden = true;
        if (linkedinInput) linkedinInput.value = '';
      }
    });
  });

  // "Outro" / "Outra" text fields: show when that radio/checkbox is selected
  form.querySelectorAll('.form-radio-group, .form-checkbox-group').forEach(function (group) {
    var otherInput = group.parentElement.querySelector('.form-other-input');
    if (!otherInput) return;

    group.addEventListener('change', function () {
      var isRadio = group.classList.contains('form-radio-group');

      if (isRadio) {
        var checked = group.querySelector('input:checked');
        var val = checked ? checked.value.toLowerCase() : '';
        if (val === 'outro' || val === 'outra') {
          otherInput.hidden = false;
          otherInput.focus();
        } else {
          otherInput.hidden = true;
          otherInput.value = '';
        }
      } else {
        // Checkbox: look for "Outra" or "Outra(s)" checked
        var outroCheckbox = null;
        group.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
          if (cb.value.toLowerCase().startsWith('outra')) outroCheckbox = cb;
        });
        if (outroCheckbox && outroCheckbox.checked) {
          otherInput.hidden = false;
        } else {
          otherInput.hidden = true;
          otherInput.value = '';
        }
      }
    });
  });

  // ============================================================
  // FORM SUBMIT
  // ============================================================

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    // Collect form data (for future use)
    var formData = new FormData(form);
    var data = {};
    formData.forEach(function (value, key) {
      if (data[key]) {
        // Multiple values (checkboxes)
        if (!Array.isArray(data[key])) data[key] = [data[key]];
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });

    // Log for debugging (remove in production)
    console.log('Inscrição enviada:', data);

    // Show success
    form.hidden = true;
    document.querySelector('.form-nav').style.display = 'none';
    successBox.hidden = false;
  });

  // ============================================================
  // RESET
  // ============================================================

  function resetForm() {
    form.reset();
    form.hidden = false;
    successBox.hidden = true;
    var formNav = document.querySelector('.form-nav');
    if (formNav) formNav.style.display = '';

    // Hide conditional fields
    if (linkedinGroup) linkedinGroup.hidden = true;
    form.querySelectorAll('.form-other-input').forEach(function (inp) {
      inp.hidden = true;
    });

    // Clear errors
    form.querySelectorAll('.form-error').forEach(function (err) {
      err.hidden = true;
    });
    form.querySelectorAll('.error').forEach(function (el) {
      el.classList.remove('error');
    });

    // Reset to step 0
    showStep(0);
  }

  // ============================================================
  // INIT
  // ============================================================

  showStep(0);
  bindTriggers();

})();
