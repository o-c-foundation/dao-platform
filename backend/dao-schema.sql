CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  eth_wallet TEXT,
  sol_wallet TEXT,
  wallet_verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE proposals (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  status TEXT CHECK (status IN ('active', 'past', 'pending')) NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
  vote_option TEXT NOT NULL,
  UNIQUE(user_id, proposal_id)
); 