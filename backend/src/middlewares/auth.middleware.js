const FoodPartnerModel = require('../models/foodpartner.model');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function authenticateFoodPartner(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const foodPartner = await FoodPartnerModel.findById(decoded.id);
        if (!foodPartner) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.foodPartner = foodPartner;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

async function authenticateUser(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};



module.exports = { authenticateFoodPartner, authenticateUser };