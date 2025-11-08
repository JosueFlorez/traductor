const { getPool } = require('../db');

// Validaciones
function assertString(value, name) {
  if (typeof value !== 'string' || !value.trim()) {
    const e = new Error(`Campo '${name}' es requerido y debe ser texto no vacío`);
    e.status = 400;
    throw e;
  }
}
function assertLang(value) {
  const ok = value === 'es' || value === 'en';
  if (!ok) {
    const e = new Error("source_lang debe ser 'es' o 'en'");
    e.status = 400;
    throw e;
  }
}

// CREATE
async function createWord(req, res, next) {
  try {
    const { source_lang, source_text, target_text } = req.body;
    assertLang(source_lang);
    assertString(source_text, 'source_text');
    assertString(target_text, 'target_text');

    const pool = await getPool();
    const sql = `
      INSERT INTO words (source_lang, source_text, target_text)
      VALUES (?, ?, ?)
    `;
    await pool.execute(sql, [source_lang.trim(), source_text.trim(), target_text.trim()]);
    res.status(201).json({ ok: true, message: 'Creado' });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      err.status = 409;
      err.message = 'Ya existe esa palabra para ese idioma';
    }
    next(err);
  }
}

// LIST
async function listWords(req, res, next) {
  try {
    const { lang, q } = req.query;
    const pool = await getPool();
    let sql = 'SELECT id, source_lang, source_text, target_text, created_at, updated_at FROM words';
    const args = [];
    const where = [];

    if (lang) {
      if (lang !== 'es' && lang !== 'en') {
        const e = new Error("lang debe ser 'es' o 'en'");
        e.status = 400;
        throw e;
      }
      where.push('source_lang = ?');
      args.push(lang);
    }
    if (q) {
      where.push('(source_text LIKE ? OR target_text LIKE ?)');
      args.push(`%${q}%`, `%${q}%`);
    }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY updated_at DESC, id DESC';

    const [rows] = await pool.query(sql, args);
    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// READ by id
async function getWord(req, res, next) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const [rows] = await pool.query(
      'SELECT id, source_lang, source_text, target_text, created_at, updated_at FROM words WHERE id = ?',
      [id]
    );
    if (!rows.length) {
      const e = new Error('No encontrado');
      e.status = 404;
      throw e;
    }
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// UPDATE
async function updateWord(req, res, next) {
  try {
    const { id } = req.params;
    const { source_lang, source_text, target_text } = req.body;

    if (source_lang !== undefined) assertLang(source_lang);
    if (source_text !== undefined) assertString(source_text, 'source_text');
    if (target_text !== undefined) assertString(target_text, 'target_text');

    const pool = await getPool();

    const [currentRows] = await pool.query('SELECT * FROM words WHERE id = ?', [id]);
    if (!currentRows.length) {
      const e = new Error('No encontrado');
      e.status = 404;
      throw e;
    }
    const current = currentRows[0];

    const newLang = source_lang ?? current.source_lang;
    const newSource = (source_text ?? current.source_text).trim();
    const newTarget = (target_text ?? current.target_text).trim();

    const sql = `
      UPDATE words
      SET source_lang = ?, source_text = ?, target_text = ?
      WHERE id = ?
    `;
    await pool.execute(sql, [newLang, newSource, newTarget, id]);

    res.json({ ok: true, message: 'Actualizado' });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      err.status = 409;
      err.message = 'Ya existe esa palabra para ese idioma';
    }
    next(err);
  }
}

// DELETE
async function deleteWord(req, res, next) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const [result] = await pool.execute('DELETE FROM words WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      const e = new Error('No encontrado');
      e.status = 404;
      throw e;
    }
    res.json({ ok: true, message: 'Eliminado' });
  } catch (err) {
    next(err);
  }
}

// TRANSLATE ?text=...&from=es&to=en
async function translate(req, res, next) {
  try {
    const { text, from, to } = req.query;

    assertString(text, 'text');

    if (!(from === 'es' || from === 'en')) {
      const e = new Error("from debe ser 'es' o 'en'");
      e.status = 400;
      throw e;
    }
    if (!(to === 'es' || to === 'en')) {
      const e = new Error("to debe ser 'es' o 'en'");
      e.status = 400;
      throw e;
    }
    if (from === to) {
      const e = new Error('from y to no pueden ser iguales');
      e.status = 400;
      throw e;
    }

    const pool = await getPool();
    const t = text.trim();

    // 1) directa
    const [direct] = await pool.query(
      'SELECT target_text FROM words WHERE source_lang = ? AND source_text = ? LIMIT 1',
      [from, t]
    );
    if (direct.length) {
      return res.json({ ok: true, translation: direct[0].target_text });
    }

    // 2) inversa (por si solo cargaste un sentido)
    const [reverse] = await pool.query(
      'SELECT source_text, target_text, source_lang FROM words WHERE target_text = ? LIMIT 1',
      [t]
    );
    if (reverse.length) {
      const row = reverse[0];
      if (from === 'en' && to === 'es' && row.source_lang === 'es') {
        return res.json({ ok: true, translation: row.source_text });
      }
      if (from === 'es' && to === 'en' && row.source_lang === 'es') {
        return res.json({ ok: true, translation: row.target_text });
      }
    }

    res.status(404).json({ ok: false, error: 'No se encontró traducción' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createWord,
  listWords,
  getWord,
  updateWord,
  deleteWord,
  translate
};
