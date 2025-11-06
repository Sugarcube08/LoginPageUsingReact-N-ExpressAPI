const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const notebookController = require('../controllers/notebookController');
const pageController = require('../controllers/pageController');

router.post('/', notebookController.createNotebook);

router.get('/', notebookController.getNotebooks);

router.delete('/:notebookId', notebookController.deleteNotebook);

router.get('/:notebookId', notebookController.getNotebook);

router.put('/:notebookId', notebookController.updateNotebook);

router.post('/:notebookId/section', sectionController.createSection);

router.put('/:notebookId/section/:sectionId', sectionController.updateSection);

router.delete('/:notebookId/section/:sectionId', sectionController.deleteSection);

router.post('/:notebookId/page', pageController.createPage);

router.put('/:notebookId/page/:pageId', pageController.updatePage);

router.delete('/:notebookId/page/:pageId', pageController.deletePage);

module.exports = router;