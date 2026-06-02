import type { Cliente, Credito, Cuota } from "./types";

export const USUARIOS_DEMO = [
  {
    id: "1",
    usuario: "admin",
    clave: "admin123",
    nombre: "Administrador Sistema",
    rol: "administrador" as const,
  },
  {
    id: "2",
    usuario: "cobranza",
    clave: "cobranza123",
    nombre: "Equipo Cobranza",
    rol: "cobranza" as const,
  },
];

function generarCuotas(
  cantidad: number,
  valorCuota: number,
  inicio: string,
  pagosParciales: Record<number, number> = {}
): Cuota[] {
  const cuotas: Cuota[] = [];
  const fechaBase = new Date(inicio);
  for (let i = 1; i <= cantidad; i++) {
    const f = new Date(fechaBase);
    f.setMonth(f.getMonth() + (i - 1));
    const parcial = pagosParciales[i] ?? 0;
    const pagado = parcial >= valorCuota;
    cuotas.push({
      numeroCuota: i,
      valorCuota,
      fechaVencimiento: f.toISOString().slice(0, 10),
      estado: pagado ? "Pagado" : "Pendiente",
      pagosRecibidos: pagado ? valorCuota : parcial,
    });
  }
  return cuotas;
}

/** Clientes demo — dominio alineado a comercialCreditos */
export const CLIENTES_DEMO: Cliente[] = [
  {
    idCliente: 1042,
    nombre: "María",
    apellido: "Rodríguez López",
    identidad: "0801-1990-12345",
    telefono: "+504 9876-5432",
  },
  {
    idCliente: 1156,
    nombre: "José",
    apellido: "Martínez Hernández",
    identidad: "0501-1985-67890",
    telefono: "+504 3344-2211",
  },
  {
    idCliente: 1289,
    nombre: "Ana",
    apellido: "García Mejía",
    identidad: "0801-1995-11223",
    telefono: "+504 9988-7766",
  },
  {
    idCliente: 1334,
    nombre: "Carlos",
    apellido: "Pineda Reyes",
    identidad: "0501-1992-44556",
    telefono: "+504 9654-3210",
  },
];

export const CREDITOS_INICIALES: Credito[] = [
  {
    idCredito: 3087,
    idCliente: 1042,
    descripcionArticulo: "Samsung Galaxy A15 128GB",
    valorCuota: 850,
    cantidadCuotas: 12,
    metodoPago: "Semanal",
    vendedor: "Pedro Ramírez",
    estado: "Pendiente",
    cuotas: generarCuotas(12, 850, "2025-01-15", { 1: 850, 2: 400 }),
  },
  {
    idCredito: 2914,
    idCliente: 1156,
    descripcionArticulo: "iPhone 13 128GB",
    valorCuota: 1200,
    cantidadCuotas: 10,
    metodoPago: "Quincenal",
    vendedor: "Laura Méndez",
    estado: "Pendiente",
    cuotas: generarCuotas(10, 1200, "2024-11-01"),
  },
  {
    idCredito: 3201,
    idCliente: 1289,
    descripcionArticulo: "Xiaomi Redmi Note 13",
    valorCuota: 630,
    cantidadCuotas: 8,
    metodoPago: "Semanal",
    vendedor: "Pedro Ramírez",
    estado: "Pendiente",
    cuotas: generarCuotas(8, 630, "2025-02-01", { 1: 630 }),
  },
  {
    idCredito: 2756,
    idCliente: 1334,
    descripcionArticulo: "Motorola Edge 40",
    valorCuota: 980,
    cantidadCuotas: 12,
    metodoPago: "Mensual",
    vendedor: "Laura Méndez",
    estado: "Pendiente",
    cuotas: generarCuotas(12, 980, "2024-08-15"),
  },
];
