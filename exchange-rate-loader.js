// exchange-rate-loader.js
const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkQQEIXxm-NcZ0KOeac1vvpDCOivnL_BRFKvktxsmroOda6p7wiliFm80nAycgGGJe6Zzo2JqPOXfK/pub?gid=0&single=true&output=csv";

async function loadExchangeRates() {
  setStatus("⏳ Fetching rate…");

  try {
    const response = await fetch(sheetURL);
    if (!response.ok) throw new Error("Network response not ok");

    const csvData = await response.text();
    const rates = parseExchangeRates(csvData);

    // Default currency
    const selector = document.getElementById("currencySelector");
    if (selector) selector.value = "EUR";

    setStatus(`✅ Rate synced from Google Sheet\n🕒 Last synced: ${formatTimestamp(new Date())}`);

    lockRateFields();
    return rates;
  } catch (error) {
    console.error("Error loading exchange rates:", error);
    setStatus("❌ Failed to fetch rate. Please enter manually.");

    unlockRateFields();

    // Fallback defaults
    return { USD: 90, GBP: 120, EUR: 105 };
  }
}

function parseExchangeRates(csvData) {
  const rates = {};
  const rows = csvData.split("\n");
  rows.forEach((row) => {
    const cols = row.split(",");
    const currency = cols[2]?.trim();
    const rate = parseFloat(cols[3]);
    if (currency && !isNaN(rate)) {
      rates[currency] = rate;
    }
  });
  return rates;
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
  const statusBox = document.getElementById("rateStatus");
  if (statusBox) statusBox.innerText = message;
}

function lockRateFields() {
  document.getElementById("exchangeRate").readOnly = true;
  document.getElementById("bankRate").readOnly = true;
}

function unlockRateFields() {
  const ex = document.getElementById("exchangeRate");
  const bank = document.getElementById("bankRate");
  ex.readOnly = false;
  bank.readOnly = false;
  ex.placeholder = "Enter rate manually";
  bank.placeholder = "Enter bank rate manually";

  // Auto-calc bank rate when exchange rate entered
  ex.addEventListener("input", () => {
    const val = parseFloat(ex.value);
    if (!isNaN(val)) bank.value = (val * 1.02).toFixed(4);
  });
}
