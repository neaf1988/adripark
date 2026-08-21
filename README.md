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

Build de producción:

```bash
npm run build
```

## Modelo de datos

### Tabla `rates`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador (`carro`, `moto`, `moto-grande`) |
| vehicleType | string | Tipo de vehículo |
| costPerMinute | number | Tarifa por minuto |

### Tabla `tickets`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Auto-incremental |
| plate | string | Placa (indexada) |
| vehicleType | enum | Carro, Moto, Moto Grande |
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

## Despliegue

Publicar el contenido de `dist/` en cualquier hosting estático con HTTPS.
