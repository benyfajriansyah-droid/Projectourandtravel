const ONES = [
  "",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
  "sepuluh",
  "sebelas",
];

function spell(n: number): string {
  if (n < 12) return ONES[n];
  if (n < 20) return `${spell(n - 10)} belas`;
  if (n < 100) {
    const rest = n % 10;
    return `${spell(Math.floor(n / 10))} puluh${rest ? ` ${spell(rest)}` : ""}`;
  }
  if (n < 200) {
    const rest = n % 100;
    return `seratus${rest ? ` ${spell(rest)}` : ""}`;
  }
  if (n < 1000) {
    const rest = n % 100;
    return `${spell(Math.floor(n / 100))} ratus${rest ? ` ${spell(rest)}` : ""}`;
  }
  if (n < 2000) {
    const rest = n % 1000;
    return `seribu${rest ? ` ${spell(rest)}` : ""}`;
  }
  if (n < 1_000_000) {
    const rest = n % 1000;
    return `${spell(Math.floor(n / 1000))} ribu${rest ? ` ${spell(rest)}` : ""}`;
  }
  if (n < 1_000_000_000) {
    const rest = n % 1_000_000;
    return `${spell(Math.floor(n / 1_000_000))} juta${rest ? ` ${spell(rest)}` : ""}`;
  }
  if (n < 1_000_000_000_000) {
    const rest = n % 1_000_000_000;
    return `${spell(Math.floor(n / 1_000_000_000))} miliar${rest ? ` ${spell(rest)}` : ""}`;
  }
  const rest = n % 1_000_000_000_000;
  return `${spell(Math.floor(n / 1_000_000_000_000))} triliun${rest ? ` ${spell(rest)}` : ""}`;
}

export function amountToWords(amount: number): string {
  const rounded = Math.max(0, Math.round(amount));
  const words = spell(rounded).trim().replace(/\s+/g, " ");
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
  return `${rounded === 0 ? "Nol" : capitalized} rupiah`;
}
