# Frontend

Next.js 16 frontend scaffold for the Job Fair platform.

## Stack

- Next.js 16.2.2 with App Router
- React 19
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod

## Fresh Frontend Setup

Use this when starting from zero in a new clone.

1. Install dependencies from the workspace root:

   ```bash
   pnpm install
   ```

2. Create the frontend env file:

   ```bash
   cp .env.example .env
   ```

3. Set the API base URL in `.env` file:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

4. Make sure the backend is running before you test authenticated pages.

5. Start the frontend:

   ```bash
   pnpm dev
   ```

## First Run Checklist

After the app starts, confirm these routes load without errors:

- `http://localhost:3000`
- `http://localhost:3000/login`
- `http://localhost:3000/register`

If you are testing authenticated flows, also confirm the backend is available at `http://localhost:4000/api/v1/health`.

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
