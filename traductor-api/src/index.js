require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getPool } = require('./db');
const { errorHandler } = require('./middlewares/errorHandler'); // <- solo esta vez

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/health', (req, res) => res.json({ ok: true, message: 'API up' }));
app.get('/db-check', async (req, res, next) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, db: rows[0] });
  } catch (err) { next(err); }
});

// Rutas
const wordsRouter = require('./routes/words');
app.use('/words', wordsRouter);

// /translate a nivel raíz (opcional)
const { translate } = require('./controllers/words.controller');
app.get('/translate', translate);

// Error handler (SIEMPRE el último)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
