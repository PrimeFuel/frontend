# FrontendFullTank (`fronted-full-tank`)

## Overview
FrontendFullTank is an Angular application organized with a domain-driven design (DDD) style. The project demonstrates how to model features by bounded context and keep business concepts separated from UI and infrastructure concerns.

The current implementation includes bounded contexts for fulfillment, inventory, and reporting, with shared infrastructure for API communication and common UI components.

## Goals
- Show a practical front-end architecture with DDD-inspired layering.
- Keep domain concepts explicit through bounded contexts.
- Provide a clean learning base for CRUD use cases, localization, role-based access, and routing in a fuel delivery system.

## Tech Stack
- Angular
- Angular CLI
- Angular Material
- RxJS
- @ngx-translate/core (for internationalization)
- Chart.js
- JSON Server

## Project Structure (DDD-Oriented)
```text
src/
  fulfillment/                 # Fulfillment bounded context
    application/               # Application services and stores
    domain/                    # Domain models and entities
    infrastructure/            # API endpoints and assemblers
    presentation/              # Views and route declarations

  inventory/                   # Inventory bounded context
    application/               # Application services and stores
    domain/                    # Domain models and entities
    infrastructure/            # API endpoints and assemblers
    presentation/              # Views and route declarations

  reporting/                   # Reporting bounded context
    application/               # Application services and stores
    domain/                    # Domain models and entities
    infrastructure/            # API endpoints and assemblers
    presentation/              # Views and route declarations

  shared/                      # Shared cross-context concerns
    infrastructure/            # BaseApi, BaseEndpoint, etc.
    presentation/              # Layout and shared views/components

  environments/                # Environment configuration files
```

## Bounded Contexts

### Fulfillment Context
Manages deliveries, drivers, and vehicles.

- Views for dispatch dashboard, driver form/list, vehicle form/list.
- Uses stores for state management.
- Handles logistics and dispatching in the fuel delivery system.

### Inventory Context
Manages fuel products and inventory items.

- Views for inventory list and product form.
- CRUD operations for managing stock and products.

### Reporting Context
Handles reporting and metrics.

- Views for client portfolio and metrics.
- Aggregates data for analytics and KPIs.

### Shared Context
Provides reusable infrastructure and presentation utilities.

- `BaseApi` centralizes HTTP client configuration.
- `BaseEndpoint` centralizes CRUD endpoint behavior.
- Shared UI components and layouts.

## Layer Responsibilities

### Presentation Layer
- Renders UI and handles user interactions.
- Calls infrastructure services directly or via stores.
- Includes views, components, and route declarations.

### Infrastructure Layer
- Talks to external services/APIs.
- Provides base classes for API communication and CRUD operations.

### Application Layer
- Contains stores for state management.
- Orchestrates domain logic and infrastructure calls.

### Domain Layer
- Defines entities and business models.
- Keeps business rules and logic.

## Running the Project

### Prerequisites
- Node.js + npm installed (use versions compatible with Angular 21).

### 1) Install dependencies
```bash
npm install
```

### 2) Start the Angular app
```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### 3) Start the JSON Server (for mock data)
```bash
npm run server
```

This starts the JSON Server on port 3000 with the data from `server/db.json`.

### 4) Build for production
```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### 5) Running unit tests
```bash
ng test
```

## Environment Variables
Environment files included:
- `src/environments/environment.development.ts`
- `src/environments/environment.ts`

Main variables:
- `serverBasePath` (base API URL, e.g., 'https://json-server-y51j.onrender.com')
- Endpoint paths for IAM, Inventory, Ordering, Fulfillment, Payment, Notification, Reporting.

Tip: In development, it uses the JSON Server; in production, external APIs.

## Routing Notes
- Routes are organized by bounded context under `/fulfillment`, `/inventory`, etc.
- Defined in `app.routes.ts` and context-specific route files.
- Supports localization with i18n files in `public/i18n/`.

## API and Data Notes
- Uses JSON Server for local mock data (`server/db.json`).
- External API endpoints for various services.
- Firebase integration for additional services.
- Chart.js for data visualization in reporting.

## Recommended Development Practices
- Keep each feature inside its bounded context first; move to `shared` only when truly cross-context.
- Preserve separation between presentation, application, domain, and infrastructure layers.
- Prefer explicit domain language in naming and docs.
- Add or update docs when introducing new entities or use cases.
