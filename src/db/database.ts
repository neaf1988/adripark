import Dexie, { type EntityTable } from 'dexie';
import type { Rate, Ticket } from '@/types';

const DEFAULT_RATES: Rate[] = [
  { id: 'carro', vehicleType: 'carro', costPerMinute: 100 },
  { id: 'moto', vehicleType: 'moto', costPerMinute: 50 },
  { id: 'moto-grande', vehicleType: 'moto-grande', costPerMinute: 150 },
];

class ParkingDatabase extends Dexie {
  rates!: EntityTable<Rate, 'id'>;
  tickets!: EntityTable<Ticket, 'id'>;

  constructor() {
    super('AdriParkDB');

    this.version(1).stores({
      rates: 'id, vehicleType',
      tickets: '++id, plate, status, checkInTime, vehicleType',
    });

    this.version(2)
      .stores({
        rates: 'id, vehicleType',
        tickets: '++id, plate, status, checkInTime, vehicleType',
      })
      .upgrade(async (tx) => {
        const rates = tx.table('rates');
        const camioneta = await rates.get('camioneta');
        if (camioneta) {
          await rates.delete('camioneta');
          await rates.put({
            id: 'moto-grande',
            vehicleType: 'moto-grande',
            costPerMinute: camioneta.costPerMinute,
          });
        } else if (!(await rates.get('moto-grande'))) {
          await rates.put({ id: 'moto-grande', vehicleType: 'moto-grande', costPerMinute: 150 });
        }

        await tx.table('tickets').toCollection().modify((ticket) => {
          if (ticket.vehicleType === 'Camioneta') {
            ticket.vehicleType = 'Moto Grande';
          }
        });
      });
  }
}

export const db = new ParkingDatabase();

export async function seedDefaultRates(): Promise<void> {
  const count = await db.rates.count();
  if (count === 0) {
    await db.rates.bulkAdd(DEFAULT_RATES);
  }
}

export async function initDatabase(): Promise<void> {
  await db.open();
  await seedDefaultRates();
}

export { DEFAULT_RATES };
