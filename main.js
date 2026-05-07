let exchangeRates = {};

const currencyEmojis = {
  USD: "💵",
  GBP: "💷",
  EUR: "💶",
};

// Removed "duty" from moneyFields because it's now percentage-based
const moneyFields = ["price", "packing", "shipping", "clearance", "bankCharges", "others"];

document.addEventListener("DOMContentLoaded", async () => {
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

  // Attach listeners to update Total Foreign Cost live
  ["price", "packing", "shipping"].forEach(id => {
    const input = byId(id);
    if (input) input.addEventListener("input", updateTotalForeign);
  });
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
  setText("totalForeignLabel", `🌐 Total Foreign Cost (${currency})`);

  // Placeholders
  const placeholders = {
    price: "price",
    packing: "packing cost",
    shipping: "shipping cost",
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
    bank.value = (rate * 1.02).toFixed(4);
  } else {
    if (ex) ex.value = "";
    if (bank) bank.value = "";
  }

  // Refresh total foreign cost display
  updateTotalForeign();
}

function resetFields() {
  moneyFields.forEach((id) => {
    const input = byId(id);
    if (input) input.value = "";
  });

  const dutyPercent = byId("dutyPercent");
  if (dutyPercent) dutyPercent.value = "";

  const totalForeign = byId("totalForeign");
  if (totalForeign) totalForeign.value = "";

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

/* ---------- Foreign Cost updater ---------- */

function updateTotalForeign() {
  const price = numberOf("price");
  const packing = numberOf("packing");
  const shipping = numberOf("shipping");
  const totalForeign = price + packing + shipping;

  // Show formatted value with commas in readonly text field
  setValue("totalForeign", formatNumber(totalForeign));
}

/* ---------- Core calculation ---------- */

function calculateLanding() {
  const currency = valueOf("currencySelector") || "USD";
  const instrumentName = (valueOf("instrumentName") || "Unnamed Instrument").trim();

  const price = numberOf("price");
  const packing = numberOf("packing");
  const shipping = numberOf("shipping");
  const clearance = numberOf("clearance");
  const bankCharges = numberOf("bankCharges");
  const others = numberOf("others");

  const dutyPercent = numberOf("dutyPercent"); // percentage input
  const exchangeRate = numberOf("bankRate") || numberOf("exchangeRate") || 0;

  const totalForeign = price + packing + shipping;
  const totalINR = totalForeign * exchangeRate;
  const dutyValue = (totalINR * dutyPercent) / 100;
  const landingINR = totalINR + dutyValue + clearance + bankCharges + others;

  // Update readonly field
  setValue("totalForeign", formatNumber(totalForeign));

  const resultLines = [
    `📝 Instrument: ${instrumentName || "Unnamed Instrument"}`,
    `📊 Total Foreign Cost (${currency}): ${formatNumber(totalForeign)}`,
    `🎯 Landing Cost (INR): ₹${formatNumber(landingINR, "en-IN")}`,
  ];

  const breakdownLines = [
    "💱 Foreign Cost × Exchange Rate = INR",
    `(${price} + ${packing} + ${shipping}) × ${exchangeRate.toFixed(4)} = ₹${formatNumber(totalINR, "en-IN")}`,
    "",
    `➕ Duty (${dutyPercent}% of INR) = ₹${formatNumber(dutyValue, "en-IN")}`,
    `➕ Clearance, Bank Charges, Others`,
    `₹${formatNumber(totalINR, "en-IN")} + ₹${formatNumber(dutyValue, "en-IN")} + ₹${clearance} + ₹${bankCharges} + ₹${others}`,
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

function setValue(id, val) {
  const el = byId(id);
  if (el) el.value = val;
}

function formatNumber(num, locale = "en-US") {
  return Number(num || 0).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = byId("submitBtn");
  if (submitBtn) submitBtn.addEventListener("click", submitToSheet);
});

async function submitToSheet() {
  const payload = {
    instrumentName: valueOf("instrumentName"),
    currency: valueOf("currencySelector"),
    price: numberOf("price"),
    packing: numberOf("packing"),
    shipping: numberOf("shipping"),
    totalForeign: numberOf("totalForeign"),
    dutyPercent: numberOf("dutyPercent"),
    clearance: numberOf("clearance"),
    bankCharges: numberOf("bankCharges"),
    others: numberOf("others"),
    landingINR: byId("resultDisplay")?.textContent || ""
  };

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxpS7mlS9w0zKAJcEGz3mIX57s3Po_-pHLY93rlJLHP5HrhaWNXv_rpo4o5C0R0f1J8lQ/exec", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    if (response.ok) {
      alert("✅ Record submitted to Google Sheet!");
    } else {
      alert("❌ Failed to submit record.");
    }
  } catch (err) {
    console.error("Error submitting:", err);
    alert("⚠️ Error submitting record.");
  }
}

