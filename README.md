# litebans-rest

A REST API for interacting with [LiteBans](https://www.spigotmc.org/resources/litebans.3715/) punishment data over HTTP.

> **Note:** Only PostgreSQL is supported. Make sure your LiteBans instance is configured to use a PostgreSQL database.

## Features

- Full CRUD for bans, kicks, mutes, warnings, and history
- Read-only server listing
- Paginated responses with filtering support
- Interactive API documentation via [Scalar](https://scalar.com) at `/reference`
- OpenAPI spec available at `/reference/openapi.json`

## Hosting

### Docker (recommended)

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgres://user:password@host:5432/litebans" \
  ghcr.io/chezzzer/litebans-rest:latest
```

### Docker Compose

```yaml
services:
  litebans-rest:
    image: ghcr.io/chezzzer/litebans-rest:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgres://user:password@host:5432/litebans"
      PORT: 3000
```

### From source

Requires [Bun](https://bun.sh) v1.3+.

```bash
git clone https://github.com/chezzzer/litebans-rest.git
cd litebans-rest
bun install
bunx prisma generate
bun run start
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string pointing to your LiteBans database |
| `PORT` | No | `3000` | Port the server listens on |
| `NODE_ENV` | No | `development` | `development`, `production`, or `test` |

### Example `.env`

```env
DATABASE_URL=postgres://user:password@localhost:5432/litebans
PORT=3000
```

## API Endpoints

All list endpoints support pagination via `page` and `per_page` query parameters.

### Bans `/bans`
| Method | Path | Description |
|---|---|---|
| GET | `/bans` | List bans (filter by `uuid`, `ip`, `active`, `banned_by_uuid`) |
| GET | `/bans/:id` | Get ban by ID |
| POST | `/bans` | Create a ban |
| PATCH | `/bans/:id` | Update a ban |
| DELETE | `/bans/:id` | Delete a ban |

### Kicks `/kicks`
| Method | Path | Description |
|---|---|---|
| GET | `/kicks` | List kicks |
| GET | `/kicks/:id` | Get kick by ID |
| POST | `/kicks` | Create a kick |
| PATCH | `/kicks/:id` | Update a kick |
| DELETE | `/kicks/:id` | Delete a kick |

### Mutes `/mutes`
| Method | Path | Description |
|---|---|---|
| GET | `/mutes` | List mutes |
| GET | `/mutes/:id` | Get mute by ID |
| POST | `/mutes` | Create a mute |
| PATCH | `/mutes/:id` | Update a mute |
| DELETE | `/mutes/:id` | Delete a mute |

### Warnings `/warnings`
| Method | Path | Description |
|---|---|---|
| GET | `/warnings` | List warnings |
| GET | `/warnings/:id` | Get warning by ID |
| POST | `/warnings` | Create a warning |
| PATCH | `/warnings/:id` | Update a warning |
| DELETE | `/warnings/:id` | Delete a warning |

### History `/history`
| Method | Path | Description |
|---|---|---|
| GET | `/history` | List history (filter by `uuid`, `ip`, `name`) |
| GET | `/history/:id` | Get history entry by ID |
| POST | `/history` | Create a history entry |
| PATCH | `/history/:id` | Update a history entry |
| DELETE | `/history/:id` | Delete a history entry |

### Servers `/servers` (read-only)
| Method | Path | Description |
|---|---|---|
| GET | `/servers` | List servers (filter by `name`) |
| GET | `/servers/:id` | Get server by ID |

## Documentation

Once the server is running, visit `/reference` for interactive API documentation powered by Scalar.
