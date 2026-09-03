# Vortix

> **Build. Scale. Orchestrate.**

Vortix is an enterprise operational intelligence and modular dashboard orchestration platform. Engineered for modern manufacturing plants, supply chains, and multi-tenant operations, Vortix unifies real-time machine telemetry, digital standard operating procedures (SOPs), cross-app connectors, and flexible visual analytics into a coherent operational cockpit.

---

## Architecture & Core Modules

```
                        ┌───────────────────────────────┐
                        │   Vortix Orchestration Hub    │
                        │    (Build. Scale. Orchestrate)│
                        └───────────────┬───────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
┌──────────────┐              ┌──────────────────┐            ┌──────────────────┐
│ Custom Dash  │              │  Enterprise Apps │            │  BYO Database    │
│   Builder    │              │  & Connectors    │            │     Hub          │
│(Grid/Freeform│              │(HubSpot, SF,     │            │(PostgreSQL, SQL, │
│ Multi-Select)│              │ Jira, Slack, etc)│            │ Mongo, Snowflake)│
└───────┬──────┘              └─────────┬────────┘            └─────────┬────────┘
        │                               │                               │
        └───────────────────────────────┼───────────────────────────────┘
                                        │
                        ┌───────────────▼───────────────┐
                        │   Multi-Tenancy & Governance  │
                        │(Sub-Account Rollup & RLS/RBAC)│
                        └───────────────────────────────┘
```

---

## Key Features & Capabilities

### 1. Dashboard Builder & Layout Mechanics (`CustomDashboardBuilderView`)
- **Snap-to-Grid Utility**: Configurable grid spacing with three distinct density levels (**Compact**, **Standard**, **Spacious**) or switch to **Freeform Canvas Mode** with a 20px precision snap grid and real-time (X, Y) coordinate badges.
- **Component Manipulation**:
  - **Multi-Select Grouping**: Select multiple widgets simultaneously using the top-left checkbox on each widget card.
  - **Floating Action Bar**: Perform bulk actions on selected widgets: bulk column resize (**1 Col**, **2 Col**, **3 Col**, **4 Col**), bulk duplicate, and bulk delete.
  - **Real-Time Alignment Guides**: Toggleable crosshairs and rule-of-thirds dashed guidelines across the canvas and active components for visual precision.
  - **Undo / Redo History**: Full state history tracking with keyboard shortcuts (`Ctrl+Z` / `Cmd+Z` to undo, `Ctrl+Y` / `Cmd+Shift+Z` to redo) and quick toolbar buttons.
- **Multi-Device Breakpoint Previews**:
  - **Desktop View**: Full 100% responsive fluid grid.
  - **Tablet View**: 768px bounded frame with adaptive 2-column wrapping simulating shop-floor rugged tablets.
  - **Mobile View**: 375px bounded frame with 1-column stacking for mobile operators and floor supervisors.
- **Dashboard Template Library**:
  - **Standard Role Presets**:
    1. **Executive Command Center**: High-level KPIs, OEE gauges, quarterly revenue, and operational summaries.
    2. **Sales Ops & Commercial Pipeline**: CRM conversion funnels, active deals pipeline, revenue forecasting, and invoicing status.
    3. **Floor Manager - Plant Operational Matrix**: Real-time traveler tracking, line OEE, 2D factory twin, AGV fleet telemetry, and shift handover notes.
    4. **HR Analytics & Workforce Matrix**: Ergonomic incident rates, shift attendance, operator training certifications, and staffing matrices.
  - **Custom Template Management**: Save any custom canvas layout as a persistent named template (stored in browser storage) with one-click loading and deletion.
- **Version History & Rollbacks**:
  - **Draft vs. Live Mode**: Distinguishes between staged draft edits and published live configurations with a visual status pill.
  - **Snapshot Backups**: Create named version snapshots (e.g., *"Q3 Plant Manager Approved Baseline"*).
  - **One-Click Rollbacks**: Restore past snapshots directly from the version audit drawer.

### 2. Global Filtering & Reactive State
- **Top Filter Ribbon**:
  - **Timeframe Selector**: Quick date filtering (**Today**, **Last 7D**, **MTD**, **QTD**, **YTD**).
  - **Facility / Region Scope**: Filter metrics across global operations (**All Plants**, **Dallas Stamping Hub**, **Munich Precision Optics**, **Tokyo Micro-Assembly**, **London Fasteners**).
  - **Live Search**: Instant keyword filtering across widget titles and data categories.
  - **Reactive Propagation**: Filters automatically propagate down through the `WidgetRenderer` to all interactive components (charts, sparklines, tables, and pivot views).

### 3. Comprehensive Widget Suite
Vortix provides 17+ specialized operational and analytical widgets:
1. **Line Sparkline Trend** (`chart_line_sparkline`): Multi-point time-series telemetry with trend deltas.
2. **Bar Breakdown** (`chart_bar_breakdown`): Production throughput comparisons vs. target thresholds per work cell.
3. **Donut / Pie Distribution** (`chart_pie_distribution`): Status breakdowns across work orders and scrap categories.
4. **Shift Heatmap Matrix** (`chart_heatmap_activity`): Hourly shift intensity and machine utilization tracking across days and shifts.
5. **Radial Capacity Gauge** (`chart_gauge_capacity`): Visual gauge displaying cell capacity utilization within safe thermal envelopes.
6. **Conversion Funnel** (`chart_funnel_pipeline`): Multi-stage funnel tracking RFQs, prototyping, and contracts won.
7. **Geospatial Fleet Logistics** (`geospatial_map_fleet`): Transit corridors, maritime freight routes, and ETA trackers.
8. **Single-Value KPI Tile** (`kpi_metric_tile`): High-contrast metric display with percentage trend badges.
9. **KPI Delta Comparison Card** (`kpi_comparison_card`): Actual vs. budget progress bar with attainment tracking.
10. **Interactive Pivot Table** (`interactive_data_pivot_table`): Multi-column data table with dynamic column sorting, pivot view grouping, and CSV/Excel export.
11. **Digital Traveler SOP** (`active_traveler`): Step-by-step assembly instructions, torque tolerances, and operator sign-offs.
12. **Line OEE Tracker** (`line_oee_tracker`): Live status, availability, performance, and quality metrics per production line.
13. **Digital Twin 2D Floor Map** (`digital_twin_map`): Interactive floor plan showing CNC bays, automated guided vehicles (AGVs), and temperature sensors.
14. **Quick Action Bar** (`quick_action_bar`): One-click shortcuts for barcode scanning, traveler sign-off, and line status toggles.
15. **Rich Media iFrame** (`rich_media_iframe`): Secure embedded feeds for CAD viewers, camera feeds, and industrial dashboards.
16. **Rich Markdown Note** (`rich_markdown_note`): Formatted shift handoff protocols and safety advisories.
17. **Workflow Automation Trigger** (`action_button_workflow`): Dispatches low-code automation webhooks and production rebalancing scripts.

### 4. Integrations & BYO Database Architecture
- **Enterprise App Connectors**:
  - Pre-configured connectors for **HubSpot**, **Salesforce**, **Zoho**, **Monday.com**, **Asana**, **Jira**, **QuickBooks**, **Xero**, **Slack**, and **Twilio**.
  - **Prominent Toggle Switches**: Instant enable/disable controls with immediate state updates.
  - **Bi-Directional Sync**: Real-time polling and webhook simulation for machine heartbeats and ERP events.
- **BYO Database Hub**:
  - Connect directly to external databases: **PostgreSQL**, **MySQL**, **Microsoft SQL Server**, **MongoDB**, **Snowflake**, and **ClickHouse**.
  - **Schema Inspector**: Browse live tables, column definitions, data types, and primary keys.
  - **Visual Query Builder**: Build visual queries with filters, aggregations, sorting, and limit parameters.
  - **SQL Console**: Interactive query editor with execution latency metrics, row counts, and sample query execution data.
  - **Widget Binding**: Bind query results directly to dashboard widgets.

### 5. Multi-Tenancy & Governance
- **Sub-Account Rollup Architecture**:
  - Manage independent subsidiary facilities with isolated work orders, revenue streams, and inventory counts.
  - **Master Financial Rollup**: Consolidate enterprise-wide metrics (total monthly revenue, active travelers, fleet OEE) across all sub-accounts.
- **Role-Based Access Control (RBAC)**:
  - Six distinct operational roles: **Plant Manager**, **Line Operator**, **Quality Inspector**, **Maintenance Tech**, **Supply Chain Lead**, and **Executive**.
  - Modular permissions across Production, Quality, Maintenance, Supply Chain, Integrations, and Governance.
- **Row-Level Security (RLS)**:
  - Department- and plant-level isolation rules to ensure users only view data relevant to their role and location.
- **Export & Sharing**:
  - Export dashboards to **PDF**, **PNG**, or raw **JSON** configurations.
  - Generate password/PIN-protected direct links for shop-floor kiosk terminals.
  - Generate responsive iframe embed codes with configurable sandbox security flags.

---

## Design System & Color Palette

Vortix adheres to a disciplined, high-contrast industrial earth-tone palette:

| Token | Hex Code | Description / Usage |
| :--- | :--- | :--- |
| **Primary Charcoal** | `#2D2D24` | Primary brand canvas, dark containers, high-contrast display typography |
| **Sage / Earth Accent** | `#5A5A40` | Active states, primary action buttons, borders, and indicator accents |
| **Sand Neutral** | `#FAF9F5` | Clean page backgrounds, light panels, and subtle dividers |
| **Border Neutral** | `#E5E5DE` | Card borders, table dividers, and input borders |
| **Earth Muted** | `#8B7E66` | Secondary labels, timestamps, metadata, and helper text |
| **Success Green** | `#2E6930` | Passed steps, active machines, and positive KPI deltas |
| **Warning Amber** | `#E59934` | Machine warnings, feeder holds, and scheduled maintenances |
| **Critical Red** | `#B33A3A` | Estops, scrap anomalies, and failed tolerances |

**Typography**: Paired serif headline typeface (*Newsreader*) for executive clarity and structured sans-serif (*Plus Jakarta Sans*) for operational density and tabular numerical precision.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build client and server bundles
npm run build

# Start production server
npm start
```

---

## License

Proprietary enterprise operational intelligence platform. All rights reserved.
