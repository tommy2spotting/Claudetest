export function prezzoEuro(centesimi: number): string {
  if (centesimi === 0) return "Gratis";
  return (centesimi / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}
