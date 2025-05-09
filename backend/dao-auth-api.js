// Express API for DAO Web App with Auth & Wallet Verification
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ethers } = require('ethers');
const bodyParser = require('body-parser');
const db = require('./dao-db');

const app = express();
app.use(bodyParser.json());
const SECRET = process.env.JWT_SECRET || 'replace_with_secure_secret';

app.post('/signup', async (req, res) => {
  const { email, username, password, eth_wallet, sol_wallet } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await db.insertUser({ email, username, password_hash: hashed, eth_wallet, sol_wallet });
  res.send({ message: 'User registered' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.getUserByUsername(username);
  if (user && await bcrypt.compare(password, user.password_hash)) {
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });
    res.send({ token });
  } else {
    res.status(401).send({ error: 'Invalid credentials' });
  }
});

const nonceMap = new Map();
app.get('/wallet/nonce/:userId', (req, res) => {
  const nonce = Math.floor(Math.random() * 1e6).toString();
  nonceMap.set(req.params.userId, nonce);
  res.send({ nonce });
});

app.post('/wallet/verify', async (req, res) => {
  const { userId, signature, address } = req.body;
  const nonce = nonceMap.get(userId);
  const signerAddr = ethers.utils.verifyMessage(nonce, signature);
  if (signerAddr.toLowerCase() === address.toLowerCase()) {
    await db.verifyWallet(userId);
    res.send({ verified: true });
  } else {
    res.status(400).send({ verified: false });
  }
});

app.post('/proposal', async (req, res) => {
  const { token, title, description, category, options } = req.body;
  try {
    const decoded = jwt.verify(token, SECRET);
    await db.insertProposal({ title, description, category, options, status: 'pending', created_by: decoded.id });
    res.send({ message: 'Proposal submitted' });
  } catch {
    res.status(401).send({ error: 'Unauthorized' });
  }
});

app.post('/vote', async (req, res) => {
  const { token, proposal_id, vote_option } = req.body;
  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await db.getUserById(decoded.id);
    if (!user.wallet_verified) return res.status(403).send({ error: 'Wallet not verified' });
    const voted = await db.hasVoted(decoded.id, proposal_id);
    if (voted) return res.status(400).send({ error: 'Already voted' });
    await db.insertVote({ user_id: decoded.id, proposal_id, vote_option });
    res.send({ message: 'Vote casted' });
  } catch {
    res.status(401).send({ error: 'Unauthorized' });
  }
});

app.listen(3001, () => console.log('API running on http://localhost:3001')); 