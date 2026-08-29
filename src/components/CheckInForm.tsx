import { useEffect, useState } from 'react';
import { createTicket, isPlateParked } from '@/db/repositories';
import type { VehicleType } from '@/types';
import { VEHICLE_TYPES, isMotoVehicle } from '@/types';
import { normalizePlate, fromDatetimeLocalValue, nowDatetimeLocalValue } from '@/utils/format';
import { Layout } from './Layout';
import { VehicleExtraFields } from './VehicleExtraFields';
import { Button } from './ui/Button';
import { OptionGroup } from './ui/OptionGroup';
import { PhotoCapture } from './ui/PhotoCapture';

interface CheckInFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

import { buildVehicleFields } from '@/utils/vehicleFields';

export function CheckInForm({ onBack, onSuccess }: CheckInFormProps) {
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Carro');
  const [helmetsCount, setHelmetsCount] = useState<0 | 1 | 2>(0);
  const [intercomCount, setIntercomCount] = useState<0 | 1 | 2>(0);
  const [glovesCount, setGlovesCount] = useState<0 | 1 | 2>(0);
  const [otherAccessories, setOtherAccessories] = useState('');
  const [stayUnlocked, setStayUnlocked] = useState(false);
  const [wasLocked, setWasLocked] = useState(false);
  const [keysLeft, setKeysLeft] = useState(false);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [checkInLocal, setCheckInLocal] = useState(nowDatetimeLocalValue());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setError(null);
  }, [plate, vehicleType, checkInLocal]);

  useEffect(() => {
    if (!stayUnlocked) setWasLocked(false);
  }, [stayUnlocked]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
      const alreadyParked = await isPlateParked(normalizedPlate);
      if (alreadyParked) {
        setError(`La placa ${normalizedPlate} ya tiene un vehículo estacionado`);
        return;
      }

      await createTicket({
        plate: normalizedPlate,
        vehicleType,
        checkInTime,
        notes: notes.trim() || undefined,
        photos: photos.length > 0 ? photos : undefined,
        ...buildVehicleFields(vehicleType, stayUnlocked, wasLocked, keysLeft),
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
    } catch {
      setError('No se pudo registrar el ingreso');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout
      title="Ingreso"
      subtitle="Registrar vehículo"
      onBack={onBack}
      footer={
        <Button type="submit" form="checkin-form" fullWidth disabled={submitting}>
          {submitting ? 'Registrando...' : 'Registrar ingreso'}
        </Button>
      }
    >
      <form id="checkin-form" onSubmit={handleSubmit} className="flex flex-col gap-5 pb-2">
        <div>
          <label htmlFor="plate" className="mb-2 block text-base font-medium text-gray-700">
            Placa *
          </label>
          <input
            id="plate"
            type="text"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-lg uppercase focus:border-primary focus:outline-none"
            autoComplete="off"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="checkin-time" className="mb-2 block text-base font-medium text-gray-700">
            Hora de ingreso *
          </label>
          <input
            id="checkin-time"
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
          wasLocked={wasLocked}
          keysLeft={keysLeft}
          onStayUnlockedChange={setStayUnlocked}
          onWasLockedChange={setWasLocked}
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
              <label htmlFor="accessories" className="mb-2 block text-base font-medium text-gray-700">
                Otros accesorios
              </label>
              <input
                id="accessories"
                type="text"
                value={otherAccessories}
                onChange={(e) => setOtherAccessories(e.target.value)}
                placeholder="Chaleco, candado..."
                className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-base focus:border-primary focus:outline-none"
              />
            </div>
          </section>
        )}

        <PhotoCapture photos={photos} onChange={setPhotos} />

        <div>
          <label htmlFor="notes" className="mb-2 block text-base font-medium text-gray-700">
            Notas
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Observaciones..."
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
