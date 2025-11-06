const express = require('express');
const router = express.Router();    
const foodController = require('../controllers/food.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');

const upload= multer({
    storage: multer.memoryStorage(),
})

router.post('/', authMiddleware.authenticateFoodPartner, upload.single('video'), foodController.createFood);

router.get('/', authMiddleware.authenticateUser, foodController.getAllFoodItems);


module.exports = router;