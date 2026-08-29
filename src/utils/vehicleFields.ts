import type { VehicleType } from '@/types';
import { isMotoVehicle } from '@/types';

export function buildVehicleFields(
  vehicleType: VehicleType,
  stayUnlocked: boolean,
  keysLeft: boolean,
) {
  if (isMotoVehicle(vehicleType)) {
    return { stayUnlocked };
  }
  if (vehicleType === 'Carro') {
    return { keysLeft };
  }
  return {};
}
