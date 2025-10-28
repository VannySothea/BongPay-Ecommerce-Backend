# BongPay

**BongPay** is an open-source **microservice-based e-commerce backend** built with modern technologies like **Node.js**, **TypeScript**, **Express**, **Prisma**, **RabbitMQ**, **Redis**, and **PostgreSQL**.

It provides a modular, scalable foundation for building secure and event-driven e-commerce systems, supporting payments, carts, notifications, and more.


## Features

- **Microservice Architecture** — Independent services for modular scalability  
- **Identity & Authentication** — JWT-based authentication and role-based access control  
- **Payment System** — Can handles multiple payment flows  
- **Cart & Order Management** — Separate services for cart and order workflows  
- **Product Service** — Full product CRUD and sea---

## Architecture Overview
rch integration  
- **Notification Service** — Email notifications (via message broker)  
- **Event-Driven Messaging** — Using RabbitMQ for inter-service communication  
- **Caching & Rate Limiting** — Redis for caching and API protection  
- **API Gateway** — Unified entry point for all requests  
- **PostgreSQL + Prisma ORM** — Clean and maintainable data layer  
- **Docker Compose Support** — Simplified local deployment


## Tech Stack

| Layer | Technology |
|-------|-------------|
| Language | TypeScript |
| Framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Message Broker | RabbitMQ |
| Cache / Rate Limit | Redis |
| Containerization | Docker & Docker Compose |

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/coorad/bongpay.git
cd bongpay/server
```
### Setup environment variables

At the root directory and for each service, copy the example file:

```base
cp .env.example .env
```

Fill in database URLs, JWT secrets, and RabbitMQ connection strings.

### Start all services

```base
docker-compose up --build
```

BongPay will start all core microservices, the API Gateway, RabbitMQ, Redis, and PostgreSQL.


## Available Services

| Service              | Description                     | Port   |
| -------------------- | ------------------------------- | ------ |
| API Gateway          | Entry point for all requests    | `3000` |
| Identity Service     | User registration, login, roles | `3001` |
| Product Service      | Product CRUD                    | `3002` |
| Media Service        | Product media CRUD              | `3003` |
| Search Service       | Product search functionality    | `3004` |
| Cart Service         | Cart management                 | `3005` |
| Order Service        | Orders and status               | `3006` |
| Payment Service      | Payment logic and integration   | `3007` |
| Notification Service | Email/SMS notifications         | `3008` |


## License

BongPay is open-sourced under the MIT License — see the LICENSE
 file for details.
