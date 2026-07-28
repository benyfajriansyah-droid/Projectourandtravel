import { describe, it, expect } from "vitest";
import { amountToWords } from "./terbilang";

describe("amountToWords", () => {
  it("handles zero", () => {
    expect(amountToWords(0)).toBe("Nol rupiah");
  });

  it("handles single digits and teens", () => {
    expect(amountToWords(1)).toBe("Satu rupiah");
    expect(amountToWords(11)).toBe("Sebelas rupiah");
    expect(amountToWords(17)).toBe("Tujuh belas rupiah");
  });

  it("handles tens and hundreds", () => {
    expect(amountToWords(21)).toBe("Dua puluh satu rupiah");
    expect(amountToWords(100)).toBe("Seratus rupiah");
    expect(amountToWords(250)).toBe("Dua ratus lima puluh rupiah");
  });

  it("handles thousands using 'seribu' for exactly 1000", () => {
    expect(amountToWords(1000)).toBe("Seribu rupiah");
    expect(amountToWords(1500)).toBe("Seribu lima ratus rupiah");
  });

  it("handles a realistic payment amount", () => {
    expect(amountToWords(2_750_000)).toBe(
      "Dua juta tujuh ratus lima puluh ribu rupiah"
    );
  });

  it("rounds fractional amounts", () => {
    expect(amountToWords(1000.6)).toBe("Seribu satu rupiah");
  });
});
