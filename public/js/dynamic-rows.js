document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('itemsBody');
  const addRowBtn = document.getElementById('addRow');
  const grandTotalDisplay = document.getElementById('grandTotal');
  const totalInput = document.getElementById('totalInput');

  if (!tableBody) return;

  const formatCurrency = (value) => `Rp ${value.toLocaleString('id-ID')}`;
  const baseRowTemplate = tableBody.querySelector('.item-row').cloneNode(true);

  const recalc = () => {
    let grandTotal = 0;
    tableBody.querySelectorAll('.item-row').forEach((row) => {
      const price = Number(row.querySelector('.price-input').value) || 0;
      const qty = Number(row.querySelector('.quantity-input').value) || 0;
      const subtotal = price * qty;
      row.querySelector('.subtotal-input').value = subtotal;
      grandTotal += subtotal;
    });

    grandTotalDisplay.textContent = formatCurrency(grandTotal);
    totalInput.value = grandTotal;
  };

  const resetRowInputs = (row, index) => {
    row.querySelectorAll('select, input').forEach((input) => {
      if (input.name) {
        input.name = input.name.replace(/\d+/, index);
      }

      if (input.classList.contains('menu-select')) {
        input.selectedIndex = 0;
      } else if (input.classList.contains('quantity-input')) {
        input.value = 1;
      } else {
        input.value = '';
      }
    });
  };
  resetRowInputs(baseRowTemplate, 0);

  const bindRowEvents = (row) => {
    const menuSelect = row.querySelector('.menu-select');
    const quantityInput = row.querySelector('.quantity-input');
    const priceInput = row.querySelector('.price-input');

    menuSelect.addEventListener('change', (e) => {
      const option = e.target.selectedOptions[0];
      const price = option ? option.dataset.price || 0 : 0;
      priceInput.value = price;
      recalc();
    });

    quantityInput.addEventListener('input', recalc);

    const removeBtn = row.querySelector('.remove-row');
    removeBtn.addEventListener('click', () => {
      const rows = tableBody.querySelectorAll('.item-row');
      if (rows.length === 1) {
        resetRowInputs(rows[0], 0);
        recalc();
        return;
      }
      row.remove();
      recalc();
    });
  };

  const addNewRow = () => {
    const index = tableBody.querySelectorAll('.item-row').length;
    const blueprint = baseRowTemplate.cloneNode(true);
    blueprint.querySelector('.remove-row').disabled = false;

    resetRowInputs(blueprint, index);
    bindRowEvents(blueprint);
    tableBody.appendChild(blueprint);
    return blueprint;
  };

  if (addRowBtn) {
    addRowBtn.addEventListener('click', () => {
      addNewRow();
    });
  }

  document.querySelectorAll('.add-popular').forEach((btn) => {
    btn.addEventListener('click', () => {
      const rows = Array.from(tableBody.querySelectorAll('.item-row'));
      let targetRow = rows.find((row) => !row.querySelector('.menu-select').value);

      if (!targetRow) {
        targetRow = addNewRow();
      }

      const select = targetRow.querySelector('.menu-select');
      select.value = btn.dataset.id;
      select.dispatchEvent(new Event('change'));

      const qtyInput = targetRow.querySelector('.quantity-input');
      qtyInput.value = 1;

      recalc();
    });
  });

  const firstRow = tableBody.querySelector('.item-row');
  if (firstRow) {
    firstRow.querySelector('.remove-row').disabled = true;
    resetRowInputs(firstRow, 0);
    bindRowEvents(firstRow);
  }

  recalc();
});

