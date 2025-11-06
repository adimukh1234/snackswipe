const userModel = require('../models/user.model');
const FoodPartnerModel = require('../models/foodpartner.model')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');




async function registerUser(req, res) {
    try {
        const { fullname, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            fullname,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign({
            id: newUser._id,
        }, process.env.JWT_SECRET);

        res.cookie('token', token);



        res.status(201).json({ message: 'User registered successfully', user: {
            id: newUser._id,
            fullname: newUser.fullname,
            email: newUser.email,
        } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

async function loginUser(req, res) {
    // Implementation for user login
    const { email, password } = req.body;
    
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({
            id: user._id,
        }, process.env.JWT_SECRET);

        res.cookie('token', token);

        res.status(200).json({ message: 'Login successful', user: {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
        } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

function logoutUser(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
}


async function registerFoodpartner(req, res) {
    try {
        const { name, address, contactNumber, email, cuisineType, password } = req.body;

        // Check if food partner already exists
        const existingPartner = await FoodPartnerModel.findOne({ email });
        if (existingPartner) {
            return res.status(400).json({ message: 'Food Partner already exists' });
        }
        
        // Create new food partner
        const hashedPassword = await bcrypt.hash(password, 10);

        const newPartner = await FoodPartnerModel.create({
            name,
            address,
            contactNumber,
            email,
            cuisineType,
            password: hashedPassword,
        });

        const token = jwt.sign({
            id: newPartner._id,
        }, process.env.JWT_SECRET);

        res.cookie('token', token);

        res.status(201).json({ message: 'Food Partner registered successfully', partner: {
            id: newPartner._id,
            name: newPartner.name,
            email: newPartner.email,
        } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


async function loginFoodpartner(req, res) {
    // Implementation for food partner login
    const { email, password } = req.body;
    
    try {
        const partner = await FoodPartnerModel.findOne({ email });
        if (!partner) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, partner.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({
            id: partner._id,
        }, process.env.JWT_SECRET);

        res.cookie('token', token);

        res.status(200).json({ message: 'Login successful', partner: {
            id: partner._id,
            name: partner.name,
            email: partner.email,
        } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


async function logoutFoodpartner(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
}   

module.exports = {
    registerUser,
    loginUser,
    registerFoodpartner,
    loginFoodpartner,
    logoutUser,
    logoutFoodpartner
};
