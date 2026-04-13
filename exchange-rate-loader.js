// exchange-rate-loader.js
const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkQQEIXxm-NcZ0KOeac1vvpDCOivnL_BRFKvktxsmroOda6p7wiliFm80nAycgGGJe6Zzo2JqPOXfK/pub?gid=0&single=true&output=csv";

/**
 * Load exchange rates from Google Sheet (CSV).
 * Returns a Promise that resolves with {USD: rate, GBP: rate, EUR: rate}.
 */
async function loadExchangeRates() {
  setStatus("⏳ Fetching rate…");

  try {
    const response = await fetch(sheetURL);
    if (!response.ok) throw new Error("Network response not ok");

    const csvData = await response.text();
    const rates = parseExchangeRates(csvData);

    // Default currency selection
    const selector = document.getElementById("currencySelector");
    if (selector) {
      selector.value = "EUR";
    }

    // Timestamp
    const formatted = formatTimestamp(new Date());
    setStatus(`✅ Rate synced from Google Sheet\n🕒 Last synced: ${formatted}`);

    // Lock fields since we have live data
    lockRateFields();

    return rates;
  } catch (error) {
    console.error("Error loading exchange rates:", error);
    setStatus("❌ Failed to fetch rate. Please enter manually.");

    // Unlock fields for manual input
    unlockRateFields();

    // Provide fallback defaults
    return { USD: 90, GBP: 120, EUR: 105 };
  }
}

/**
 * Parse CSV data into exchangeRates object.
 * Expected columns: ... , Currency (col 3), Rate (col 4)
 */
function parseExchangeRates(csvData) {
  const rates = {};
  const rows = csvData.split("\n");
  rows.forEach((row) => {
    const cols = row.split(",");
    const currency = cols[2]?.trim(); // Column C
    const rate = parseFloat(cols[3]); // Column D
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
  if (statusBox) {
    statusBox.innerText = message;
  }
}

function lockRateFields() {
  document.getElementById("exchangeRate").readOnly = true;
  document.getElementById("bankRate").readOnly = true;
}

function unlockRateFields() {
  document.getElementById("exchangeRate").readOnly = false;
  document.getElementById("bankRate").readOnly = false;
  document.getElementById("exchangeRate").placeholder = "Enter rate manually";
  document.getElementById("bankRate").placeholder = "Enter bank rate manually";
}
