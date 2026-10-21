# Vista Test: Backend API

REST API for managing companies and their services.

**Stack:** Node.js, TypeScript, Express, Prisma 6, MySQL 8.

The Flutter frontend lives in a separate repository: `front-end-test-vista`.

## Prerequisites

- Node.js 20 or newer
- Docker Desktop (used to run MySQL, and optionally the API itself)
- Git

## Setup

1. Clone the repository and install dependencies:

```bash
   git clone https://github.com/mimr05-dev/back-end-test-vista.git
   cd back-end-test-vista
   npm install
```

2. Create your environment file:

```powershell
   # Windows PowerShell
   Copy-Item .env.example .env
```

```bash
   # macOS / Linux
   cp .env.example .env
```

   | Variable       | Description                  | Default in `.env.example`                          |
   | -------------- | ---------------------------- | -------------------------------------------------- |
   | `DATABASE_URL` | MySQL connection string      | `mysql://root:root@localhost:3306/vista_db`        |
   | `PORT`         | Port the API listens on      | `3000`                                             |

3. Start a MySQL 8 container:

```bash
   docker run -d --name vista-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=vista_db mysql:8
```

   Wait about 30 seconds for MySQL to finish starting. If the container already exists, use `docker start vista-mysql`.

4. Generate the Prisma client and apply the database migration:

```bash
   npx prisma generate
   npm run prisma:deploy
```

## Run

**Development** (auto-restarts on changes):

```bash
npm run dev
```

**Production build:**

```bash
npm run build
npm start
```

The API is available at `http://localhost:3000`. Check it with `GET /health`.

## Run with Docker

The Dockerfile builds the API, applies pending migrations on start, and then starts the server. MySQL must already be running (see Setup, step 3).

```bash
docker build -t vista-backend .
docker run --rm -p 3001:3000 -e DATABASE_URL="mysql://root:root@host.docker.internal:3306/vista_db" vista-backend
```

The API is then available at `http://localhost:3001`.

## API Endpoints

| Method | Path            | Description                           | Success |
| ------ | --------------- | ------------------------------------- | ------- |
| GET    | `/health`       | Health check                          | 200     |
| POST   | `/companies`    | Create a company                      | 201     |
| GET    | `/companies`    | List all companies with their services| 200     |
| POST   | `/services`     | Create a service under a company      | 201     |
| GET    | `/services/:id` | Get a service by ID                   | 200     |

### Request bodies

`POST /companies`

```json
{
  "name": "Acme Sdn Bhd",
  "registrationNumber": "202001000001"
}
```

`POST /services`

```json
{
  "companyId": 1,
  "name": "Web Development",
  "description": "Custom websites",
  "price": 1500.5
}
```

### Example response: `GET /companies`

```json
[
  {
    "id": 1,
    "name": "Acme Sdn Bhd",
    "registrationNumber": "202001000001",
    "services": [
      {
        "id": 1,
        "companyId": 1,
        "name": "Web Development",
        "description": "Custom websites",
        "price": 1500.5
      }
    ]
  }
]
```

### Error responses

All errors are JSON in the form `{ "error": "message" }`. Validation errors also include a `details` array.

| Status | When                                                              |
| ------ | ----------------------------------------------------------------- |
| 400    | Validation failed, or the request body is not valid JSON          |
| 404    | Company or service not found, or unknown route                    |
| 409    | A company with the same `registrationNumber` already exists       |
| 500    | Unexpected server error                                           |

Example (400):

```json
{
  "error": "Validation failed",
  "details": ["price must be a number between 0 and 99999999.99"]
}
```

## API Documentation

A Postman collection is included at `postman/vista-api.postman_collection.json`.
In Postman, choose **Import** and select the file. The `baseUrl` collection variable defaults to `http://localhost:3000`.

## Project Structure

```
src/
  index.ts                  Server entry point
  app.ts                    Express app, middleware, error handling
  dto.ts                    Request/response interfaces and mappers
  lib/prisma.ts             Prisma client instance
  middleware/
    logger.ts               Logs method, path and timestamp of each request
    validate.ts             Returns validation errors from express-validator
  routes/
    company.routes.ts       /companies endpoints
    service.routes.ts       /services endpoints
prisma/
  schema.prisma             Company and Service models
  migrations/               SQL migrations
postman/                    Postman collection
Dockerfile                  Container image for the API
```

## Scripts

| Script                  | Purpose                                         |
| ----------------------- | ----------------------------------------------- |
| `npm run dev`           | Start the dev server with auto-restart          |
| `npm run build`         | Generate the Prisma client and compile to `dist`|
| `npm start`             | Run the compiled server from `dist`             |
| `npm run prisma:migrate`| Create and apply a migration (development)      |
| `npm run prisma:deploy` | Apply existing migrations (production/CI)       |

## Notes

- Prisma is pinned to version 6 (`prisma@6`, `@prisma/client@6`).
- `price` is stored as `DECIMAL(10,2)` and returned as a JSON number.