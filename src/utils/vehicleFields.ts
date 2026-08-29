import type { VehicleType } from '@/types';
import { isMotoVehicle } from '@/types';

export function buildVehicleFields(
  vehicleType: VehicleType,
  stayUnlocked: boolean,
  wasLocked: boolean,
  keysLeft: boolean,
) {
  if (isMotoVehicle(vehicleType)) {
    return {
      stayUnlocked,
      wasLocked: stayUnlocked ? wasLocked : undefined,
    };
  }
  if (vehicleType === 'Carro') {
    return { keysLeft };
  }
  return {};
}

export function getVehicleSecuritySummary(ticket: {
  vehicleType: VehicleType;
  stayUnlocked?: boolean;
  wasLocked?: boolean;
  keysLeft?: boolean;
}): string[] {
  const lines: string[] = [];

  if (isMotoVehicle(ticket.vehicleType)) {
    if (ticket.stayUnlocked) {
      lines.push(`Desbloqueada: Sí · ¿Quedó bloqueada?: ${ticket.wasLocked ? 'Sí' : 'No'}`);
    } else {
      lines.push('Desbloqueada: No (bloqueada)');
    }
  }

  if (ticket.vehicleType === 'Carro') {
    lines.push(`Dejaron llaves: ${ticket.keysLeft ? 'Sí' : 'No'}`);
  }

  return lines;
}
