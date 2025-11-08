const express = require('express');
const {
  createWord,
  listWords,
  getWord,
  updateWord,
  deleteWord,
  translate
} = require('../controllers/words.controller');

const router = express.Router();

// CRUD
router.post('/', createWord);        // Crear
router.get('/', listWords);          // Listar
router.get('/:id', getWord);         // Obtener por id
router.put('/:id', updateWord);      // Actualizar
router.delete('/:id', deleteWord);   // Eliminar

// Acciones
router.get('/_actions/translate', translate);

module.exports = router;
