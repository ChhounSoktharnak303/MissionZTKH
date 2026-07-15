# Mission Form Management System

A professional CRUD web application for managing missions, built with modern web technologies.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite
- **ORM**: Prisma
- **Forms**: React Hook Form + Zod Validation
- **Charts**: Recharts
- **Excel**: SheetJS (xlsx)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Features

- CRUD operations for missions
- Dashboard with summary cards and charts
- Search, filter, sort, and pagination
- Excel export and import
- Dark mode / Light mode
- Responsive design
- Print-friendly reports
- Keyboard shortcuts (Ctrl+S to save)

## Getting Started

### Prerequisites

- Node.js 20.9+
- npm

### Installation

```bash
git clone https://github.com/your-username/mission-app.git
cd mission-app
npm install
```

### Database Setup

```bash
npx prisma migrate dev
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Business Rules

| Rule | Value |
|------|-------|
| Fuel Rate | $0.75 per 10 km |
| Motor Ticket | $0.50 (default) |
| Total Cost | Fuel Cost + Ticket Cost |

### Fuel Cost Formula

```
fuelCost = (distanceKm / 10) × 0.75
```

Examples:
- 10 km = $0.75
- 20 km = $1.50
- 35 km = $2.625

## Project Structure

```
src/
├── app/
│   ├── api/missions/        # API route handlers
│   ├── missions/            # Mission pages
│   ├── reports/             # Reports page
│   └── settings/            # Settings page
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── layout/              # Layout components
│   ├── missions/            # Mission-specific components
│   ├── dashboard/           # Dashboard components
│   └── charts/              # Chart components
├── hooks/                   # Custom React hooks
├── lib/                     # Prisma client
├── types/                   # TypeScript types
└── utils/                   # Utility functions
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/missions` | List missions (with filters) |
| POST | `/api/missions` | Create mission |
| PUT | `/api/missions` | Update mission |
| DELETE | `/api/missions` | Delete mission |
| POST | `/api/missions/import` | Import missions from Excel |

## License

MIT
