const pgp = require('pg-promise')();
const db = pgp(process.env.DATABASE_URL || 'postgres://ocfdao:strongpassword@localhost:5432/dao');

module.exports = {
  insertUser: ({ email, username, password_hash, eth_wallet, sol_wallet }) =>
    db.none(`INSERT INTO users(email, username, password_hash, eth_wallet, sol_wallet, wallet_verified)
             VALUES($1, $2, $3, $4, $5, false)`,
            [email, username, password_hash, eth_wallet, sol_wallet]),

  getUserByUsername: (username) =>
    db.oneOrNone(`SELECT * FROM users WHERE username = $1`, [username]),

  getUserById: (id) =>
    db.oneOrNone(`SELECT * FROM users WHERE id = $1`, [id]),

  verifyWallet: (userId) =>
    db.none(`UPDATE users SET wallet_verified = true WHERE id = $1`, [userId]),

  insertProposal: ({ title, description, category, options, status, created_by }) =>
    db.none(`INSERT INTO proposals(title, description, category, status, created_by)
             VALUES($1, $2, $3, $4, $5)`,
            [title, description, category, status, created_by]),

  insertVote: ({ user_id, proposal_id, vote_option }) =>
    db.none(`INSERT INTO votes(user_id, proposal_id, vote_option)
             VALUES($1, $2, $3)`, [user_id, proposal_id, vote_option]),

  hasVoted: (user_id, proposal_id) =>
    db.oneOrNone(`SELECT 1 FROM votes WHERE user_id = $1 AND proposal_id = $2`, [user_id, proposal_id])
}; 