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

### GitHub Pages (automático)

URL final: **https://neaf1988.github.io/adripark/**

#### Activar Pages (solo una vez)

1. Abre **Settings → Pages**: https://github.com/neaf1988/adripark/settings/pages
2. En **Build and deployment → Source**, elige **Deploy from a branch**.
3. En **Branch**, selecciona **`gh-pages`** y carpeta **`/ (root)`**, luego **Save**.

> La rama `gh-pages` la crea el workflow en el primer despliegue exitoso. Si no aparece aún, espera a que termine el workflow en **Actions** y vuelve a refrescar la página de Settings.

4. Ve a **Actions** y ejecuta **Deploy to GitHub Pages** (o haz push a `main`).

El workflow publica el contenido de `dist/` en la rama `gh-pages`.

### Otros hostings

Publicar el contenido de `dist/` en cualquier hosting estático con HTTPS. Para GitHub Pages usar `VITE_BASE_PATH=/adripark/` al hacer build.
