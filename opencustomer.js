let currentCustomer = {};

function openCustomer(customer) {
  currentCustomer = customer;

  // Trykk på faneknappen for kunden
  const customerTabButton = document.getElementById("customertabbutton");
  if (customerTabButton) customerTabButton.click();

  document.querySelector("[data-field='type']").textContent = "Kundenummer: " + (customer.customernr || "");
  document.querySelector("[data-field='name']").textContent = "Kundenavn: " + (customer.name || "");
  document.querySelector("[data-field='address']").textContent = "Adresse: " + (customer.address || "");

  const postAndCity = [customer.postcode, customer.city].filter(Boolean).join(" ");
  document.querySelector("[data-field='postcode_city']").textContent = "Poststed: " + postAndCity;

  const emailContainer = document.querySelector("[data-field='email']");
    if (customer.email) {
    emailContainer.innerHTML = `E-post: <span class="email-text">${customer.email}</span>`;
    } else {
    emailContainer.textContent = "E-post: –";
    }
}

document.querySelector('.customerinfoconteiner').addEventListener('click', function (e) {
  const fieldEl = e.target.closest('.editable');
  if (!fieldEl) return;

  const field = fieldEl.dataset.field;
  if (!field) return;

  handleEditField(fieldEl, field);
});

function handleEditField(fieldEl, field) {
  let currentValue = currentCustomer[field];

  if (field === 'postcode_city') {
    currentValue = [currentCustomer.postcode, currentCustomer.city].filter(Boolean).join(" ");
  } else if (field === 'email') {
    currentValue = currentCustomer.email || "";
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentValue || '';
  input.className = 'edit-input';

  fieldEl.innerHTML = '';
  fieldEl.appendChild(input);
  input.focus();

  input.addEventListener('blur', async () => {
    const newValue = input.value.trim();

    if (field === 'postcode_city') {
      const [postcode, ...cityParts] = newValue.split(' ');
      currentCustomer.postcode = postcode || '';
      currentCustomer.city = cityParts.join(' ') || '';
    } else if (field === 'email') {
      currentCustomer.email = newValue;
    } else {
      currentCustomer[field] = newValue;
    }

    // Vis ny data
    openCustomer(currentCustomer);

    // Send til server
    await sendUpdateToServer(currentCustomer.client, field, newValue);
  });
}

async function sendUpdateToServer(clientId, field, value) {
  try {
    const response = await fetch('/api/update-customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, field, value })
    });

    if (!response.ok) {
      console.error('Feil ved lagring:', await response.text());
    }
  } catch (error) {
    console.error('Nettverksfeil:', error);
  }
}
