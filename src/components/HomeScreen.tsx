import { useEffect, useState } from 'react';
import { getAllRates, getParkedTickets, getTodayStats } from '@/db/repositories';
import { rateKeyToLabel, type Rate } from '@/types';
import { formatCurrency } from '@/utils/format';
import { BottomActions } from './ui/BottomActions';
import { Button } from './ui/Button';

interface HomeScreenProps {
  onCheckIn: () => void;
  onCheckOut: () => void;
  onParked: () => void;
  onRates: () => void;
  onHistory: () => void;
}

export function HomeScreen({
  onCheckIn,
  onCheckOut,
  onParked,
  onRates,
  onHistory,
}: HomeScreenProps) {
  const [rates, setRates] = useState<Rate[]>([]);
  const [parkedCount, setParkedCount] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    Promise.all([getAllRates(), getParkedTickets(), getTodayStats()])
      .then(([ratesData, parked, stats]) => {
        setRates(ratesData);
        setParkedCount(parked.length);
        setTodayRevenue(stats.revenue);
        setTodayCount(stats.count);
        setDbReady(true);
      })
      .catch(() => setDbReady(false));
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50">
      <header className="shrink-0 bg-primary px-4 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-white shadow-md">
        <h1 className="text-2xl font-bold">AdriPark</h1>
        <p className="text-sm text-blue-100">Control de Parqueadero</p>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain p-4">
        <div className="flex flex-col gap-5">
          <section className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onParked}
              className="rounded-xl bg-white p-4 text-left shadow-sm active:bg-gray-50"
            >
              <p className="text-sm text-gray-500">Estacionados</p>
              <p className="text-3xl font-bold text-primary">{parkedCount}</p>
            </button>
            <button
              type="button"
              onClick={onHistory}
              className="rounded-xl bg-white p-4 text-left shadow-sm active:bg-gray-50"
            >
              <p className="text-sm text-gray-500">Recaudado hoy</p>
              <p className="text-xl font-bold text-success">{formatCurrency(todayRevenue)}</p>
              <p className="text-xs text-gray-400">{todayCount} salida(s)</p>
            </button>
          </section>

          <section className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tarifas por minuto</h2>
              <button
                type="button"
                onClick={onRates}
                className="h-10 rounded-lg px-3 text-sm font-semibold text-primary active:bg-blue-50"
              >
                Editar
              </button>
            </div>
            <ul className="space-y-2">
              {rates.map((rate) => (
                <li
                  key={rate.id}
                  className="flex h-12 items-center justify-between rounded-lg bg-gray-50 px-4 text-base"
                >
                  <span>{rateKeyToLabel(rate.vehicleType)}</span>
                  <span className="font-semibold">{formatCurrency(rate.costPerMinute)}</span>
                </li>
              ))}
            </ul>
          </section>

          <p className="pb-2 text-center text-xs text-gray-400">
            Base de datos: {dbReady ? 'Conectada (offline)' : 'Error'}
          </p>
        </div>
      </main>

      <BottomActions>
        <nav className="grid grid-cols-2 gap-3">
          <Button onClick={onCheckIn}>Ingreso</Button>
          <Button variant="success" onClick={onCheckOut}>
            Salida
          </Button>
        </nav>
      </BottomActions>
    </div>
  );
}
