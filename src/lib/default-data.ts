import type { AppData } from "./types";
import { CREDITOS_INICIALES } from "./seed";

export function createDefaultAppData(): AppData {
  return {
    creditos: structuredClone(CREDITOS_INICIALES),
    recibos: [],
    siguienteIdPago: 1001,
  };
}
