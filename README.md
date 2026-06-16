# Happy Provision Store

Grocery ordering website for **Happy Provision Store**, Deoband, U.P.

Orders, photos, and analytics are stored in **MongoDB**. Real-time updates use in-app notifications (SSE).

## Live website deploy

### Deploy on Render

1. Push code to GitHub
2. Create a free **MongoDB Atlas** cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
3. In Atlas: **Database Access** → create user, **Network Access** → allow `0.0.0.0/0`
4. Copy connection string → `mongodb+srv://user:pass@cluster.../happy-provision-store`
5. On Render → connect repo → set environment variable:
   - `MONGODB_URI` = your Atlas connection string
6. Deploy

### Local development

**Backend:**
```bash
cd backend && mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend && npm run dev
```

Set `MONGODB_URI` in your environment or use local MongoDB on port 27017.

### Production build (single JAR)

```bash
./deploy.sh
cd backend && java -jar target/store-1.0.0.jar
```

---

## Admin

- URL: `/admin`
- PIN is set in `application.properties` (`app.admin-pin`) or `APP_ADMIN_PIN` env var
- **Orders tab** — manage orders, real-time new order alerts
- **Analytics tab** — daily sales, monthly revenue, order mix, 30-day breakdown

## Store config

Edit `backend/src/main/resources/application.properties`:

```properties
app.store.phones=9557237665
app.admin-pin=your-secret-pin
```

## Tech stack

- **Frontend:** React, Vite, PWA, SSE real-time
- **Backend:** Java 21, Spring Boot 3, MongoDB, GridFS (images)
- **Deploy:** Docker, Render

## Data storage

| Data | Storage |
|------|---------|
| Orders | MongoDB `orders` collection |
| Grocery photos | MongoDB GridFS via `/api/images/{id}` |

All data persists in your MongoDB cluster across redeploys.
