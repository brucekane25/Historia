# Historia Frontend - Interactive Historical Events on Map  

A sophisticated React-based web application that visualizes over 6,500 historical events on an interactive world map, offering an engaging way to explore history through space and time.

## Features

- **Interactive Map Visualization**
  - Dynamic event clustering with MarkerClusterGroup
  - Custom map markers and detailed event popups
  - Multiple map layer options (OpenStreetMap, MapTiler, Dark Mode)
  - GeoJSON integration for geographical boundaries(India) 

- **Advanced Filtering System**
  - Dual-mode year range selection (horizontal for desktop, vertical for mobile)
  - Category-based filtering with 15+ historical event types
  - Real-time event clustering and map updates

- **Responsive Design**
  - Desktop: Persistent sidebar with event details
  - Mobile: Swipeable bottom drawer
  - Adaptive layout components

- **Timeline View**
  - Chronological display of events
  - Event thumbnails and descriptions
  - Interactive event selection

## Technical Stack

- **Core Technologies**
  - React 18
  - Vite
  - JavaScript ES6+

- **UI Frameworks & Libraries**
  - Material-UI v6
  - Tailwind CSS
  - React-Leaflet
  - Leaflet MarkerCluster

- **State Management**
  - React Hooks
  - Context API

- **HTTP Client**
  - Axios

## Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/brucekane25/Historia.git
```
2. **Install the node modules**
```bash
cd Historia
npm i
```
3. **Configure environment variables**

```bash
cp .env.example .env.local
# then set MONGODB_URI to your MongoDB connection string
```

4. **Run the development server**
```bash
npm run dev
```

---

## API

Gloria serves its own API from Next.js route handlers (`src/app/api`). It does
not depend on any external backend host.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/events/coordinates` | Events with coordinates, paginated and year-filtered |
| GET | `/api/events/paginate` | General paginated events |
| GET | `/api/events/yearrange` | Events within a year range |
| GET | `/api/events/category/[category]` | Events by category |
| GET | `/api/events/search/[keyword]` | Title search |
| GET | `/api/events/id/[id]` | Single event |
| GET | `/api/events/random` | Random event (Surprise Me) |
| GET | `/api/events/stats` | Aggregate event statistics |
| GET | `/api/events/today` | Events matching today's date |
| GET | `/api/events/related/[id]` | Related events |
| GET | `/api/events/nearby` | Nearby events (`lat`, `lon`, `radius`) |
| GET | `/api/health` | Liveness probe for Render |

All handlers run on the Node.js runtime, connect to MongoDB through
`src/lib/dbConnect.js`, and are marked `force-dynamic` so they are never
pre-rendered at build time.

---

## Deploying to Render (dynamic Node service)

This app **must** be deployed as a Render **Web Service** (`runtime: node`), not
as a static site. The `/api/*` handlers need a running Node process and
`MONGODB_URI` at request time. `render.yaml` is already configured for this.

Required Render environment variables:

- `MONGODB_URI` — MongoDB connection string (set as a secret in the dashboard)
- `MONGODB_DB` — database name; the events collection currently lives in `test`
- `NODE_ENV=production`
- `NODE_VERSION=22`

Build and start commands:

```bash
npm ci && npm run build
npm run start
```

Do **not** add `output: "export"` to `next.config.mjs`; that would produce a
static `out/` folder and break the API routes.
