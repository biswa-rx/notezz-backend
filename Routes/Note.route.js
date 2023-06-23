const express = require('express');
const router = express.Router();

const NoteController = require('../Controllers/Note.controller');
const { verifyAccessToken } = require('../helpers/jwt_helper');

//Get a list of all products
router.get('/',verifyAccessToken , NoteController.gettingAllNotes);

//Create a new product
router.get('/:id',verifyAccessToken, NoteController.gettingANote);

//Get a product by id
router.post('/', NoteController.createNewNote);

//Update a product by id
router.patch('/:id', NoteController.updateANote);

//Delete a product by id
router.delete('/:id', NoteController.deleteANote);

module.exports = router;