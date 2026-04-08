// lib/auth-db.js
// User CRUD operations using Vercel KV (Redis)

const bcrypt = require('bcryptjs');
const { getKV } = require('./kv');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

async function createUser(email, password, name) {
  const store = await getKV();
  if (!store) throw new Error('Database unavailable');

  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already exists
  const existingId = await store.get(`user:email:${normalizedEmail}`);
  if (existingId) throw new Error('Email already registered');

  const id = generateId();
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    id,
    email: normalizedEmail,
    name: name.trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await store.set(`user:${id}`, JSON.stringify(user));
  await store.set(`user:email:${normalizedEmail}`, id);

  return { id, email: normalizedEmail, name: user.name };
}

async function getUserByEmail(email) {
  const store = await getKV();
  if (!store) return null;

  const normalizedEmail = email.toLowerCase().trim();
  const userId = await store.get(`user:email:${normalizedEmail}`);
  if (!userId) return null;

  const raw = await store.get(`user:${userId}`);
  if (!raw) return null;

  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function getUserById(id) {
  const store = await getKV();
  if (!store) return null;

  const raw = await store.get(`user:${id}`);
  if (!raw) return null;

  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

module.exports = { createUser, getUserByEmail, getUserById, verifyPassword };
