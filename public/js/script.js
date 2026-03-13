(() => {
  const toggler = document.querySelector('[data-sidebar-toggle]');
  const sidebar = document.querySelector('.sidebar');

  if (toggler && sidebar) {
    toggler.addEventListener('click', () => sidebar.classList.toggle('d-none'));
  }

  // auto-hide flash after 4s
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach((alert) => {
    setTimeout(() => {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      bsAlert.close();
    }, 4000);
  });

  const confirmButtons = document.querySelectorAll('[data-confirm-url]');
  confirmButtons.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      if (typeof confirmAction !== 'function') {
        return;
      }

      confirmAction(btn.dataset.confirmMessage || 'Yakin melanjutkan aksi ini?', () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = btn.dataset.confirmUrl;

        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = btn.dataset.confirmMethod || 'DELETE';

        form.appendChild(methodInput);
        document.body.appendChild(form);
        form.submit();
      });
    });
  });

  const confirmSubmitButtons = document.querySelectorAll('[data-confirm-submit]');
  confirmSubmitButtons.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      if (typeof confirmAction !== 'function') return;
      const form = btn.closest('form');
      if (!form) return;
      confirmAction(btn.dataset.confirmMessage || 'Yakin menyimpan perubahan?', () => {
        form.submit();
      });
    });
  });

  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const table = document.querySelector('.table');
  function applyMenuFilters() {
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');
    const q = (searchInput && searchInput.value || '').toLowerCase();
    const cat = categoryFilter && categoryFilter.value || '';
    rows.forEach((tr) => {
      const nameCell = tr.children[1];
      const categoryCell = tr.children[2];
      const nameText = nameCell ? nameCell.textContent.toLowerCase() : '';
      const categoryText = categoryCell ? categoryCell.textContent.toLowerCase() : '';
      const matchSearch = !q || nameText.includes(q);
      const matchCategory = !cat || categoryText.includes(cat);
      tr.style.display = matchSearch && matchCategory ? '' : 'none';
    });
  }
  if (searchInput) searchInput.addEventListener('input', applyMenuFilters);
  if (categoryFilter) categoryFilter.addEventListener('change', applyMenuFilters);
  applyMenuFilters();

  function showToast(type, message) {
    const container = document.getElementById('toastContainer') || (function(){
      const c = document.createElement('div');
      c.id = 'toastContainer';
      c.className = 'toast-container position-fixed top-0 end-0 p-3';
      c.style.zIndex = 1080;
      document.body.appendChild(c);
      return c;
    })();
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center border-0 mb-2 toast-glass toast-${type}`;
    toastEl.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
    container.appendChild(toastEl);
    const t = new bootstrap.Toast(toastEl, { delay: 4000 });
    t.show();
  }
  const flashData = document.getElementById('flashData');
  if (flashData) {
    const s = flashData.getAttribute('data-success');
    const e = flashData.getAttribute('data-error');
    if (s) showToast('success', s);
    if (e) showToast('danger', e);
  }
})();

