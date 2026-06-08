# Br1tuyHub

Br1tuyHub is a B2B marketplace for business customers and suppliers. The project has a React frontend, an Express backend, and a PostgreSQL database.

## Project Structure

- `frontend/` - React + Vite client application
- `backend/` - Express API server
- `database.sql` - PostgreSQL database schema

## Important Note

The `node_modules` folders are not included in the project repository/archive. Dependencies must be installed locally with `npm install`.

If Vite/Rolldown reports an optional dependency error, reinstall frontend dependencies:

```bash
cd frontend
npm install
npm run build
```

On Windows, if PowerShell blocks npm scripts, use:

```bash
npm.cmd install
npm.cmd run build
```

## Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example`, then start the server:

```bash
npm run dev
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Database

Create a PostgreSQL database and run:

```bash
psql -U postgres -d your_database_name -f database.sql
```

The backend also performs small schema checks on startup for fields that are needed by the application.
