const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Init Database
const db = initDB();

// Routes
app.use('/api/users', require('./routes/users')(db));
app.use('/api/schemes', require('./routes/schemes')(db));
app.use('/api/saved', require('./routes/savedSchemes')(db));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Scheme Hub API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Scheme Hub API running on http://localhost:${PORT}`);
  console.log(`📚 Endpoints:`);
  console.log(`   POST /api/users              - Create user profile`);
  console.log(`   POST /api/schemes/recommend  - Get recommendations`);
  console.log(`   GET  /api/schemes            - All schemes`);
  console.log(`   GET  /api/schemes/notifications - New scheme alerts`);
  console.log(`   GET  /api/saved/:userId      - User's saved schemes`);
  console.log(`   POST /api/saved              - Save a scheme`);
});
