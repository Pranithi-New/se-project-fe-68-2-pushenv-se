# Frontend

Next.js 16 frontend scaffold for the Job Fair platform.

## Stack

- Next.js 16.2.2 with App Router
- React 19
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod

## Fresh Frontend Setup

1. Copy the env template:

   ```bash
   cp .env.example .env
   ```

2. Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `.env`.

3. Install workspace dependencies from the root if you have not already:

   ```bash
   pnpm install
   ```

4. Start the frontend:

   ```bash
   pnpm dev
   ```

## Frontend Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
- `pnpm typecheck`

## Development Flow

Use this order when changing frontend behavior.

1. Keep the backend API shape in mind when editing pages or forms.
2. Use `src/lib/api.ts` for requests so auth headers and error handling stay consistent.
3. Use `src/lib/auth.ts` when reading or writing the token.
4. Update the role-based route groups under `src/app/` as needed.
5. Adjust `src/proxy.ts` if route protection or redirect behavior changes.
6. Verify with `pnpm lint`, `pnpm typecheck`, and `pnpm build`.

## Runtime Notes

- `NEXT_PUBLIC_API_URL` controls the API base URL.
- The frontend expects the backend to be running before authenticated pages can work.
- Protected routes are split by role under `src/app`.
