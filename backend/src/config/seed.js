const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.User;

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@codingchannels.com',
      password: bcrypt.hashSync('admin123', 8),
      level: 'Expert',
      isAdmin: true
    });

    console.log('Admin user created successfully:', admin.username);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

module.exports = seedAdmin; 