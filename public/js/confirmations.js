function confirmAction(message, callback) {
  const modal = document.createElement('div');
  modal.classList.add('modal', 'fade', 'confirm-modal');
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0">
          <div class="d-flex align-items-center gap-2">
            <div class="confirm-icon"><i class="fas fa-question-circle"></i></div>
            <h5 class="modal-title">Konfirmasi</h5>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">${message}</p>
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="btn btn-gradient-secondary" data-bs-dismiss="modal">Batal</button>
          <button type="button" class="btn btn-gradient-danger" id="confirmBtn">Lanjutkan</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  modal.querySelector('#confirmBtn').addEventListener('click', () => {
    callback();
    bsModal.hide();
  });

  modal.addEventListener('hidden.bs.modal', () => {
    modal.remove();
  });
}

