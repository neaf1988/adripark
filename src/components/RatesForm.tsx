import { useEffect, useState } from 'react';
import { getAllRates, updateRate } from '@/db/repositories';
import { rateKeyToLabel, type Rate } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Layout } from './Layout';
import { Button } from './ui/Button';

interface RatesFormProps {
  onBack: () => void;
}

export function RatesForm({ onBack }: RatesFormProps) {
  const [rates, setRates] = useState<Rate[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    getAllRates().then((data) => {
      setRates(data);
      setDrafts(Object.fromEntries(data.map((r) => [r.id, String(r.costPerMinute)])));
    });
  }, []);

  function handleChange(id: string, value: string) {
    setDrafts((prev) => ({ ...prev, [id]: value }));
    setSuccess(null);
  }

  async function handleSave(rate: Rate) {
    const raw = drafts[rate.id]?.trim();
    const cost = Number(raw);

    if (!raw || Number.isNaN(cost) || cost <= 0) {
      setError('Ingresa un valor válido mayor a 0');
      return;
    }

    setSaving(rate.id);
    setError(null);
    setSuccess(null);
    try {
      await updateRate(rate.id, cost);
      setRates((prev) =>
        prev.map((r) => (r.id === rate.id ? { ...r, costPerMinute: cost } : r)),
      );
      setSuccess(`Tarifa de ${rate.vehicleType} actualizada`);
    } catch {
      setError('No se pudo guardar la tarifa');
    } finally {
      setSaving(null);
    }
  }

  return (
    <Layout title="Tarifas" subtitle="Configurar costo por minuto" onBack={onBack}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Define el valor por minuto para cada tipo de vehículo.
        </p>

        {rates.map((rate) => (
          <div key={rate.id} className="rounded-xl bg-white p-4 shadow-sm">
            <label htmlFor={`rate-${rate.id}`} className="mb-2 block text-base font-semibold">
              {rateKeyToLabel(rate.vehicleType)}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">$</span>
                <input
                  id={`rate-${rate.id}`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={drafts[rate.id] ?? ''}
                  onChange={(e) => handleChange(rate.id, e.target.value)}
                  className="h-12 w-full rounded-xl border-2 border-gray-200 pl-8 pr-4 text-lg focus:border-primary focus:outline-none"
                />
              </div>
              <Button
                onClick={() => handleSave(rate)}
                disabled={saving === rate.id}
                className="!w-28 shrink-0"
              >
                {saving === rate.id ? '...' : 'Guardar'}
              </Button>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Actual: {formatCurrency(rate.costPerMinute)}/min
            </p>
          </div>
        ))}

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-base text-danger">{error}</p>
        )}
        {success && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-base text-success">{success}</p>
        )}
      </div>
    </Layout>
  );
}
