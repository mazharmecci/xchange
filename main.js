// main.js

// When the page loads, fetch rates and wire up UI
window.addEventListener("DOMContentLoaded", async () => {
  // Load exchange rates from Google Sheet (function comes from exchange-rate-loader.js)
  const rates = await loadExchangeRates();

  const currencySelector = document.getElementById("currencySelector");
  const exchangeRateInput = document.getElementById("exchangeRate");
  const bankRateInput = document.getElementById("bankRate");
  const calcBtn = document.getElementById("calcBtn");
  const breakdownBtn = document.getElementById("breakdownBtn");
  const resultDisplay = document.getElementById("resultDisplay");
  const breakdownDetails = document.getElementById("breakdownDetails");

  function updateRates() {
    const currency = currencySelector.value;
    const rate = rates[currency];
    if (!rate) return;

    exchangeRateInput.value = rate.toFixed(4);
    bankRateInput.value = (rate * 1.02).toFixed(4); // simple markup
  }

  currencySelector.addEventListener("change", updateRates);
  updateRates();

  calcBtn.addEventListener("click", () => {
    const price = Number(document.getElementById("price").value || 0);
    const packing = Number(document.getElementById("packing").value || 0);
    const shipping = Number(document.getElementById("shipping").value || 0);
    const duty = Number(document.getElementById("duty").value || 0);
    const clearance = Number(document.getElementById("clearance").value || 0);
    const bankCharges = Number(document.getElementById("bankCharges").value || 0);
    const others = Number(document.getElementById("others").value || 0);
    const rate = Number(bankRateInput.value || exchangeRateInput.value || 0);

    const foreignTotal = price + packing + shipping;
    const inrBase = foreignTotal * rate;
    const inrExtras = duty + clearance + bankCharges + others;
    const landedCost = inrBase + inrExtras;

    resultDisplay.textContent = `💰 Total Landed Cost (INR): ${landedCost.toFixed(2)}`;

    breakdownDetails.textContent =
      `Foreign total: ${foreignTotal.toFixed(2)}\n` +
      `Rate used: ${rate.toFixed(4)}\n` +
      `INR base: ${inrBase.toFixed(2)}\n` +
      `INR extras: ${inrExtras.toFixed(2)}\n`;
  });

  breakdownBtn.addEventListener("click", () => {
    breakdownDetails.style.display =
      breakdownDetails.style.display === "none" ? "block" : "none";
  });
});
