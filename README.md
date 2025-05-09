# Open Crypto DAO

A decentralized autonomous organization (DAO) web platform built with modern JavaScript technologies.

## Features

- User authentication with email/password and crypto wallet verification
- Proposal creation and management
- Voting system with real-time updates
- Multi-chain support (Ethereum and Solana)

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **WebSockets**: Real-time vote updates
- **Containerization**: Docker, Nginx for routing

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and adjust values
3. Run `docker-compose up -d`
4. Access the application at http://localhost

## Development

### Prerequisites

- Node.js 16+
- Docker and Docker Compose
- PostgreSQL (if running locally)

### Running Locally

```bash
# Start database
docker-compose up -d db

# Start backend
cd backend
npm install
npm start

# Start frontend
cd frontend
npm install
npm run dev

# Start WebSocket server
cd websocket-server
npm install
npm start
```

## API Endpoints

- `POST /signup` - Register a new user
- `POST /login` - Authenticate user
- `POST /proposal` - Create new proposal
- `POST /vote` - Cast a vote on a proposal

## License

MIT

---

## 🌐 Live Preview
Accessible after deployment on DigitalOcean droplet at: `http://<your-server-ip>`

---

## 🧩 Project Structure
```
open-crypto-dao/
├── backend/                # Express API (Auth, Proposals, Voting)
├── frontend/               # Next.js frontend (DAO Interface)
├── websocket-server/       # WebSocket broadcast server (Real-time vote updates)
├── nginx/                  # Nginx reverse proxy config
├── docker-compose.yml      # Multi-service orchestration
└── README.md
```

---

## 🚀 Setup Instructions

### 1. Clone & Configure
```bash
git clone https://github.com/o-c-foundation/open-crypto-foundation
cd open-crypto-foundation
cp .env.example .env
# Update secrets, DB URI, and endpoints
```

### 2. Start Services
```bash
docker-compose up --build
```

---

## 🧠 Contributors
Built and maintained by the Open Crypto Foundation core team. Contributions are welcome!

---

## 📫 Stay Connected
- 🌐 [Main Site](https://opencryptofoundation.com)
- 🧑‍💻 [GitHub](https://github.com/o-c-foundation)
- 💬 [Discord](https://discord.gg/YOUR-INVITE)
- 🐦 [X (Twitter)](https://twitter.com/opencryptofdn)
