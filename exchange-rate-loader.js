let exchangeRates = {};

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkQQEIXxm-NcZ0KOeac1vvpDCOivnL_BRFKvktxsmroOda6p7wiliFm80nAycgGGJe6Zzo2JqPOXfK/pub?gid=0&single=true&output=csv";

function loadExchangeRates() {
  const statusEl = document.getElementById("rateStatus");
  statusEl.innerText = "⏳ Fetching rate…";

  fetch(sheetURL)
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n');
      rows.forEach(row => {
        const cols = row.split(',');
        const currency = cols[2]?.trim(); // Column C
        const rate = parseFloat(cols[3]); // Column D
        if (currency && !isNaN(rate)) {
          exchangeRates[currency] = rate;
        }
      });

      // Set default currency and update UI
      document.getElementById("currencySelector").value = "EUR";
      updateCurrency();

      // Add timestamp
      const now = new Date();
      const formatted = now.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      statusEl.innerText = `✅ Rate synced from Google Sheet\n🕒 Last synced: ${formatted}`;
    })
    .catch(error => {
      console.error("Error loading exchange rates:", error);
      statusEl.innerText = "❌ Failed to fetch rate";
    });
}

function updateCurrency() {
  const currency = document.getElementById("currencySelector").value;
  const emoji = currencyEmojis[currency] || "💵";

  document.getElementById("priceLabel").innerText = `${emoji} Instrument Price (${currency})`;
  document.getElementById("packingLabel").innerText = `📦 Packing Price (${currency})`;
  document.getElementById("shippingLabel").innerText = `🚚 Shipping Cost (${currency})`;

  const rate = exchangeRates[currency];
  const statusEl = document.getElementById("rateStatus");

  if (rate) {
    document.getElementById("exchangeRate").value = rate.toFixed(4);
    document.getElementById("bankRate").value = (rate * 1.02).toFixed(4);
    statusEl.innerText = `✅ Rate synced from Google Sheet`;
  } else {
    document.getElementById("exchangeRate").value = "";
    document.getElementById("bankRate").value = "";
    statusEl.innerText = `⚠️ Rate not available`;
  }
}
