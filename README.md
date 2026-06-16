# Happy Provision Store

A grocery ordering app and website for **Happy Provision Store**, Deoband, U.P.

## Features

- **Customer Order Form** — Name, phone, address, grocery photos
- **WhatsApp Integration** — Orders open WhatsApp with order details
- **Real-time Notifications** — Sound + browser notifications via Spring WebSocket (STOMP)
- **Admin Panel** — View orders, mark as delivered
- **Order Tracking** — Customers track orders by phone number
- **Free Home Delivery** — Orders above ₹500 within 2 km
- **PWA** — Install on phone (Add to Home Screen)

## Store Details

- **Name:** Happy Provision Store
- **Address:** Lajpat Nagar Railway Road Deoband U.P 247554
- **Phone:** 9557237665 (testing)
- **Email:** gaba23304@gmail.com

## Tech Stack

- **Frontend:** React, Vite, PWA, STOMP WebSocket
- **Backend:** Java 21, Spring Boot 3, Spring Data JPA, H2 Database

## Quick Start

### Prerequisites

- Java 21+
- Maven
- Node.js 18+

### 1. Start Backend (Spring Boot)

```bash
cd happy-provision-store
./run-backend.sh
```

API runs at **http://localhost:8080**

### 2. Start Frontend

```bash
./run-frontend.sh
```

Open **http://localhost:5173**

### 3. Admin Access

- Go to **Admin** tab
- Default PIN: `1234`
- Change in `backend/src/main/resources/application.properties` → `app.admin-pin`

## Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
app.store.phones=9557237665
app.admin-pin=1234
app.store.free-delivery-min-amount=500
app.store.free-delivery-max-km=2
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/store` | Store info |
| POST | `/api/orders` | Create order (multipart) |
| GET | `/api/orders?phone=` | Track by phone |
| GET | `/api/orders?adminPin=` | All orders (admin) |
| PATCH | `/api/orders/{id}/deliver` | Mark delivered |
| POST | `/api/check-delivery` | Check free delivery |
| WS | `/ws` | STOMP WebSocket for live notifications |

## How Track Order Works

1. Customer places order with their phone number
2. On **Track** page, enter the same 10-digit phone number
3. All orders linked to that number are shown with status
4. When admin marks **Delivered**, customer gets a notification + sound automatically
