import { useEffect, useState } from 'react';
import { getTodayCompletedTickets, getTodayStats } from '@/db/repositories';
import type { Ticket } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { Layout } from './Layout';

interface HistoryScreenProps {
  onBack: () => void;
}

export function HistoryScreen({ onBack }: HistoryScreenProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState({ count: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTodayCompletedTickets(), getTodayStats()])
      .then(([data, todayStats]) => {
        setTickets(data);
        setStats(todayStats);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Historial" subtitle="Cobros de hoy" onBack={onBack}>
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Salidas hoy</p>
          <p className="text-3xl font-bold text-primary">{stats.count}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Recaudado hoy</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(stats.revenue)}</p>
        </div>
      </section>

      {loading && <p className="text-sm text-gray-500">Cargando...</p>}

      {!loading && tickets.length === 0 && (
        <p className="rounded-xl bg-gray-100 px-4 py-8 text-center text-gray-500">
          No hay cobros registrados hoy
        </p>
      )}

      {!loading && tickets.length > 0 && (
        <ul className="space-y-2">
          {tickets.map((ticket) => (
            <li
              key={ticket.id}
              className="flex h-14 items-center justify-between rounded-xl bg-white px-4 shadow-sm"
            >
              <div>
                <p className="text-lg font-bold">{ticket.plate}</p>
                <p className="text-sm text-gray-500">
                  {ticket.vehicleType} · {ticket.totalMinutes} min
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-success">
                  {formatCurrency(ticket.totalAmount ?? 0)}
                </p>
                <p className="text-xs text-gray-400">
                  {ticket.checkOutTime ? formatDateTime(ticket.checkOutTime) : '—'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
