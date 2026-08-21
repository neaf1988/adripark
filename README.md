# AdriPark - PWA Control de Parqueadero

Aplicación PWA offline-first para gestionar entrada, salida y cobro por minuto de vehículos en un parqueadero.

## Stack

- **React 19** + **Vite 6**
- **Tailwind CSS 4**
- **Dexie.js** (IndexedDB)
- **vite-plugin-pwa**

## Inicio rápido

```bash
npm install
npm run dev
```

## Modelo de datos

### Tabla `rates`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador (`moto`, `carro`, `camioneta`) |
| vehicleType | string | Tipo de vehículo |
| costPerMinute | number | Tarifa por minuto |

### Tabla `tickets`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Auto-incremental |
| plate | string | Placa (indexada) |
| vehicleType | enum | Moto, Carro, Camioneta |
| checkInTime | string | ISO String |
| checkOutTime | string \| null | ISO String |
| status | enum | PARKED, COMPLETED, CANCELLED |
| photos | string[] | Base64 |
| helmetsCount, intercomCount, glovesCount | — | Campos específicos de motos |

## Estructura

```
src/
├── db/
│   ├── database.ts    # Esquema Dexie + seed de tarifas
│   ├── repositories.ts # Operaciones CRUD
│   └── index.ts
├── types/
│   └── index.ts       # Interfaces Rate y Ticket
└── App.tsx
```
