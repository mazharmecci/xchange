let exchangeRates = {};

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkQQEIXxm-NcZ0KOeac1vvpDCOivnL_BRFKvktxsmroOda6p7wiliFm80nAycgGGJe6Zzo2JqPOXfK/pub?gid=0&single=true&output=csv";

function loadExchangeRates() {
  fetch(sheetURL)
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n');
      rows.forEach(row => {
        const cols = row.split(',');
        const currency = cols[0]?.trim();
        const rate = parseFloat(cols[3]);
        if (currency && !isNaN(rate)) {
          exchangeRates[currency] = rate;
        }
      });
    })
    .catch(error => {
      console.error("Error loading exchange rates:", error);
    });
}

function updateCurrency() {
  const currency = document.getElementById("currencySelector").value;

  document.getElementById("priceLabel").innerText = `💵 Instrument Price (${currency})`;
  document.getElementById("packingLabel").innerText = `📦 Packing Price (${currency})`;
  document.getElementById("shippingLabel").innerText = `🚚 Shipping Cost (${currency})`;

  const rate = exchangeRates[currency] || 0;
  document.getElementById("exchangeRate").value = rate.toFixed(4);
  document.getElementById("bankRate").value = (rate * 1.02).toFixed(4);
}
