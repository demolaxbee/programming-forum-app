const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const channelRoutes = require('./routes/channel.routes');
const messageRoutes = require('./routes/message.routes');
const replyRoutes = require('./routes/reply.routes');
const searchRoutes = require('./routes/search.routes');
const userRoutes = require('./routes/user.routes');

// Import seed function
const seedAdmin = require('./config/seed');

// Database connection
const db = require('./models');

// Create Express app
const app = express();

// Serve the uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Set middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// // Serve the uploads folder statically
// app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


// Set up API routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Coding Channels API' });
});

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Define port
const PORT = process.env.PORT || 5000;

// Sync database and seed admin user
db.sequelize.sync().then(() => {
  console.log('Database synced');
  seedAdmin();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 