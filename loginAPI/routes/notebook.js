const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const notebookController = require('../controllers/notebookController');
const pageController = require('../controllers/pageController');

router.post('/', notebookController.createNotebook);

router.get('/', notebookController.getNotebooks);

router.get('/:notebookId', notebookController.getNotebook);

router.post('/:notebookId/section', sectionController.createSection);

router.post('/:notebookId/page', pageController.createPage);

module.exports = router;