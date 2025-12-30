const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'student@example.com';
    const password = 'password123';
    
    let user = await User.findOne({ email });
    
    if (user) {
      console.log('User already exists:', user.email);
    } else {
      user = new User({
        name: 'Test Student',
        email: email,
        password: password,
        role: 'student'
      });
      await user.save();
      console.log('Test student created:');
      console.log('Email:', email);
      console.log('Password:', password);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUser();
