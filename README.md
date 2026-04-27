# Frontend

Next.js 16 frontend scaffold for the Job Fair platform.

## Stack

- Next.js 16.2.2 with App Router
- React 19
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod
- Playwright (E2E Testing)

## Architecture Note: Why `BACKEND_URL` instead of `NEXT_PUBLIC_*`?

In a "normal" Next.js app, you might see `NEXT_PUBLIC_API_URL`. Variables prefixed with `NEXT_PUBLIC_` are baked into the browser bundle. If you build a Docker image with this, the image becomes hardcoded to that specific public URL and cannot be deployed anywhere else without rebuilding.

To achieve a true **"Build Once, Run Anywhere"** Docker image, this application uses the Next.js Server as a **Transparent Proxy**:
1. The browser makes API calls to relative paths (e.g., `/api/backend/...`).
2. The Next.js server receives these requests and proxies them to the `BACKEND_URL`.
3. Because the proxy happens purely on the server, `BACKEND_URL` remains a server-side secret. 
4. In Docker, this allows the frontend to talk to the backend using internal Docker networking (`http://backend:4000`) without exposing the backend to the public internet or dealing with complex CORS setups.

## Running Local Development (Standalone)

Use this flow if you are running `pnpm dev` on your host machine.

1. Install dependencies from the workspace root:
   ```bash
   pnpm install
   ```

2. Create the frontend env file:
   ```bash
   cp .env.example .env
   ```
   *(Ensure `BACKEND_URL=http://localhost:4000` is set)*

3. Start the frontend dev server:
   ```bash
   pnpm dev
   ```

## Running via Docker Compose

The infrastructure is centralized in the backend repository's `infra/` folder.

1. **Build the Image**:
   ```bash
   pnpm docker:build
   ```
   *(Note: There is no `docker:push` script. If you need to push this image to a registry, tag and push it manually using your own Docker Hub credentials.)*

2. **Run the Full Stack** (from the backend's `infra/` directory):
   ```bash
   pnpm compose:prod
   ```

## Automated Testing

This project uses Playwright for End-to-End testing.

- Run all tests: `pnpm test`
- Run tests with UI mode: `pnpm test:ui`

## Frontend Scripts

- `pnpm dev` - Start local dev server
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript validation
- `pnpm test` - Run E2E tests
- `pnpm docker:build` - Build Docker image

## Development Flow

1. Keep the backend API shape in mind when editing pages or forms.
2. Use `src/lib/api.ts` for requests. This automatically routes traffic through the Next.js proxy.
3. Use `src/lib/auth.ts` when reading or writing the token.
4. Verify with `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
