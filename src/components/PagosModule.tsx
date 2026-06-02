"use client";

import { useCallback, useEffect, useState } from "react";
import type { DistribucionPago, ReciboPago } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { ReciboPagoDialog } from "@/components/ReciboPagoDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, CreditCard, Wallet, CheckCircle2, RotateCcw } from "lucide-react";
import { useDemoSync } from "@/hooks/use-demo-sync";

interface CreditoRow {
  idCredito: number;
  clienteNombre: string;
  descripcionArticulo: string;
  valorCuota: number;
  metodoPago: string;
  vendedor: string;
  saldoPendiente: number;
}

interface CreditoDetalle {
  credito: {
    idCredito: number;
    descripcionArticulo: string;
    valorCuota: number;
    metodoPago: string;
    vendedor: string;
    cuotas: {
      numeroCuota: number;
      valorCuota: number;
      fechaVencimiento: string;
      estado: string;
      pagosRecibidos: number;
    }[];
  };
  cliente: {
    nombre: string;
    apellido: string;
    identidad: string;
    telefono: string;
  } | null;
  saldoPendiente: number;
}

export function PagosModule() {
  const [busqueda, setBusqueda] = useState("");
  const [creditos, setCreditos] = useState<CreditoRow[]>([]);
  const [todosCreditos, setTodosCreditos] = useState<CreditoRow[]>([]);
  const [seleccionado, setSeleccionado] = useState<CreditoDetalle | null>(null);
  const [monto, setMonto] = useState("");
  const [distribucion, setDistribucion] = useState<DistribucionPago | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recibo, setRecibo] = useState<ReciboPago | null>(null);
  const [reciboOpen, setReciboOpen] = useState(false);
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);
  const { afterMutation, resetDemo } = useDemoSync();

  const cargarPendientes = useCallback(async () => {
    const res = await fetch("/api/creditos");
    if (res.ok) {
      const data = await res.json();
      setTodosCreditos(data.creditos);
      setCreditos(data.creditos);
    }
  }, []);

  useEffect(() => {
    cargarPendientes();
  }, [cargarPendientes]);

  async function buscarCliente() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/clientes?q=${encodeURIComponent(busqueda)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al buscar");
        setCreditos([]);
        return;
      }
      setCreditos(data.creditos);
      setSeleccionado(null);
      setDistribucion(null);
      setMonto("");
      setPaso(data.creditos.length > 0 ? 2 : 1);
      if (data.creditos.length === 0) {
        setError("No hay créditos pendientes para ese cliente");
      }
    } finally {
      setLoading(false);
    }
  }

  async function seleccionarCredito(idCredito: number) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/creditos/${idCredito}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al cargar crédito");
        return;
      }
      setSeleccionado(data);
      setDistribucion(null);
      setMonto("");
      setPaso(3);
    } finally {
      setLoading(false);
    }
  }

  async function calcularPreview(valor: string) {
    setMonto(valor);
    if (!seleccionado) return;
    const num = parseFloat(valor);
    if (!num || num <= 0) {
      setDistribucion(null);
      return;
    }
    const res = await fetch(
      `/api/pagos/preview?idCredito=${seleccionado.credito.idCredito}&monto=${num}`
    );
    const data = await res.json();
    if (res.ok) {
      setDistribucion(data.distribucion);
      setPaso(4);
    }
  }

  async function confirmarPago() {
    if (!seleccionado || !distribucion?.lineas.length) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idCredito: seleccionado.credito.idCredito,
          monto: parseFloat(monto),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar el pago");
        return;
      }
      setRecibo(data.recibo);
      try {
        sessionStorage.setItem(
          `recibo_${data.recibo.idPago}`,
          JSON.stringify(data.recibo)
        );
      } catch {
        /* ignore */
      }
      setReciboOpen(true);
      setSeleccionado(null);
      setDistribucion(null);
      setMonto("");
      setBusqueda("");
      setPaso(1);
      await afterMutation();
      await cargarPendientes();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Pagos de cuotas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingrese un monto y el sistema distribuirá el pago entre las cuotas
            pendientes en orden (mejora UX vs. pago cuota por cuota).
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Demo en memoria — datos de prueba persisten por sesión y en su
            navegador (ideal para Vercel sin base de datos).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={async () => {
            await resetDemo();
            await cargarPendientes();
            setSeleccionado(null);
            setDistribucion(null);
            setMonto("");
            setCreditos([]);
            setPaso(1);
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar datos demo
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { n: 1, label: "Buscar cliente" },
          { n: 2, label: "Seleccionar crédito" },
          { n: 3, label: "Monto a pagar" },
          { n: 4, label: "Confirmar" },
        ].map((s) => (
          <Badge
            key={s.n}
            variant={paso >= s.n ? "default" : "outline"}
            className="px-3 py-1"
          >
            {s.n}. {s.label}
          </Badge>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-primary" />
            Buscar cliente
          </CardTitle>
          <CardDescription>
            Escriba el nombre del cliente (sin apellido, como en el sistema
            actual).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 space-y-2">
            <Label htmlFor="busqueda">Nombre del cliente</Label>
            <Input
              id="busqueda"
              placeholder="Ej: María"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscarCliente()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={buscarCliente} disabled={loading || !busqueda.trim()}>
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {(creditos.length > 0 || todosCreditos.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-primary" />
              Créditos pendientes
            </CardTitle>
            <CardDescription>
              Seleccione el crédito al que aplicará el pago.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead># Crédito</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cuota</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(creditos.length ? creditos : todosCreditos).map((cr) => (
                  <TableRow
                    key={cr.idCredito}
                    data-state={
                      seleccionado?.credito.idCredito === cr.idCredito
                        ? "selected"
                        : undefined
                    }
                  >
                    <TableCell className="font-medium">{cr.idCredito}</TableCell>
                    <TableCell>{cr.clienteNombre}</TableCell>
                    <TableCell>{cr.descripcionArticulo}</TableCell>
                    <TableCell className="text-right">
                      {formatMoney(cr.valorCuota)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatMoney(cr.saldoPendiente)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={
                          seleccionado?.credito.idCredito === cr.idCredito
                            ? "default"
                            : "outline"
                        }
                        onClick={() => seleccionarCredito(cr.idCredito)}
                      >
                        Seleccionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {seleccionado && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-4 w-4 text-primary" />
                Monto a pagar
              </CardTitle>
              <CardDescription>
                Crédito #{seleccionado.credito.idCredito} —{" "}
                {seleccionado.cliente?.nombre} {seleccionado.cliente?.apellido}.
                Saldo pendiente:{" "}
                <span className="font-medium text-foreground">
                  {formatMoney(seleccionado.saldoPendiente)}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-xs space-y-2">
                <Label htmlFor="monto">Monto recibido (L)</Label>
                <Input
                  id="monto"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => calcularPreview(e.target.value)}
                />
              </div>

              {distribucion && distribucion.lineas.length > 0 && (
                <div className="rounded-lg border border-border bg-[#16181c] p-4">
                  <h4 className="mb-3 text-sm font-semibold">
                    Distribución automática entre cuotas
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cuota</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead className="text-right">Aplicar</TableHead>
                        <TableHead>Resultado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distribucion.lineas.map((l) => (
                        <TableRow key={l.numeroCuota}>
                          <TableCell>#{l.numeroCuota}</TableCell>
                          <TableCell className="text-right">
                            {formatMoney(l.saldoAnterior)}
                          </TableCell>
                          <TableCell className="text-right text-primary">
                            {formatMoney(l.montoAplicado)}
                          </TableCell>
                          <TableCell>
                            {l.cuotaCompletada ? (
                              <Badge variant="success">Cuota pagada</Badge>
                            ) : (
                              <Badge variant="warning">Abono parcial</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {distribucion.sobrante > 0.001 && (
                    <p className="mt-2 text-sm text-amber-300">
                      Sobrante no aplicado: {formatMoney(distribucion.sobrante)}{" "}
                      (excede el saldo de cuotas pendientes)
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {distribucion && distribucion.montoAplicado > 0 && (
            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={confirmarPago}
                disabled={loading}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirmar pago y generar recibo
              </Button>
            </div>
          )}
        </>
      )}

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <ReciboPagoDialog
        recibo={recibo}
        open={reciboOpen}
        onOpenChange={setReciboOpen}
      />
    </div>
  );
}
