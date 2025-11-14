let exchangeRates = {};

const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkQQEIXxm-NcZ0KOeac1vvpDCOivnL_BRFKvktxsmroOda6p7wiliFm80nAycgGGJe6Zzo2JqPOXfK/pub?gid=0&single=true&output=csv";

function loadExchangeRates() {
  const statusEl = document.getElementById("rateStatus");
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

function updateCurrency() {
  const currency = document.getElementById("currencySelector").value;
  const emoji = currencyEmojis[currency] || "💵";

  // Update labels
  document.getElementById("priceLabel").innerText = `${emoji} Instrument Price (${currency})`;
  document.getElementById("packingLabel").innerText = `📦 Packing Price (${currency})`;
  document.getElementById("shippingLabel").innerText = `🚚 Shipping Cost (${currency})`;

  const rate = exchangeRates[currency];
  if (rate) {
    document.getElementById("exchangeRate").value = rate.toFixed(4);
    document.getElementById("bankRate").value = (rate * 1.02).toFixed(4);
    setStatus("✅ Rate synced from Google Sheet");
  } else {
    document.getElementById("exchangeRate").value = "";
    document.getElementById("bankRate").value = "";
    setStatus("⚠️ Rate not available");
  }
}

function calculateLanding() {
  const currency = document.getElementById("currencySelector").value;

  // Foreign costs
  const price = getValue("price");
  const packing = getValue("packing");
  const shipping = getValue("shipping");
  const exchangeRate = getValue("exchangeRate");

  // INR costs
  const duty = getValue("duty");
  const clearance = getValue("clearance");
  const bankCharges = getValue("bankCharges");
  const others = getValue("others");

  const totalForeign = price + packing + shipping;
  const totalINR = totalForeign * exchangeRate;
  const landingINR = totalINR + duty + clearance + bankCharges + others;

  // Display result
  document.getElementById("resultDisplay").innerText =
    `📊 Total Cost (${currency}): ${formatNumber(totalForeign)}\n` +
    `🎯 Landing Cost (INR): ₹${formatNumber(landingINR, "en-IN")}`;

  // Breakdown
  const breakdownText =
    `💱 Foreign Cost × Exchange Rate = INR\n` +
    `(${price} + ${packing} + ${shipping}) × ${exchangeRate.toFixed(4)} = ₹${formatNumber(totalINR, "en-IN")}\n\n` +
    `➕ Add Duty, Clearance, Bank Charges, Others\n` +
    `₹${formatNumber(totalINR, "en-IN")} + ₹${duty} + ₹${clearance} + ₹${bankCharges} + ₹${others}\n\n` +
    `🎯 Final Landing Cost = ₹${formatNumber(landingINR, "en-IN")}`;

  document.getElementById("breakdownDetails").innerText = breakdownText;
}

/* ---------- Helpers ---------- */

function getValue(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function formatNumber(num, locale = "en-US") {
  return num.toLocaleString(locale, { minimumFractionDigits: 2 });
}

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
