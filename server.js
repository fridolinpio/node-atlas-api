import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import helmet from 'helmet';
const app = express();
app.use(helmet());
app.use(express.json({ limit: '20kb' }));
const PORT = Number(process.env.PORT || 3000);
const MONGODB_URI = process.env.MONGODB_URI;

app.get('/', (_req, res) => {
  res.send('Welcome to home page');
});

const itemSchema = new mongoose.Schema(
  { name: { type: String, required: true, trim: true } },
  { timestamps: true }
);
const Item = mongoose.model('Item', itemSchema);
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.post('/api/items', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'name is required' });
    const item = await Item.create({ name });
    res.status(201).json({ item });
  } catch (err) { next(err); }
});
app.get('/api/items', async (_req, res, next) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 }).limit(100);
    res.json({ items });
  } catch (err) { next(err); }
});
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
async function start() {
  if (MONGODB_URI) {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
  } else {
    console.log('MONGODB_URI not set; starting without database connection');
  }

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`API listening on 127.0.0.1:${PORT}`);
  });
}
start().catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});