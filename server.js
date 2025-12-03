const express = require('express');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL client
const pgClient = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres'
});

pgClient.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('✓ Connected to PostgreSQL');
});

// Middleware
app.use(express.static('public'));
app.use(express.json());

// API Routes

// Get latest sensor readings
app.get('/api/sensors/latest', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT ON (sensorID) 
        sensorID, 
        timestamp, 
        sensor_reading, 
        alarm, 
        created_at
      FROM sensor_data
      ORDER BY sensorID, created_at DESC;
    `;
    const result = await pgClient.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching latest readings:', error);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

// Get alarm history
app.get('/api/alarms', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        sensorID, 
        timestamp, 
        sensor_reading, 
        alarm, 
        created_at
      FROM sensor_data
      WHERE alarm = 1
      ORDER BY created_at DESC
      LIMIT 100;
    `;
    const result = await pgClient.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching alarms:', error);
    res.status(500).json({ error: 'Failed to fetch alarms' });
  }
});

// Serve index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✓ Dashboard running on http://localhost:${PORT}`);
});
