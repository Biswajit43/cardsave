export function detectNetwork(cardNumber = "") {
  const n = String(cardNumber).replace(/\s+/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^(60|65|81|82|508)/.test(n)) return "RuPay";
  return "Other";
}

const UPI_HANDLE_RULES = [
  { re: /@ybl$|@ibl$|@axl$/i, app: "PhonePe" },
  { re: /@paytm$/i, app: "Paytm" },
  { re: /@upi$/i, app: "BHIM" },
  { re: /@ok(hdfcbank|icici|sbi|axis|bizaxis)$/i, app: "GPay" },
];

export function detectUpiApp(upiId = "") {
  for (const { re, app } of UPI_HANDLE_RULES) {
    if (re.test(upiId)) return app;
  }
  return "Other";
}

// Lightweight heuristic strength score (0-4) — no external dependency.
export function passwordStrength(pw = "") {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(score, 4);
  const labels = ["Very weak", "Weak", "Fair", "Strong", "Excellent"];
  const colors = ["#c1554d", "#c1554d", "#c9a227", "#3fb68b", "#3fb68b"];
  return { score, label: labels[score], color: colors[score] };
}
