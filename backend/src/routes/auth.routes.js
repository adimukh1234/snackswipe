const express = require('express');
const authControllers = require('../controllers/auth.controller');
const router = express.Router();

//User Routes
router.post('/user/register', authControllers.registerUser);
router.post('/user/login', authControllers.loginUser);
router.get('/user/logout', authControllers.logoutUser);

//Food Partner Routes
router.post('/foodpartner/register', authControllers.registerFoodpartner);
router.post('/foodpartner/login', authControllers.loginFoodpartner);
router.get('/foodpartner/logout', authControllers.logoutFoodpartner);

module.exports = router;