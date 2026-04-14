# Orderlify Admin Panel (Backoffice)

Enterprise backoffice blueprint for platform-owner operations (multi-tenant SaaS).

## 1) Folder structure

```txt
src/backoffice
├── controllers/
│   └── backoffice.controller.js
├── routes/
│   └── backoffice.routes.js
├── services/
│   └── backoffice.service.js
├── validators/
│   └── backoffice.validators.js
└── frontend/
    ├── app/
    │   ├── dashboard/page.jsx
    │   ├── tenants/page.jsx
    │   ├── billing/page.jsx
    │   ├── analytics/page.jsx
    │   ├── support/page.jsx
    │   ├── settings/page.jsx
    │   ├── monitoring/page.jsx
    │   ├── marketing/page.jsx
    │   ├── security/page.jsx
    │   ├── reports/page.jsx
    │   ├── feature-flags/page.jsx
    │   └── automations/page.jsx
    ├── components/
    │   ├── data-table.jsx
    │   ├── kpi-card.jsx
    │   └── sidebar.jsx
    ├── app/layout.jsx
    └── styles.css
```

## 2) REST API design

Base URL: `/api/v1/backoffice`

- Dashboard
  - `GET /dashboard`

- Tenant management
  - `GET /tenants?page=&limit=&plan=&status=&region=`
  - `GET /tenants/:id`
  - `POST /tenants/:id/impersonate`
  - `PATCH /tenants/:id/plan`
  - `PATCH /tenants/:id/suspend`
  - `PATCH /tenants/:id/reactivate`
  - `POST /tenants/:id/reset-configuration`

- Billing & subscriptions
  - `GET /subscriptions/plans`

- Analytics
  - `GET /analytics?date_from=&date_to=&plan=&region=`
  - `GET /analytics/export?format=csv|pdf|xlsx`

- Support
  - `GET /tickets?page=&limit=`

- System configuration
  - `GET /system-configuration`

- Monitoring & logs
  - `GET /monitoring`

- Marketing
  - `GET /marketing`

- Security
  - `GET /security`

- Reports
  - `GET /reports`
  - `GET /reports/download?type=financial|customer|growth|churn&format=pdf|xlsx|csv`

- Feature flags
  - `GET /feature-flags`
  - `PATCH /feature-flags/:key`

- Automations
  - `GET /automations`

## 3) Core business features implemented in service layer

- Executive KPIs: MRR, ARR, churn, failed payments, active restaurants.
- Health score per tenant with churn-risk levels (`low`, `medium`, `high`).
- AI-style recommendations (deterministic mock logic for actions).
- Benchmarks on tenant details (percentile-style comparative metrics).
- Pricing plans with automatic yearly savings percentage.
- Monitoring and webhook-failure overview.
- Security module with RBAC matrix and audit logs.

## 4) Security model

- Authentication via existing JWT middleware.
- Backoffice route guard accepts roles: `admin`, `support`, `finance`.
- Input validation via `express-validator` for pagination, filters, report export, and feature-flag mutation.

## 5) Scalability notes

- Separation by controller/service/validator and dedicated route namespace.
- Prepared for repository extraction (per module) when integrating persistent DB reads.
- Frontend modules are isolated by route and can be connected with React Query + websocket streams.

## 6) Database design

See: `src/database/sql/orderlify_backoffice_schema.sql`
