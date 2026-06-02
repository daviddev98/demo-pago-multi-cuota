import { getMemoryStore, setMemoryStore } from "./memory-store";
import { getSessionStoreId } from "./auth";
import type { AppData, ReciboPago } from "./types";
import {
  calcularDistribucion,
  saldoCuota,
  saldoPendienteCredito,
} from "./distribuir-pago";
import { CLIENTES_DEMO } from "./seed";
import { createDefaultAppData } from "./default-data";

async function sessionId(): Promise<string> {
  const sid = await getSessionStoreId();
  if (!sid) throw new Error("Sin sesión");
  return sid;
}

async function load(): Promise<AppData> {
  const sid = await sessionId();
  return getMemoryStore(sid);
}

async function save(data: AppData): Promise<void> {
  const sid = await sessionId();
  setMemoryStore(sid, data);
}

export async function getAppData(): Promise<AppData> {
  return load();
}

/** Restaura estado demo desde el cliente (resiste cold starts en Vercel). */
export async function restoreAppData(data: AppData): Promise<AppData> {
  await save(data);
  return data;
}

export async function resetAppData(): Promise<AppData> {
  const data = createDefaultAppData();
  await save(data);
  return data;
}

export async function obtenerRecibo(idPago: number): Promise<ReciboPago | null> {
  const data = await load();
  return data.recibos.find((r) => r.idPago === idPago) ?? null;
}

export async function buscarClientesConCreditos(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const data = await load();
  const clientesMap = new Map(
    CLIENTES_DEMO.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.apellido.toLowerCase().includes(q) ||
        `${c.nombre} ${c.apellido}`.toLowerCase().includes(q)
    ).map((c) => [c.idCliente, c])
  );

  const creditos = data.creditos.filter(
    (cr) =>
      clientesMap.has(cr.idCliente) &&
      cr.estado === "Pendiente" &&
      saldoPendienteCredito(cr.cuotas) > 0
  );

  return creditos.map((cr) => {
    const cliente = clientesMap.get(cr.idCliente)!;
    return {
      ...cr,
      clienteNombre: `${cliente.nombre} ${cliente.apellido}`,
    };
  });
}

export async function obtenerCredito(idCredito: number) {
  const data = await load();
  const credito = data.creditos.find((c) => c.idCredito === idCredito);
  if (!credito) return null;
  const cliente = CLIENTES_DEMO.find((c) => c.idCliente === credito.idCliente);
  return {
    credito,
    cliente,
    saldoPendiente: saldoPendienteCredito(credito.cuotas),
  };
}

export async function previewDistribucion(idCredito: number, monto: number) {
  const info = await obtenerCredito(idCredito);
  if (!info) return null;
  return {
    ...info,
    distribucion: calcularDistribucion(info.credito.cuotas, monto),
  };
}

export async function registrarPago(
  idCredito: number,
  monto: number,
  registradoPor: string
): Promise<{ ok: true; recibo: ReciboPago } | { ok: false; error: string }> {
  const data = await load();
  const idx = data.creditos.findIndex((c) => c.idCredito === idCredito);
  if (idx < 0) return { ok: false, error: "Crédito no encontrado" };

  const credito = data.creditos[idx];
  const cliente = CLIENTES_DEMO.find((c) => c.idCliente === credito.idCliente);
  if (!cliente) return { ok: false, error: "Cliente no encontrado" };

  if (monto <= 0) return { ok: false, error: "El monto debe ser mayor a cero" };

  const saldoAnterior = saldoPendienteCredito(credito.cuotas);
  const distribucion = calcularDistribucion(credito.cuotas, monto);

  if (distribucion.lineas.length === 0) {
    return { ok: false, error: "No hay cuotas pendientes para aplicar el pago" };
  }

  if (distribucion.montoAplicado <= 0) {
    return { ok: false, error: "El monto no cubre ninguna cuota pendiente" };
  }

  for (const linea of distribucion.lineas) {
    const cuota = credito.cuotas.find(
      (c) => c.numeroCuota === linea.numeroCuota
    );
    if (!cuota) continue;
    cuota.pagosRecibidos += linea.montoAplicado;
    if (linea.cuotaCompletada) {
      cuota.estado = "Pagado";
      cuota.pagosRecibidos = cuota.valorCuota;
    }
  }

  const saldoDespues = saldoPendienteCredito(credito.cuotas);
  if (saldoDespues <= 0.001) {
    credito.estado = "Pagado";
  }

  const idPago = data.siguienteIdPago++;
  const recibo: ReciboPago = {
    idPago,
    fechaPago: new Date().toISOString(),
    idCredito: credito.idCredito,
    clienteNombre: cliente.nombre,
    clienteApellido: cliente.apellido,
    descripcionArticulo: credito.descripcionArticulo,
    vendedor: credito.vendedor,
    metodoPago: credito.metodoPago,
    saldoAnterior,
    montoRecibido: distribucion.montoAplicado,
    saldoPendienteDespues: saldoDespues,
    lineas: distribucion.lineas,
    registradoPor,
  };

  data.recibos.unshift(recibo);
  data.creditos[idx] = credito;
  await save(data);

  return { ok: true, recibo };
}

export async function listarCreditosPendientes() {
  const data = await load();
  return data.creditos
    .filter(
      (cr) =>
        cr.estado === "Pendiente" && saldoPendienteCredito(cr.cuotas) > 0
    )
    .map((cr) => {
      const cliente = CLIENTES_DEMO.find((c) => c.idCliente === cr.idCliente);
      return {
        ...cr,
        clienteNombre: cliente
          ? `${cliente.nombre} ${cliente.apellido}`
          : "—",
        saldoPendiente: saldoPendienteCredito(cr.cuotas),
      };
    });
}

export { saldoCuota };
