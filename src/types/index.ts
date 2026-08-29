export type VehicleType = 'Carro' | 'Moto' | 'Moto Grande';

export type RateVehicleType = 'carro' | 'moto' | 'moto-grande';

export type TicketStatus = 'PARKED' | 'COMPLETED' | 'CANCELLED';

export interface Rate {
  id: string;
  vehicleType: RateVehicleType;
  costPerMinute: number;
}

export interface Ticket {
  id?: number;
  plate: string;
  vehicleType: VehicleType;
  checkInTime: string;
  checkOutTime: string | null;
  notes?: string;
  photos?: string[];
  helmetsCount?: number;
  intercomCount?: number;
  glovesCount?: number;
  otherAccessories?: string;
  stayUnlocked?: boolean;
  keysLeft?: boolean;
  status: TicketStatus;
  totalMinutes?: number;
  totalAmount?: number;
}

export const VEHICLE_TYPES: VehicleType[] = ['Carro', 'Moto', 'Moto Grande'];

export const RATE_VEHICLE_TYPES: RateVehicleType[] = ['carro', 'moto', 'moto-grande'];

const RATE_KEY_MAP: Record<VehicleType, RateVehicleType> = {
  Carro: 'carro',
  Moto: 'moto',
  'Moto Grande': 'moto-grande',
};

const RATE_LABEL_MAP: Record<RateVehicleType, string> = {
  carro: 'Carro',
  moto: 'Moto',
  'moto-grande': 'Moto Grande',
};

export function vehicleTypeToRateKey(vehicleType: VehicleType): RateVehicleType {
  return RATE_KEY_MAP[vehicleType];
}

export function rateKeyToLabel(key: RateVehicleType | string): string {
  return RATE_LABEL_MAP[key as RateVehicleType] ?? key;
}

export function isMotoVehicle(vehicleType: VehicleType): boolean {
  return vehicleType === 'Moto' || vehicleType === 'Moto Grande';
}
