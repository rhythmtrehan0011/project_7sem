const User = require('../models/authModel');

const signUpUser = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, email, password } = req.body;

        if (!firstName || !lastName || !phoneNumber || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const alreadySignedUp = await User.findOne({ email });
        if (alreadySignedUp) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ firstName, lastName, phoneNumber, email, password });
        await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });
    } catch (err) {
        console.log('Error in signUpUser:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { signUpUser };
