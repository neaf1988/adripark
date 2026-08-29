import type { Ticket } from '@/types';
import { isMotoVehicle } from '@/types';

export function isMotoLocked(ticket: Ticket): boolean {
  if (!isMotoVehicle(ticket.vehicleType)) return false;
  return ticket.stayUnlocked === false;
}

export function hasKeysLeft(ticket: Ticket): boolean {
  return ticket.vehicleType === 'Carro' && ticket.keysLeft === true;
}

export type CheckoutAlert = {
  id: string;
  label: string;
  variant: 'warning' | 'danger' | 'info';
};

export function getCheckoutAlerts(ticket: Ticket): CheckoutAlert[] {
  const alerts: CheckoutAlert[] = [];

  if (isMotoLocked(ticket)) {
    alerts.push({
      id: 'moto-locked',
      label: 'Moto bloqueada',
      variant: 'warning',
    });
  }

  if (hasKeysLeft(ticket)) {
    alerts.push({
      id: 'keys-left',
      label: 'Dejaron llaves',
      variant: 'warning',
    });
  }

  return alerts;
}
