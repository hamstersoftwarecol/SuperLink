# SuperLink

Plataforma SaaS multi-tenant para e-commerce y dropshipping en Colombia con pago contraentrega (COD).

Cada tenant (tienda) obtiene su propio dashboard, productos, landing pages de conversion y pipeline de ordenes — todo desde una sola instancia.

## Stack

| Capa | Tecnologia |
|------|-----------|
| Backend | Cloudflare Workers + Hono + D1 (SQLite) + KV |
| Frontend | Angular 22 + Tailwind CSS 4 |
| Auth | JWT con sesiones en KV (7 dias) |
| Infra | Wrangler (local dev + deploy) |

## Funcionalidades

### Multi-tenancy (Phase 1)
- Tenants aislados con slug unico (`/t/mi-tienda/...`)
- RBAC con 5 roles: super_admin, admin, vendedor, operador, viewer
- Dashboard con KPIs: ordenes, ingresos, tasa de conversion
- CRUD completo de productos, ordenes y usuarios

### Paginas publicas + COD (Phase 2)
- Paginas de producto publicas sin autenticacion
- Formulario de orden contraentrega con validacion
- Seleccion de departamento/ciudad con datos de Colombia (32 dptos, 200+ ciudades)
- Rate limiting en creacion de ordenes

### Pipeline de ordenes (Phase 3)
- Transiciones de estado validadas: pending → confirmed → shipped → delivered
- Historial de cambios con usuario, notas y timestamp
- Barra de progreso visual y timeline
- Auto-marca COD como pagado al entregar
- Pills de conteo por estado

### Landing pages (Phase 4)
- Galeria de imagenes con thumbnails y navegacion por dots
- Branding por tenant: color, logo, WhatsApp
- Elementos de urgencia: contador de viewers, barra de stock, badge de oferta
- Lista de beneficios/features por producto
- Seccion de testimonios y FAQ accordion
- Boton flotante de WhatsApp
- Barra sticky de CTA en mobile
- Banner de envio gratis

## Estructura

```
SuperLink/
├── backend/
│   ├── schema/migrations/     # Migraciones D1 (SQL)
│   ├── src/
│   │   ├── middleware/        # Auth JWT, RBAC, rate limiting
│   │   ├── routes/            # auth, orders, products, users, public, dashboard
│   │   ├── types/             # Interfaces TypeScript
│   │   └── utils/             # Helpers (ID generation, etc.)
│   └── wrangler.jsonc         # Config Cloudflare Workers
├── frontend/
│   ├── src/app/
│   │   ├── core/              # Services, guards, models, data (Colombia)
│   │   ├── features/          # auth, dashboard, public, admin
│   │   └── shared/            # Componentes reutilizables
│   └── angular.json
└── README.md
```

## Desarrollo local

### Backend

```bash
cd backend
npm install
npx wrangler d1 execute superlink-db --local --file=schema/migrations/0001_init.sql
npx wrangler d1 execute superlink-db --local --file=schema/migrations/0002_product_slugs.sql
npx wrangler d1 execute superlink-db --local --file=schema/migrations/0003_order_status_history.sql
npx wrangler d1 execute superlink-db --local --file=schema/migrations/0004_landing_pages.sql
npx wrangler dev --local
```

Backend en `http://localhost:8787`

### Frontend

```bash
cd frontend
npm install
npm run start
```

Frontend en `http://localhost:4200`

### Demo

- Tenant: `mi-tienda-demo`
- Login: `demo@superlink.co` / `Demo1234!`
- Landing page: `http://localhost:4200/t/mi-tienda-demo/depiladora-laser-ipl-pro`

## API

Todas las rutas autenticadas van bajo `/api/` con header `Authorization: Bearer <token>`.

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro con creacion de tenant |
| POST | `/api/auth/login` | Login, retorna JWT |
| GET | `/api/dashboard/stats` | KPIs del tenant |
| GET/POST | `/api/products` | Listar / crear productos |
| GET/PATCH/DELETE | `/api/products/:id` | Detalle / actualizar / eliminar |
| GET/POST | `/api/orders` | Listar / crear ordenes |
| PATCH | `/api/orders/:id/status` | Cambiar estado (con validacion de transicion) |
| GET | `/api/orders/:id/history` | Historial de cambios de estado |
| GET | `/api/public/:tenant/:product` | Producto publico (sin auth) |
| POST | `/api/public/:tenant/orders` | Crear orden COD (sin auth, rate limited) |

## Licencia

MIT
