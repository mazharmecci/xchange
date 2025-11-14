let exchangeRates = {};

const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkQQEIXxm-NcZ0KOeac1vvpDCOivnL_BRFKvktxsmroOda6p7wiliFm80nAycgGGJe6Zzo2JqPOXfK/pub?gid=0&single=true&output=csv";

function loadExchangeRates() {
  setStatus("⏳ Fetching rate…");

  fetch(sheetURL)
    .then((response) => response.text())
    .then((data) => {
      parseExchangeRates(data);

      // Default currency
      document.getElementById("currencySelector").value = "EUR";
      updateCurrency();

      // Timestamp
      const formatted = formatTimestamp(new Date());
      setStatus(`✅ Rate synced from Google Sheet\n🕒 Last synced: ${formatted}`);
    })
    .catch((error) => {
      console.error("Error loading exchange rates:", error);
      setStatus("❌ Failed to fetch rate");
    });
}

function parseExchangeRates(csvData) {
  const rows = csvData.split("\n");
  rows.forEach((row) => {
    const cols = row.split(",");
    const currency = cols[2]?.trim(); // Column C
    const rate = parseFloat(cols[3]); // Column D
    if (currency && !isNaN(rate)) {
      exchangeRates[currency] = rate;
    }
  });
}

/* ---------- Helpers ---------- */

function formatTimestamp(date) {
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function setStatus(message) {
  document.getElementById("rateStatus").innerText = message;
}
