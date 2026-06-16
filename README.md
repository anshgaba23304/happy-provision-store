# Happy Provision Store

Grocery ordering website for **Happy Provision Store**, Deoband, U.P.

## Live website deploy

The app runs as **one website**: React frontend + Spring Boot API on a single URL.

### Deploy on Render (free, recommended)

1. Push code to GitHub: [anshgaba23304/happy-provision-store](https://github.com/anshgaba23304/happy-provision-store)

2. Go to [render.com](https://render.com) → **New** → **Blueprint** (or Web Service)

3. Connect your GitHub repo `happy-provision-store`

4. Render reads `render.yaml` automatically, or set manually:
   - **Runtime:** Docker
   - **Dockerfile path:** `./Dockerfile`

5. Click **Deploy** — you get a URL like:
   `https://happy-provision-store.onrender.com`

> **Free tier note:** Persistent disks are not available on Render’s free plan. Orders and photos are kept while the app is running, but may be **lost when Render restarts or redeploys** the service. For permanent storage, upgrade to a paid plan and add a disk (see `render-paid.yaml.example`).

### Deploy with Docker (any server)

```bash
cd happy-provision-store
docker build -t happy-provision-store .
docker run -p 8080:8080 \
  -v happy-store-data:/app/persist \
  -e STORE_DATA_PATH=/app/persist/data \
  -e STORE_UPLOAD_PATH=/app/persist/uploads \
  happy-provision-store
```

Open **http://localhost:8080**

### Build & run locally (as website)

```bash
cd happy-provision-store
./deploy.sh
cd backend && java -jar target/store-1.0.0.jar
```

Open **http://localhost:8081**

---

## Development (separate frontend + backend)

**Backend:**
```bash
cd backend && mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend && npm run dev
```

Open **http://localhost:5173**

---

## Admin

- URL: `/admin`
- Default PIN: `1234` (change in `application.properties`)

## Store config

Edit `backend/src/main/resources/application.properties`:

```properties
app.store.phones=9557237665
app.admin-pin=1234
```

## Tech stack

- **Frontend:** React, Vite, PWA
- **Backend:** Java 21, Spring Boot 3, H2
- **Deploy:** Docker, Render

## Data storage

| Data | Path |
|------|------|
| Orders (database) | `STORE_DATA_PATH` → default `./data/` |
| Grocery photos | `STORE_UPLOAD_PATH` → default `./uploads/` |

Back up these folders before redeploying without persistent disk.
