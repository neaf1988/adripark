import type { Rate, Ticket, VehicleType } from '@/types';
import { isMotoVehicle, vehicleTypeToRateKey } from '@/types';
import { db } from './database';

export async function getAllRates(): Promise<Rate[]> {
  return db.rates.toArray();
}

export async function getRateByVehicleType(vehicleType: VehicleType): Promise<Rate | undefined> {
  const key = vehicleTypeToRateKey(vehicleType);
  return db.rates.get(key);
}

export async function updateRate(id: string, costPerMinute: number): Promise<void> {
  await db.rates.update(id, { costPerMinute });
}

export async function createTicket(
  ticket: Omit<Ticket, 'id' | 'status' | 'checkOutTime'>,
): Promise<number> {
  const id = await db.tickets.add({
    ...ticket,
    checkOutTime: null,
    status: 'PARKED',
  });
  if (id === undefined) {
    throw new Error('No se pudo crear el ticket');
  }
  return id;
}

export async function getParkedTickets(): Promise<Ticket[]> {
  return db.tickets.where('status').equals('PARKED').toArray();
}

export async function isPlateParked(plate: string): Promise<boolean> {
  const normalized = plate.trim().toUpperCase();
  const match = await db.tickets
    .where('status')
    .equals('PARKED')
    .filter((ticket) => ticket.plate.toUpperCase() === normalized)
    .first();
  return match !== undefined;
}

export async function isPlateParkedByOther(plate: string, excludeId: number): Promise<boolean> {
  const normalized = plate.trim().toUpperCase();
  const match = await db.tickets
    .where('status')
    .equals('PARKED')
    .filter((ticket) => ticket.id !== excludeId && ticket.plate.toUpperCase() === normalized)
    .first();
  return match !== undefined;
}

export type ParkedTicketUpdate = {
  plate: string;
  vehicleType: VehicleType;
  checkInTime: string;
  notes?: string;
  photos?: string[];
  helmetsCount?: number;
  intercomCount?: number;
  glovesCount?: number;
  otherAccessories?: string;
};

export async function updateParkedTicket(id: number, updates: ParkedTicketUpdate): Promise<void> {
  const ticket = await db.tickets.get(id);
  if (!ticket || ticket.status !== 'PARKED') {
    throw new Error('El ticket no se puede editar');
  }

  const normalizedPlate = updates.plate.trim().toUpperCase();
  if (await isPlateParkedByOther(normalizedPlate, id)) {
    throw new Error(`La placa ${normalizedPlate} ya está estacionada`);
  }

  const updated: Ticket = {
    ...ticket,
    plate: normalizedPlate,
    vehicleType: updates.vehicleType,
    checkInTime: updates.checkInTime,
    notes: updates.notes,
    photos: updates.photos,
  };

  if (isMotoVehicle(updates.vehicleType)) {
    updated.helmetsCount = updates.helmetsCount;
    updated.intercomCount = updates.intercomCount;
    updated.glovesCount = updates.glovesCount;
    updated.otherAccessories = updates.otherAccessories;
  } else {
    delete updated.helmetsCount;
    delete updated.intercomCount;
    delete updated.glovesCount;
    delete updated.otherAccessories;
  }

  await db.tickets.put(updated);
}

export async function searchParkedByPlate(query: string): Promise<Ticket[]> {
  const normalized = query.trim().toUpperCase();
  if (!normalized) {
    return getParkedTickets();
  }
  return db.tickets
    .where('status')
    .equals('PARKED')
    .filter((ticket) => ticket.plate.toUpperCase().includes(normalized))
    .toArray();
}

export async function getTicketById(id: number): Promise<Ticket | undefined> {
  return db.tickets.get(id);
}

export async function completeTicket(
  id: number,
  checkOutTime: string,
  totalMinutes: number,
  totalAmount: number,
): Promise<void> {
  await db.tickets.update(id, {
    checkOutTime,
    status: 'COMPLETED',
    totalMinutes,
    totalAmount,
  });
}

export async function cancelTicket(id: number): Promise<void> {
  await db.tickets.update(id, {
    status: 'CANCELLED',
    checkOutTime: new Date().toISOString(),
  });
}

export async function getCompletedTickets(): Promise<Ticket[]> {
  return db.tickets.where('status').equals('COMPLETED').reverse().sortBy('checkOutTime');
}

function startOfTodayIso(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

export async function getTodayCompletedTickets(): Promise<Ticket[]> {
  const start = startOfTodayIso();
  const completed = await db.tickets.where('status').equals('COMPLETED').toArray();
  return completed
    .filter((ticket) => ticket.checkOutTime && ticket.checkOutTime >= start)
    .sort((a, b) => (b.checkOutTime ?? '').localeCompare(a.checkOutTime ?? ''));
}

export async function getTodayStats(): Promise<{ count: number; revenue: number }> {
  const tickets = await getTodayCompletedTickets();
  return {
    count: tickets.length,
    revenue: tickets.reduce((sum, ticket) => sum + (ticket.totalAmount ?? 0), 0),
  };
}

export function calculateParkingFee(
  checkInTime: string,
  checkOutTime: string,
  costPerMinute: number,
): { totalMinutes: number; totalAmount: number } {
  const checkIn = new Date(checkInTime).getTime();
  const checkOut = new Date(checkOutTime).getTime();
  const totalMinutes = Math.max(1, Math.ceil((checkOut - checkIn) / 60000));
  const totalAmount = totalMinutes * costPerMinute;
  return { totalMinutes, totalAmount };
}
