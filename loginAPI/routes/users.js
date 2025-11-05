const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const notebookController = require('../controllers/notebookController');

// Public routes
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to the API!',
    timestamp: new Date().toISOString()
  });
});

router.get('/dashboard', apiController.getUsers);

router.get('/user', apiController.getUser);

router.delete('/user', apiController.deleteUser);

router.post('/user', apiController.updateUser);

router.post('/password', apiController.updatePassword);

router.post('/notebook', notebookController.createNotebook);

router.get('/notebook', notebookController.getNotebooks);

module.exports = router;
