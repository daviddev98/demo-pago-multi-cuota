import type { ReciboPago } from "@/lib/types";
import { formatMoney, cn } from "@/lib/utils";

interface ReciboPagoViewProps {
  recibo: ReciboPago;
  className?: string;
}

/** Recibo con estilos (modal y vista en pantalla). */
export function ReciboPagoView({ recibo, className }: ReciboPagoViewProps) {
  const fecha = new Date(recibo.fechaPago).toLocaleString("es-HN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <article
      className={cn(
        "space-y-5 text-[#e8e8e8]",
        className
      )}
    >
      <header className="border-b border-white/10 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#f97316]">
          Inversiones Express
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">
          Recibo de pago #{recibo.idPago}
        </h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          Comprobante de aplicación de pago a cuotas — {fecha}
        </p>
      </header>

      <section className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-[#9ca3af]">Cliente</p>
          <p className="font-semibold text-white">
            {recibo.clienteNombre} {recibo.clienteApellido}
          </p>
        </div>
        <div>
          <p className="text-[#9ca3af]">Crédito</p>
          <p className="font-semibold text-white">#{recibo.idCredito}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-[#9ca3af]">Artículo</p>
          <p className="font-semibold text-white">{recibo.descripcionArticulo}</p>
        </div>
        <div>
          <p className="text-[#9ca3af]">Vendedor</p>
          <p className="text-white">{recibo.vendedor}</p>
        </div>
        <div>
          <p className="text-[#9ca3af]">Plan de pago</p>
          <p className="text-white">{recibo.metodoPago}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-white">
          Cuotas afectadas
        </h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[#9ca3af]">
              <th className="py-2 text-left font-medium">Cuota</th>
              <th className="py-2 text-right font-medium">Saldo antes</th>
              <th className="py-2 text-right font-medium">Aplicado</th>
              <th className="py-2 text-right font-medium">Saldo después</th>
              <th className="py-2 text-left font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {recibo.lineas.map((l) => (
              <tr key={l.numeroCuota} className="border-b border-white/10">
                <td className="py-2.5 font-medium text-white">
                  #{l.numeroCuota}
                </td>
                <td className="py-2.5 text-right text-white">
                  {formatMoney(l.saldoAnterior)}
                </td>
                <td className="py-2.5 text-right font-medium text-[#f97316]">
                  {formatMoney(l.montoAplicado)}
                </td>
                <td className="py-2.5 text-right text-white">
                  {formatMoney(l.saldoRestante)}
                </td>
                <td className="py-2.5">
                  {l.cuotaCompletada ? (
                    <span className="inline-block rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                      Pagada
                    </span>
                  ) : (
                    <span className="inline-block rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300">
                      Abono parcial
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 rounded-lg bg-[#16181c] p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-[#9ca3af]">Saldo anterior</p>
          <p className="text-lg font-bold text-white">
            {formatMoney(recibo.saldoAnterior)}
          </p>
        </div>
        <div>
          <p className="text-[#9ca3af]">Monto recibido</p>
          <p className="text-lg font-bold text-[#f97316]">
            {formatMoney(recibo.montoRecibido)}
          </p>
        </div>
        <div>
          <p className="text-[#9ca3af]">Saldo pendiente</p>
          <p className="text-lg font-bold text-white">
            {formatMoney(recibo.saldoPendienteDespues)}
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 pt-3 text-xs text-[#9ca3af]">
        Registrado por: {recibo.registradoPor}
      </footer>
    </article>
  );
}
