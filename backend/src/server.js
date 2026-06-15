import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import selfsigned from 'selfsigned';

import { createDbPool } from './db.js';
import {
  createJob,
  deleteJob,
  getAllJobs,
  getJobById,
  searchJobsByTitle,
  updateJob,
  canUserModifyJob,
} from './jobsRepo.js';
import {
  HttpError,
  parseIdParam,
  parseJobCreate,
  parseJobPatch,
} from './validateJob.js';
import {
  createInquiry,
  deleteInquiry,
  getAllInquiries,
  getInquiriesByJobId,
  getInquiryById,
  updateInquiry,
  getInquiriesByUserId,
  getInquiriesByApplicantId,
} from './inquiriesRepo.js';
import { parseInquiryCreate, parseInquiryPatch } from './validateInquiry.js';
import {
  getUserByEmail,
  getUserById,
  getAllUsers,
  createUser,
  getUserJobsByUserId,
  updateUser,
  deleteUser,
} from './usersRepo.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categoriesRepo.js';
import {
  getFavoritesByUserId,
  getFavoriteById,
  addFavorite,
  updateFavoriteNote,
  removeFavorite,
} from './favoritesRepo.js';
import {
  parseLoginData,
  parseRegisterData,
  parseUserUpdate,
} from './validateUser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load backend/.env regardless of current working directory
// (fixes: running nodemon from backend/src -> missing DB_PASSWORD)
const envPath = path.resolve(__dirname, '..', '.env');
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  dotenv.config();
}

const PORT = Number(process.env.PORT ?? 4953);
const HOST = process.env.HOST ?? '0.0.0.0';
const HTTP_PORT = Number(process.env.HTTP_PORT ?? 4952);
const ENABLE_HTTP = String(process.env.ENABLE_HTTP ?? '1') !== '0';

const DB_HOST = process.env.DB_HOST ?? 'localhost';
const DB_PORT = Number(process.env.DB_PORT ?? 3306);
const DB_USER = process.env.DB_USER ?? 'root';
const DB_PASSWORD = process.env.DB_PASSWORD ?? '';
const DB_NAME = process.env.DB_NAME ?? 'findseasonaljobs';

const app = express();
app.use(cors());
app.use(express.json());

let pool;
try {
  pool = await createDbPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
} catch (err) {
  console.error('❌ Failed to connect/init MySQL.');
  console.error('   - Create backend/.env (copy from backend/.env.example)');
  console.error('   - Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME');
  console.error('   - If your user cannot CREATE DATABASE, run backend/sql/init.sql manually');
  console.error('');
  console.error(err?.message ?? err);
  process.exit(1);
}

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Authentication routes

app.post('/auth/register', async (req, res, next) => {
  try {
    const input = parseRegisterData(req.body);

    // Check if email already exists
    const existing = await getUserByEmail(pool, input.email);
    if (existing) {
      res.status(409).json({ message: 'Email already registered.' });
      return;
    }

    const user = await createUser(pool, {
      email: input.email,
      password: input.password,
      fullName: input.fullName,
      role: 'user',
    });

    // Return user without password
    const { password: _p, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/login', async (req, res, next) => {
  try {
    const input = parseLoginData(req.body);

    const user = await getUserByEmail(pool, input.email);
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    // Simple password check (in production, use bcrypt!)
    if (user.password !== input.password) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

app.get('/auth/user/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const user = await getUserById(pool, id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

app.get('/auth/users', async (req, res, next) => {
  try {
    const userRole = req.headers['x-user-role'] ?? 'guest';
    if (userRole !== 'admin') {
      res.status(403).json({ message: 'Only admin can view all users.' });
      return;
    }
    const users = await getAllUsers(pool);
    res.json(users);
  } catch (err) {
    next(err);
  }
});

app.put('/auth/user/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const userId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
    const userRole = req.headers['x-user-role'] ?? 'guest';

    // Only user themselves or admin can update
    if (userRole !== 'admin' && userId !== id) {
      res.status(403).json({ message: 'You do not have permission to update this user.' });
      return;
    }

    const existing = await getUserById(pool, id);
    if (!existing) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const input = parseUserUpdate(req.body);
    const updated = await updateUser(pool, id, input);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/auth/user/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const userId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
    const userRole = req.headers['x-user-role'] ?? 'guest';

    // Only user themselves or admin can delete
    if (userRole !== 'admin' && userId !== id) {
      res.status(403).json({ message: 'You do not have permission to delete this user.' });
      return;
    }

    const existing = await getUserById(pool, id);
    if (!existing) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const ok = await deleteUser(pool, id);
    if (!ok) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    res.status(200).json({ message: 'User deleted successfully.', id });
  } catch (err) {
    next(err);
  }
});

app.get('/auth/user/:id/jobs', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const user = await getUserById(pool, id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    const jobs = await getUserJobsByUserId(pool, id);
    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

app.get('/inquiries/applicant/:userId', async (req, res, next) => {
  try {
    const userId = parseIdParam(req.params.userId);
    const inquiries = await getInquiriesByApplicantId(pool, userId);
    res.json(inquiries);
  } catch (err) {
    next(err);
  }
});

app.get('/inquiries/user/:userId', async (req, res, next) => {
  try {
    const userId = parseIdParam(req.params.userId);
    const inquiries = await getInquiriesByUserId(pool, userId);
    res.json(inquiries);
  } catch (err) {
    next(err);
  }
});

// Jobs routes

app.get('/jobs', async (req, res, next) => {
  try {
    const rawTitle = req.query?.title;
    const title = Array.isArray(rawTitle) ? rawTitle[0] : rawTitle;
    const jobs =
      typeof title === 'string' && title.trim().length
        ? await searchJobsByTitle(pool, title)
        : await getAllJobs(pool);
    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

app.get('/jobs/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const job = await getJobById(pool, id);
    if (!job) {
      res.status(404).json({ message: 'Job not found.' });
      return;
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
});

app.post('/jobs', async (req, res, next) => {
  try {
    const input = parseJobCreate(req.body);
    // Get userId from headers if provided
    const userId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
    const jobData = { ...input, userId };
    const created = await createJob(pool, jobData);
    res.status(201).set('Location', `/jobs/${created.id}`).json(created);
  } catch (err) {
    next(err);
  }
});

app.put('/jobs/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const userId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
    const userRole = req.headers['x-user-role'] ?? 'guest';

    const existing = await getJobById(pool, id);
    if (!existing) {
      res.status(404).json({ message: 'Job not found.' });
      return;
    }

    // Check permission
    if (userId) {
      const canModify = await canUserModifyJob(pool, id, userId, userRole);
      if (!canModify) {
        res.status(403).json({ message: 'You do not have permission to update this job.' });
        return;
      }
    }

    const patch = parseJobPatch(req.body);
    const nextJob = { ...existing, ...patch, id: existing.id };

    // Ensure required fields are still valid after merge
    const validated = parseJobCreate(nextJob);

    const updated = await updateJob(pool, id, validated);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/jobs/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const userId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
    const userRole = req.headers['x-user-role'] ?? 'guest';

    const existing = await getJobById(pool, id);
    if (!existing) {
      res.status(404).json({ message: 'Job not found.' });
      return;
    }

    // Check permission
    if (userId) {
      const canModify = await canUserModifyJob(pool, id, userId, userRole);
      if (!canModify) {
        res.status(403).json({ message: 'You do not have permission to delete this job.' });
        return;
      }
    }

    const ok = await deleteJob(pool, id);
    if (!ok) {
      res.status(404).json({ message: 'Job not found.' });
      return;
    }
    res.status(200).json({ message: 'Job deleted successfully.', id });
  } catch (err) {
    next(err);
  }
});

// Inquiries (Đăng ký quan tâm)

app.get('/inquiries', async (req, res, next) => {
  try {
    const rows = await getAllInquiries(pool);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.get('/inquiries/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const inquiry = await getInquiryById(pool, id);
    if (!inquiry) {
      res.status(404).json({ message: 'Inquiry not found.' });
      return;
    }
    res.json(inquiry);
  } catch (err) {
    next(err);
  }
});

app.post('/inquiries', async (req, res, next) => {
  try {
    const jobId = parseIdParam(req.body?.jobId);
    const job = await getJobById(pool, jobId);
    if (!job) {
      res.status(404).json({ message: 'Job not found.' });
      return;
    }

    const input = parseInquiryCreate(req.body);
    const created = await createInquiry(pool, { jobId, ...input });
    res
      .status(201)
      .set('Location', `/inquiries/${created.id}`)
      .json(created);
  } catch (err) {
    next(err);
  }
});

app.put('/inquiries/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    console.log(`[DEBUG] Updating inquiry ${id}, body:`, req.body);
    const existing = await getInquiryById(pool, id);
    if (!existing) {
      res.status(404).json({ message: 'Inquiry not found.' });
      return;
    }

    const patch = parseInquiryPatch(req.body);
    const nextInquiry = { ...existing, ...patch };
    const updated = await updateInquiry(pool, id, nextInquiry);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/inquiries/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const ok = await deleteInquiry(pool, id);
    if (!ok) {
      res.status(404).json({ message: 'Inquiry not found.' });
      return;
    }
    res.status(200).json({ message: 'Inquiry deleted successfully.', id });
  } catch (err) {
    next(err);
  }
});

// Nested: inquiries per job

app.get('/jobs/:id/inquiries', async (req, res, next) => {
  try {
    const jobId = parseIdParam(req.params.id);
    const job = await getJobById(pool, jobId);
    if (!job) {
      res.status(404).json({ message: 'Job not found.' });
      return;
    }

    const rows = await getInquiriesByJobId(pool, jobId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post('/jobs/:id/inquiries', async (req, res, next) => {
  try {
    const jobId = parseIdParam(req.params.id);
    const job = await getJobById(pool, jobId);
    if (!job) {
      res.status(404).json({ message: 'Job not found.' });
      return;
    }

    const input = parseInquiryCreate(req.body);
    const created = await createInquiry(pool, { jobId, ...input });
    res
      .status(201)
      .set('Location', `/inquiries/${created.id}`)
      .json(created);
  } catch (err) {
    next(err);
  }
});

// Categories routes

app.get('/categories', async (req, res, next) => {
  try {
    const rows = await getAllCategories(pool);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.get('/categories/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const category = await getCategoryById(pool, id);
    if (!category) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
});

app.post('/categories', async (req, res, next) => {
  try {
    const created = await createCategory(pool, req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put('/categories/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const updated = await updateCategory(pool, id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/categories/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const ok = await deleteCategory(pool, id);
    if (!ok) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }
    res.status(200).json({ message: 'Category deleted successfully.', id });
  } catch (err) {
    next(err);
  }
});

// Favorites routes

app.get('/favorites', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
    if (!userId) {
      res.status(401).json({ message: 'User ID is required in headers.' });
      return;
    }
    const rows = await getFavoritesByUserId(pool, userId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post('/favorites', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null;
    if (!userId) {
      res.status(401).json({ message: 'User ID is required in headers.' });
      return;
    }
    const jobId = parseIdParam(req.body.jobId);
    const created = await addFavorite(pool, userId, jobId, req.body.note);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put('/favorites/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const updated = await updateFavoriteNote(pool, id, req.body.note);
    if (!updated) {
      res.status(404).json({ message: 'Favorite not found.' });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/favorites/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const ok = await removeFavorite(pool, id);
    if (!ok) {
      res.status(404).json({ message: 'Favorite not found.' });
      return;
    }
    res.status(200).json({ message: 'Favorite removed successfully.', id });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

function ensureDevHttpsCert() {
  const certDir = path.resolve(__dirname, '..', 'certs');
  const keyPath = path.join(certDir, 'localhost.key');
  const certPath = path.join(certDir, 'localhost.crt');

  fs.mkdirSync(certDir, { recursive: true });

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, {
      days: 3650,
      keySize: 2048,
      algorithm: 'sha256',
      extensions: [
        {
          name: 'subjectAltName',
          altNames: [
            { type: 2, value: 'localhost' },
            { type: 7, ip: '127.0.0.1' },
          ],
        },
      ],
    });

    fs.writeFileSync(keyPath, pems.private);
    fs.writeFileSync(certPath, pems.cert);
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
}

const { key, cert } = ensureDevHttpsCert();

https.createServer({ key, cert }, app).listen(PORT, HOST, () => {
  console.log(`✅ Backend listening: https://localhost:${PORT}`);
  console.log(`   GET all jobs:     https://localhost:${PORT}/jobs`);
  console.log(`   GET one job:      https://localhost:${PORT}/jobs/1`);
});

if (ENABLE_HTTP) {
  http.createServer(app).listen(HTTP_PORT, HOST, () => {
    console.log(`ℹ️  HTTP fallback:    http://localhost:${HTTP_PORT}`);
    console.log(`   GET all jobs:     http://localhost:${HTTP_PORT}/jobs`);
  });
}
