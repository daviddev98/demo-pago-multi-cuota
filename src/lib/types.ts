export type RolUsuario = "administrador" | "cobranza";

export interface Usuario {
  id: string;
  usuario: string;
  nombre: string;
  rol: RolUsuario;
}

export interface Cuota {
  numeroCuota: number;
  valorCuota: number;
  fechaVencimiento: string;
  estado: "Pendiente" | "Pagado";
  pagosRecibidos: number;
}

export interface Credito {
  idCredito: number;
  idCliente: number;
  descripcionArticulo: string;
  valorCuota: number;
  cantidadCuotas: number;
  metodoPago: string;
  vendedor: string;
  estado: "Pendiente" | "Pagado";
  cuotas: Cuota[];
}

export interface Cliente {
  idCliente: number;
  nombre: string;
  apellido: string;
  identidad: string;
  telefono: string;
}

export interface LineaDistribucion {
  numeroCuota: number;
  saldoAnterior: number;
  montoAplicado: number;
  saldoRestante: number;
  cuotaCompletada: boolean;
}

export interface DistribucionPago {
  lineas: LineaDistribucion[];
  montoIngresado: number;
  montoAplicado: number;
  sobrante: number;
}

export interface ReciboPago {
  idPago: number;
  fechaPago: string;
  idCredito: number;
  clienteNombre: string;
  clienteApellido: string;
  descripcionArticulo: string;
  vendedor: string;
  metodoPago: string;
  saldoAnterior: number;
  montoRecibido: number;
  saldoPendienteDespues: number;
  lineas: LineaDistribucion[];
  registradoPor: string;
}

export interface AppData {
  creditos: Credito[];
  recibos: ReciboPago[];
  siguienteIdPago: number;
}

export interface SessionPayload {
  user: Usuario;
  exp: number;
  sid: string;
}
