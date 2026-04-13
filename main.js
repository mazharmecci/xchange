// main.js
let exchangeRates = {};

const currencyEmojis = {
  USD: "💵",
  GBP: "💷",
  EUR: "💶"
};

document.addEventListener("DOMContentLoaded", async () => {
  exchangeRates = await loadExchangeRates();
  updateCurrency();

  document.getElementById("currencySelector").addEventListener("change", updateCurrency);
  document.getElementById("calcBtn").addEventListener("click", calculateLanding);
  document.getElementById("breakdownBtn").addEventListener("click", toggleBreakdown);
});

function updateCurrency() {
  const currency = document.getElementById("currencySelector").value;
  const emoji = currencyEmojis[currency] || "💵";

  // Update labels
  document.getElementById("priceLabel").innerText = `${emoji} Instrument Price (${currency})`;
  document.getElementById("packingLabel").innerText = `📦 Packing Price (${currency})`;
  document.getElementById("shippingLabel").innerText = `🚚 Shipping Cost (${currency})`;

  // Add currency symbol to input placeholders
  ["price", "packing", "shipping", "duty", "clearance", "bankCharges", "others"].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.placeholder = `${emoji} Enter ${id}`;
  });

  // Exchange rate fields stay numeric only
  const rate = exchangeRates[currency];
  document.getElementById("exchangeRate").value = rate ? rate.toFixed(4) : "";
  document.getElementById("bankRate").value = rate ? (rate * 1.02).toFixed(4) : "";
}

function calculateLanding() {
  const currency = document.getElementById("currencySelector").value;
  const instrumentName = document.getElementById("instrumentName").value || "Unnamed Instrument";

  const price = getValue("price");
  const packing = getValue("packing");
  const shipping = getValue("shipping");
  const exchangeRate = getValue("exchangeRate");

  const duty = getValue("duty");
  const clearance = getValue("clearance");
  const bankCharges = getValue("bankCharges");
  const others = getValue("others");

  const totalForeign = price + packing + shipping;
  const totalINR = totalForeign * exchangeRate;
  const landingINR = totalINR + duty + clearance + bankCharges + others;

  document.getElementById("resultDisplay").innerText =
    `📝 Instrument: ${instrumentName}\n` +
    `📊 Total Cost (${currency}): ${formatNumber(totalForeign)}\n` +
    `🎯 Landing Cost (INR): ₹${formatNumber(landingINR, "en-IN")}`;

  const breakdownText =
    `💱 Foreign Cost × Exchange Rate = INR\n` +
    `(${price} + ${packing} + ${shipping}) × ${exchangeRate.toFixed(4)} = ₹${formatNumber(totalINR, "en-IN")}\n\n` +
    `➕ Add Duty, Clearance, Bank Charges, Others\n` +
    `₹${formatNumber(totalINR, "en-IN")} + ₹${duty} + ₹${clearance} + ₹${bankCharges} + ₹${others}\n\n` +
    `🎯 Final Landing Cost = ₹${formatNumber(landingINR, "en-IN")}`;

  document.getElementById("breakdownDetails").innerText = breakdownText;
  document.getElementById("breakdownDetails").style.display = "none";
}

function toggleBreakdown() {
  const box = document.getElementById("breakdownDetails");
  const btn = document.getElementById("breakdownBtn");
  if (box.style.display === "none") {
    box.style.display = "block";
    btn.innerText = "🔽 Hide Breakdown";
  } else {
    box.style.display = "none";
    btn.innerText = "📊 View Breakdown";
  }
}

function getValue(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function formatNumber(num, locale = "en-US") {
  return num.toLocaleString(locale, { minimumFractionDigits: 2 });
}
