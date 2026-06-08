# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deploy to Railway / Heroku

To deploy this app to Railway (or any platform that uses `Procfile`), set the `DATABASE_URL` environment variable to a PostgreSQL connection string. A sample `.env.example` is included.

Steps:

1. Build the frontend (Railway will usually run `npm run build` during deploy):

```bash
npm install
npm run build
```

2. Ensure `DATABASE_URL` is set in the environment (Railway: add as a variable). The server expects a `DATABASE_URL` for persisting patients and uploads.

3. Start the server (Railway will use the `Procfile`):

```bash
node server.js
```

Notes:
- If `DATABASE_URL` is not set the server will still start but endpoints that require the database will return an error.
- For production, set `NODE_ENV=production` and provide a managed Postgres instance.
