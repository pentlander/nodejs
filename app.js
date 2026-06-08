const express = require('express');
const path = require('path');
const indexRouter = require('./routes/index');
const itemsRouter = require('./routes/items');
const syncRouter = require('./routes/sync');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Use the router for handling routes
app.use('/', indexRouter);
app.use('/api/items', itemsRouter);
app.use('/api/sync', syncRouter);

// Catch-all route for handling 404 errors
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Initialize DB (non-fatal) then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
});
