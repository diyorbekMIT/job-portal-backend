const jwt = require('jsonwebtoken');
const {protect } = require('../middlewares/authMiddleware');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '30d'})
}

// @desc    Register a new user
exports.register = async (req, res) => {
    try{
        const {username, email, password, avatar, role} = req.body;
        if(!username || !email || !password) {
            return res.status(400).json({message: 'Please provide all fields'})
        }
        
        const userExists = await User.findOne({email});
        if(userExists) {
            return res.status(400).json({message: 'User already exists'})
        }
        const user = await User.create({username, email, password, avatar, role});
        if(user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                token: generateToken(user._id),
                companyName: user.companyName || '',
                companyDescription: user.companyDescription || '',
                companyLogo: user.companyLogo || '',
                resume: user.resume || ''
            })
        } else {
            res.status(400).json({message: 'Invalid user data'})
        }
    } catch(error) {
        console.error(error);
        res.status(500).json({message: 'Server error'})
    }
}

//@desc   Authenticate user & get token & Login
exports.login = async (req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({message: 'Please provide all fields'})
        }

        const user = User.findOne({email});
        if(!user || !(await user.mattchPassord(password))){
            res.status(400).json({message: 'Invalid email or password'})
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            token: generateToken(user._id),
            companyName: user.companyName || '',
            companyDescription: user.companyDescription || '',
            companyLogo: user.companyLogo || '',
            resume: user.resume || ''
        })
        
    } catch(error) {
        console.error(error);
        res.status(500).json({message: error.message})
    }
}

exports.getMe('/me', async (req, res) => {
    res.json(req.user);
})