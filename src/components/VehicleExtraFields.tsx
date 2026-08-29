import type { VehicleType } from '@/types';
import { isMotoVehicle } from '@/types';
import { OptionGroup } from './ui/OptionGroup';

interface VehicleExtraFieldsProps {
  vehicleType: VehicleType;
  stayUnlocked: boolean;
  wasLocked: boolean;
  keysLeft: boolean;
  onStayUnlockedChange: (value: boolean) => void;
  onWasLockedChange: (value: boolean) => void;
  onKeysLeftChange: (value: boolean) => void;
}

const yesNoOptions = [
  { label: 'No', value: false },
  { label: 'Sí', value: true },
];

export function VehicleExtraFields({
  vehicleType,
  stayUnlocked,
  wasLocked,
  keysLeft,
  onStayUnlockedChange,
  onWasLockedChange,
  onKeysLeftChange,
}: VehicleExtraFieldsProps) {
  if (isMotoVehicle(vehicleType)) {
    return (
      <section className="space-y-4 rounded-xl border-2 border-orange-100 bg-orange-50 p-4">
        <h3 className="font-semibold text-orange-800">Seguridad de moto</h3>

        <OptionGroup
          label="¿Queda desbloqueada? *"
          value={stayUnlocked}
          options={yesNoOptions}
          onChange={onStayUnlockedChange}
        />

        {stayUnlocked && (
          <OptionGroup
            label="¿Quedó bloqueada? *"
            value={wasLocked}
            options={yesNoOptions}
            onChange={onWasLockedChange}
          />
        )}
      </section>
    );
  }

  if (vehicleType === 'Carro') {
    return (
      <section className="space-y-4 rounded-xl border-2 border-purple-100 bg-purple-50 p-4">
        <h3 className="font-semibold text-purple-800">Llaves</h3>

        <OptionGroup
          label="¿Dejaron llaves? *"
          value={keysLeft}
          options={yesNoOptions}
          onChange={onKeysLeftChange}
        />
      </section>
    );
  }

  return null;
}
