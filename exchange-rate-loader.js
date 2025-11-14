function loadExchangeRates() {
  document.getElementById("rateStatus").innerText = "⏳ Fetching rate…";

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

      document.getElementById("currencySelector").value = "EUR";
      updateCurrency();
    })
    .catch(error => {
      console.error("Error loading exchange rates:", error);
      document.getElementById("rateStatus").innerText = "❌ Failed to fetch rate";
    });
}

function updateCurrency() {
  const currency = document.getElementById("currencySelector").value;
  const emoji = currencyEmojis[currency] || "💵";

  document.getElementById("priceLabel").innerText = `${emoji} Instrument Price (${currency})`;
  document.getElementById("packingLabel").innerText = `📦 Packing Price (${currency})`;
  document.getElementById("shippingLabel").innerText = `🚚 Shipping Cost (${currency})`;

  const rate = exchangeRates[currency];
  if (rate) {
    document.getElementById("exchangeRate").value = rate.toFixed(4);
    document.getElementById("bankRate").value = (rate * 1.02).toFixed(4);
    document.getElementById("rateStatus").innerText = `✅ Rate synced from Google Sheet`;
  } else {
    document.getElementById("exchangeRate").value = "";
    document.getElementById("bankRate").value = "";
    document.getElementById("rateStatus").innerText = `⚠️ Rate not available`;
  }
}
