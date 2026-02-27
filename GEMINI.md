## Project Overview

This is a Next.js application that visualizes historical events on an interactive world map. It allows users to explore events, filter them by year range and category, and view event details. The application is responsive and provides a different user experience on desktop and mobile devices.

The frontend is built with React, Next.js, Material-UI, and Tailwind CSS. It uses `react-leaflet` for the map component and `react-leaflet-markercluster` for clustering a large number of event markers.

The backend is implemented using Next.js API routes. It connects to a MongoDB database using Mongoose to store and retrieve event data and visitor information.

## Building and Running

### Prerequisites

- Node.js
- npm

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

### Running the application

1.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

2.  Build for production:
    ```bash
    npm run build
    ```

3.  Start the production server:
    ```bash
    npm run start
    ```

### Linting

Run the linter to check for code quality:

```bash
npm run lint
```

## Development Conventions

The project follows the standard Next.js project structure.

-   **Components:** Reusable React components are located in `src/app/components`.
-   **API Routes:** Server-side API endpoints are defined in `src/app/api`.
-   **Models:** Mongoose models for database schemas are in `src/app/models`.
-   **Styling:** The project uses a combination of Tailwind CSS for utility-first styling and Material-UI for UI components. Global styles are in `src/app/globals.css`.
-   **Themes:** Color themes for light and dark modes are defined in `src/app/themes/colorThemes.js`.
