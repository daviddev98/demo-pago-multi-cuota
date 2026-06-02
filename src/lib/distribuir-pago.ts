import type { Cuota, DistribucionPago, LineaDistribucion } from "./types";

/** Saldo pendiente de una cuota (valor − abonos previos). */
export function saldoCuota(cuota: Cuota): number {
  if (cuota.estado === "Pagado") return 0;
  return Math.max(0, cuota.valorCuota - cuota.pagosRecibidos);
}

/**
 * Distribuye un monto entre cuotas pendientes en orden ascendente.
 * Si el pago supera el saldo de una cuota, el excedente pasa a la siguiente.
 * Alineado a la mejora UX solicitada (vs. un pago por cuota en WinForms).
 */
export function calcularDistribucion(
  cuotas: Cuota[],
  montoPago: number
): DistribucionPago {
  const pendientes = [...cuotas]
    .filter((c) => saldoCuota(c) > 0)
    .sort((a, b) => a.numeroCuota - b.numeroCuota);

  let restante = Math.max(0, montoPago);
  const lineas: LineaDistribucion[] = [];

  for (const cuota of pendientes) {
    if (restante <= 0) break;

    const saldo = saldoCuota(cuota);
    const aplicado = Math.min(restante, saldo);

    lineas.push({
      numeroCuota: cuota.numeroCuota,
      saldoAnterior: saldo,
      montoAplicado: aplicado,
      saldoRestante: saldo - aplicado,
      cuotaCompletada: aplicado >= saldo - 0.001,
    });

    restante -= aplicado;
  }

  const montoAplicado = montoPago - restante;

  return {
    lineas,
    montoIngresado: montoPago,
    montoAplicado,
    sobrante: restante,
  };
}

export function saldoPendienteCredito(cuotas: Cuota[]): number {
  return cuotas.reduce((sum, c) => sum + saldoCuota(c), 0);
}
