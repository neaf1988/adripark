import { useCallback, useEffect, useState } from 'react';
import {
  calculateParkingFee,
  completeTicket,
  getRateByVehicleType,
  searchParkedByPlate,
} from '@/db/repositories';
import type { Ticket } from '@/types';
import { isMotoVehicle } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { Layout } from './Layout';
import { Button } from './ui/Button';

interface CheckOutFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CheckOutForm({ onBack, onSuccess }: CheckOutFormProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [fee, setFee] = useState<{ totalMinutes: number; totalAmount: number } | null>(null);
  const [amountDraft, setAmountDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const search = useCallback(async (plateQuery: string) => {
    setLoading(true);
    try {
      const tickets = await searchParkedByPlate(plateQuery);
      setResults(tickets);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(query);
  }, [query, search]);

  async function selectTicket(ticket: Ticket) {
    setSelected(ticket);
    setError(null);
    setSuccessMsg(null);

    const rate = await getRateByVehicleType(ticket.vehicleType);
    if (!rate) {
      setFee(null);
      setAmountDraft('');
      setError('No se encontró tarifa para este tipo de vehículo');
      return;
    }

    const calculated = calculateParkingFee(
      ticket.checkInTime,
      new Date().toISOString(),
      rate.costPerMinute,
    );
    setFee(calculated);
    setAmountDraft(String(calculated.totalAmount));
  }

  async function handleCheckout() {
    if (!selected?.id || !fee) return;

    const finalAmount = Number(amountDraft);
    if (Number.isNaN(finalAmount) || finalAmount < 0) {
      setError('Ingresa un monto válido');
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const checkOutTime = new Date().toISOString();
      await completeTicket(selected.id, checkOutTime, fee.totalMinutes, finalAmount);
      setSuccessMsg(
        `${selected.plate}: ${fee.totalMinutes} min — ${formatCurrency(finalAmount)}`,
      );
      setSelected(null);
      setFee(null);
      setAmountDraft('');
      setQuery('');
      await search('');
      setTimeout(onSuccess, 1500);
    } catch {
      setError('No se pudo completar la salida');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Layout
      title="Salida y cobro"
      subtitle="Buscar vehículo estacionado"
      onBack={onBack}
      footer={
        selected && fee ? (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setSelected(null);
                setFee(null);
                setAmountDraft('');
              }}
            >
              Cancelar
            </Button>
            <Button variant="success" disabled={processing} onClick={handleCheckout}>
              {processing ? 'Cobrando...' : 'Confirmar cobro'}
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="search-plate" className="mb-2 block text-base font-medium text-gray-700">
            Buscar por placa
          </label>
          <input
            id="search-plate"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="Escribe la placa..."
            className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-lg uppercase focus:border-primary focus:outline-none"
            autoComplete="off"
            autoFocus
          />
        </div>

        {loading && <p className="text-sm text-gray-500">Buscando...</p>}

        {!loading && results.length === 0 && (
          <p className="rounded-xl bg-gray-100 px-4 py-6 text-center text-gray-500">
            {query ? 'No hay vehículos con esa placa' : 'No hay vehículos estacionados'}
          </p>
        )}

        {!selected && results.length > 0 && (
          <ul className="space-y-2">
            {results.map((ticket) => (
              <li key={ticket.id}>
                <button
                  type="button"
                  onClick={() => selectTicket(ticket)}
                  className="flex h-12 w-full items-center justify-between rounded-xl bg-white px-4 shadow-sm active:bg-gray-50"
                >
                  <span className="text-lg font-bold">{ticket.plate}</span>
                  <span className="text-sm text-gray-500">
                    {ticket.vehicleType} · {formatDateTime(ticket.checkInTime)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {selected && fee && (
          <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{selected.plate}</h3>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-primary">
                {selected.vehicleType}
              </span>
            </div>

            <dl className="space-y-2 text-base">
              <div className="flex justify-between">
                <dt className="text-gray-500">Ingreso</dt>
                <dd>{formatDateTime(selected.checkInTime)}</dd>
              </div>
              {isMotoVehicle(selected.vehicleType) && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Cascos</dt>
                    <dd>{selected.helmetsCount ?? 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Intercom</dt>
                    <dd>{selected.intercomCount ?? 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Guantes</dt>
                    <dd>{selected.glovesCount ?? 0}</dd>
                  </div>
                  {selected.otherAccessories && (
                    <div className="flex justify-between gap-2">
                      <dt className="shrink-0 text-gray-500">Otros accesorios</dt>
                      <dd className="text-right">{selected.otherAccessories}</dd>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <dt>Tiempo</dt>
                <dd>{fee.totalMinutes} min</dd>
              </div>
            </dl>

            <div>
              <label htmlFor="total-amount" className="mb-2 block text-base font-medium text-gray-700">
                Total a cobrar
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">$</span>
                <input
                  id="total-amount"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={amountDraft}
                  onChange={(e) => setAmountDraft(e.target.value)}
                  className="h-14 w-full rounded-xl border-2 border-success py-2 pl-8 pr-4 text-2xl font-bold leading-normal text-success focus:border-primary focus:outline-none"
                />
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Sugerido: {formatCurrency(fee.totalAmount)} — ajusta por descuento o propina
              </p>
            </div>
          </section>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-base text-danger">{error}</p>
        )}

        {successMsg && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-base font-medium text-success">
            Cobro registrado: {successMsg}
          </p>
        )}
      </div>
    </Layout>
  );
}
