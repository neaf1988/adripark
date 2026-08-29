import { useEffect, useState } from 'react';
import { updateParkedTicket } from '@/db/repositories';
import type { Ticket, VehicleType } from '@/types';
import { VEHICLE_TYPES, isMotoVehicle } from '@/types';
import {
  fromDatetimeLocalValue,
  normalizePlate,
  toDatetimeLocalValue,
} from '@/utils/format';
import { buildVehicleFields } from '@/utils/vehicleFields';
import { Layout } from './Layout';
import { VehicleExtraFields } from './VehicleExtraFields';
import { Button } from './ui/Button';
import { OptionGroup } from './ui/OptionGroup';
import { PhotoCapture } from './ui/PhotoCapture';

interface EditTicketFormProps {
  ticket: Ticket;
  onBack: () => void;
  onSuccess: () => void;
}

export function EditTicketForm({ ticket, onBack, onSuccess }: EditTicketFormProps) {
  const [plate, setPlate] = useState(ticket.plate);
  const [vehicleType, setVehicleType] = useState<VehicleType>(ticket.vehicleType);
  const [checkInLocal, setCheckInLocal] = useState(toDatetimeLocalValue(ticket.checkInTime));
  const [helmetsCount, setHelmetsCount] = useState<0 | 1 | 2>((ticket.helmetsCount ?? 0) as 0 | 1 | 2);
  const [intercomCount, setIntercomCount] = useState<0 | 1 | 2>((ticket.intercomCount ?? 0) as 0 | 1 | 2);
  const [glovesCount, setGlovesCount] = useState<0 | 1 | 2>((ticket.glovesCount ?? 0) as 0 | 1 | 2);
  const [otherAccessories, setOtherAccessories] = useState(ticket.otherAccessories ?? '');
  const [stayUnlocked, setStayUnlocked] = useState(ticket.stayUnlocked ?? true);
  const [keysLeft, setKeysLeft] = useState(ticket.keysLeft ?? false);
  const [notes, setNotes] = useState(ticket.notes ?? '');
  const [photos, setPhotos] = useState<string[]>(ticket.photos ?? []);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setError(null);
  }, [plate, vehicleType, checkInLocal]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!ticket.id) return;

    setError(null);
    const normalizedPlate = normalizePlate(plate);
    if (!normalizedPlate) {
      setError('Ingresa la placa del vehículo');
      return;
    }

    const checkInTime = fromDatetimeLocalValue(checkInLocal);
    if (new Date(checkInTime) > new Date()) {
      setError('La hora de ingreso no puede ser futura');
      return;
    }

    setSubmitting(true);
    try {
      await updateParkedTicket(ticket.id, {
        plate: normalizedPlate,
        vehicleType,
        checkInTime,
        notes: notes.trim() || undefined,
        photos: photos.length > 0 ? photos : undefined,
        ...buildVehicleFields(vehicleType, stayUnlocked, keysLeft),
        ...(isMotoVehicle(vehicleType)
          ? {
              helmetsCount,
              intercomCount,
              glovesCount,
              otherAccessories: otherAccessories.trim() || undefined,
            }
          : {}),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar los cambios');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout
      title="Editar ingreso"
      subtitle={ticket.plate}
      onBack={onBack}
      footer={
        <Button type="submit" form="edit-ticket-form" fullWidth disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      }
    >
      <form id="edit-ticket-form" onSubmit={handleSubmit} className="flex flex-col gap-5 pb-2">
        <div>
          <label htmlFor="edit-plate" className="mb-2 block text-base font-medium text-gray-700">
            Placa *
          </label>
          <input
            id="edit-plate"
            type="text"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-lg uppercase focus:border-primary focus:outline-none"
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="edit-checkin" className="mb-2 block text-base font-medium text-gray-700">
            Hora de ingreso *
          </label>
          <input
            id="edit-checkin"
            type="datetime-local"
            value={checkInLocal}
            onChange={(e) => setCheckInLocal(e.target.value)}
            className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-base focus:border-primary focus:outline-none"
          />
        </div>

        <OptionGroup
          label="Tipo de vehículo *"
          value={vehicleType}
          options={VEHICLE_TYPES.map((type) => ({ label: type, value: type }))}
          onChange={setVehicleType}
        />

        <VehicleExtraFields
          vehicleType={vehicleType}
          stayUnlocked={stayUnlocked}
          keysLeft={keysLeft}
          onStayUnlockedChange={setStayUnlocked}
          onKeysLeftChange={setKeysLeft}
        />

        {isMotoVehicle(vehicleType) && (
          <section className="space-y-4 rounded-xl border-2 border-blue-100 bg-blue-50 p-4">
            <h3 className="font-semibold text-primary">Accesorios de moto</h3>

            <OptionGroup
              label="Cascos *"
              value={helmetsCount}
              options={[
                { label: '0', value: 0 },
                { label: '1', value: 1 },
                { label: '2', value: 2 },
              ]}
              onChange={setHelmetsCount}
            />

            <OptionGroup
              label="Intercomunicador *"
              value={intercomCount}
              options={[
                { label: '0', value: 0 },
                { label: '1', value: 1 },
                { label: '2', value: 2 },
              ]}
              onChange={setIntercomCount}
            />

            <OptionGroup
              label="Guantes *"
              value={glovesCount}
              options={[
                { label: '0', value: 0 },
                { label: '1', value: 1 },
                { label: '2', value: 2 },
              ]}
              onChange={setGlovesCount}
            />

            <div>
              <label htmlFor="edit-accessories" className="mb-2 block text-base font-medium text-gray-700">
                Otros accesorios
              </label>
              <input
                id="edit-accessories"
                type="text"
                value={otherAccessories}
                onChange={(e) => setOtherAccessories(e.target.value)}
                className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-base focus:border-primary focus:outline-none"
              />
            </div>
          </section>
        )}

        <PhotoCapture photos={photos} onChange={setPhotos} />

        <div>
          <label htmlFor="edit-notes" className="mb-2 block text-base font-medium text-gray-700">
            Notas
          </label>
          <textarea
            id="edit-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-primary focus:outline-none"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-base text-danger">{error}</p>
        )}
      </form>
    </Layout>
  );
}
