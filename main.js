// main.js

let exchangeRates = {};

const currencyEmojis = {
  USD: "💵",
  GBP: "💷",
  EUR: "💶",
};

const moneyFields = ["price", "packing", "shipping", "duty", "clearance", "bankCharges", "others"];

document.addEventListener("DOMContentLoaded", async () => {
  // Load exchange rates from Google Sheet (defined in exchange-rate-loader.js)
  try {
    exchangeRates = await loadExchangeRates();
  } catch (err) {
    console.error("Failed to load exchange rates, using defaults from loader.", err);
  }

  const currencySelector = byId("currencySelector");
  const calcBtn = byId("calcBtn");
  const breakdownBtn = byId("breakdownBtn");

  if (currencySelector) {
    updateCurrency();
    currencySelector.addEventListener("change", () => {
      resetFields();
      updateCurrency();
    });
  }

  if (calcBtn) calcBtn.addEventListener("click", calculateLanding);
  if (breakdownBtn) breakdownBtn.addEventListener("click", toggleBreakdown);
});

/* ---------- UI Updaters ---------- */

function updateCurrency() {
  const currencySelector = byId("currencySelector");
  if (!currencySelector) return;

  const currency = currencySelector.value;
  const emoji = currencyEmojis[currency] || "💵";

  // Labels
  setText("priceLabel", `${emoji} Instrument Price (${currency})`);
  setText("packingLabel", `📦 Packing Price (${currency})`);
  setText("shippingLabel", `🚚 Shipping Cost (${currency})`);

  // Placeholders (friendly text, not raw IDs)
  const placeholders = {
    price: "price",
    packing: "packing cost",
    shipping: "shipping cost",
    duty: "duty",
    clearance: "clearance cost",
    bankCharges: "bank charges",
    others: "other costs",
  };

  moneyFields.forEach((id) => {
    const input = byId(id);
    if (input) input.placeholder = `${emoji} Enter ${placeholders[id] || id}`;
  });

  // Exchange / bank rates
  const rate = exchangeRates[currency];
  const ex = byId("exchangeRate");
  const bank = byId("bankRate");

  if (rate && ex && bank) {
    ex.value = rate.toFixed(4);
    bank.value = (rate * 1.02).toFixed(4); // simple markup
  } else {
    if (ex) ex.value = "";
    if (bank) bank.value = "";
  }
}

function resetFields() {
  moneyFields.forEach((id) => {
    const input = byId(id);
    if (input) input.value = "";
  });

  const resultDisplay = byId("resultDisplay");
  const breakdownDetails = byId("breakdownDetails");
  if (resultDisplay) resultDisplay.textContent = "";
  if (breakdownDetails) {
    breakdownDetails.textContent = "";
    breakdownDetails.style.display = "none";
  }

  const breakdownBtn = byId("breakdownBtn");
  if (breakdownBtn) breakdownBtn.textContent = "📊 View Breakdown";
}

/* ---------- Core calculation ---------- */

function calculateLanding() {
  const currency = valueOf("currencySelector") || "USD";
  const instrumentName = (valueOf("instrumentName") || "Unnamed Instrument").trim();

  const price = numberOf("price");
  const packing = numberOf("packing");
  const shipping = numberOf("shipping");
  const duty = numberOf("duty");
  const clearance = numberOf("clearance");
  const bankCharges = numberOf("bankCharges");
  const others = numberOf("others");

  const exchangeRate = numberOf("bankRate") || numberOf("exchangeRate") || 0;

  const totalForeign = price + packing + shipping;
  const totalINR = totalForeign * exchangeRate;
  const landingINR = totalINR + duty + clearance + bankCharges + others;

  const resultLines = [
    `📝 Instrument: ${instrumentName || "Unnamed Instrument"}`,
    `📊 Total Cost (${currency}): ${formatNumber(totalForeign)}`,
    `🎯 Landing Cost (INR): ₹${formatNumber(landingINR, "en-IN")}`,
  ];

  const breakdownLines = [
    "💱 Foreign Cost × Exchange Rate = INR",
    `(${price} + ${packing} + ${shipping}) × ${exchangeRate.toFixed(4)} = ₹${formatNumber(totalINR, "en-IN")}`,
    "",
    "➕ Add Duty, Clearance, Bank Charges, Others",
    `₹${formatNumber(totalINR, "en-IN")} + ₹${duty} + ₹${clearance} + ₹${bankCharges} + ₹${others}`,
    "",
    `🎯 Final Landing Cost = ₹${formatNumber(landingINR, "en-IN")}`,
  ];

  const resultDisplay = byId("resultDisplay");
  const breakdownDetails = byId("breakdownDetails");

  if (resultDisplay) resultDisplay.textContent = resultLines.join("\n");
  if (breakdownDetails) {
    breakdownDetails.textContent = breakdownLines.join("\n");
    breakdownDetails.style.display = "none";
  }

  const breakdownBtn = byId("breakdownBtn");
  if (breakdownBtn) breakdownBtn.textContent = "📊 View Breakdown";
}

/* ---------- Breakdown toggle ---------- */

function toggleBreakdown() {
  const box = byId("breakdownDetails");
  const btn = byId("breakdownBtn");
  if (!box || !btn) return;

  const isHidden = box.style.display === "none" || !box.style.display;
  box.style.display = isHidden ? "block" : "none";
  btn.textContent = isHidden ? "🔽 Hide Breakdown" : "📊 View Breakdown";
}

/* ---------- Helpers ---------- */

function byId(id) {
  return document.getElementById(id);
}

function valueOf(id) {
  const el = byId(id);
  return el ? el.value : "";
}

function numberOf(id) {
  const val = parseFloat(valueOf(id));
  return isNaN(val) ? 0 : val;
}

function setText(id, text) {
  const el = byId(id);
  if (el) el.textContent = text;
}

function formatNumber(num, locale = "en-US") {
  return Number(num || 0).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
