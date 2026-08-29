import { useEffect, useState } from 'react';
import { deleteParkedTicket, getParkedTickets } from '@/db/repositories';
import { isMotoVehicle, type Ticket } from '@/types';
import { formatDateTime } from '@/utils/format';
import { EditTicketForm } from './EditTicketForm';
import { Layout } from './Layout';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface ParkedListProps {
  onBack: () => void;
}

export function ParkedList({ onBack }: ParkedListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTickets() {
    setLoading(true);
    try {
      const data = await getParkedTickets();
      setTickets(data.sort((a, b) => a.checkInTime.localeCompare(b.checkInTime)));
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function handleCancelConfirmed() {
    if (!selected?.id) return;

    setCancelling(true);
    setError(null);
    try {
      await deleteParkedTicket(selected.id);
      setShowCancelConfirm(false);
      setSelected(null);
      await loadTickets();
    } catch {
      setError('No se pudo eliminar el ingreso');
    } finally {
      setCancelling(false);
    }
  }

  function handleEditSuccess() {
    setEditing(null);
    setSelected(null);
    loadTickets();
  }

  if (editing) {
    return (
      <EditTicketForm
        ticket={editing}
        onBack={() => setEditing(null)}
        onSuccess={handleEditSuccess}
      />
    );
  }

  return (
    <>
      <Layout
        title="Estacionados"
        subtitle={`${tickets.length} vehículo(s) activo(s)`}
        onBack={onBack}
        footer={
          selected ? (
            <div className="space-y-3">
              <Button fullWidth onClick={() => setEditing(selected)}>
                Editar ingreso
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" onClick={() => setSelected(null)}>
                  Volver
                </Button>
                <Button variant="danger" onClick={() => setShowCancelConfirm(true)}>
                  Eliminar ingreso
                </Button>
              </div>
            </div>
          ) : undefined
        }
      >
        {loading && <p className="text-sm text-gray-500">Cargando...</p>}

        {!loading && tickets.length === 0 && (
          <p className="rounded-xl bg-gray-100 px-4 py-8 text-center text-gray-500">
            No hay vehículos estacionados
          </p>
        )}

        {!selected && tickets.length > 0 && (
          <ul className="space-y-2">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <button
                  type="button"
                  onClick={() => setSelected(ticket)}
                  className="flex h-14 w-full items-center justify-between rounded-xl bg-white px-4 shadow-sm active:bg-gray-50"
                >
                  <div className="text-left">
                    <p className="text-lg font-bold">{ticket.plate}</p>
                    <p className="text-sm text-gray-500">{ticket.vehicleType}</p>
                  </div>
                  <p className="text-sm text-gray-400">{formatDateTime(ticket.checkInTime)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {selected && (
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
                <div className="flex justify-between">
                  <dt className="text-gray-500">Desbloqueada</dt>
                  <dd>{selected.stayUnlocked !== false ? 'Sí' : 'No'}</dd>
                </div>
              )}
              {selected.vehicleType === 'Carro' && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Dejaron llaves</dt>
                  <dd>{selected.keysLeft ? 'Sí' : 'No'}</dd>
                </div>
              )}
              {selected.notes && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Notas</dt>
                  <dd className="max-w-[60%] text-right">{selected.notes}</dd>
                </div>
              )}
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
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Otros accesorios</dt>
                      <dd className="max-w-[60%] text-right">{selected.otherAccessories}</dd>
                    </div>
                  )}
                </>
              )}
              {selected.photos && selected.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {selected.photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Foto ${i + 1}`}
                      className="aspect-square rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </dl>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-base text-danger">{error}</p>
            )}
          </section>
        )}
      </Layout>

      <ConfirmDialog
        open={showCancelConfirm}
        title="¿Eliminar ingreso?"
        message={
          <>
            El ingreso de la placa <strong>{selected?.plate}</strong> será{' '}
            <strong>eliminado definitivamente</strong> y no podrá recuperarse.
          </>
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="No, volver"
        loading={cancelling}
        onConfirm={handleCancelConfirmed}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </>
  );
}
