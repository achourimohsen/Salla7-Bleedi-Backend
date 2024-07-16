const express = require('express');
const dbConnect = require('./config/config');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect to DB
dbConnect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000'
}));



// Routes
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/users', require('./routes/userRoute'));
app.use('/api/reports', require('./routes/reportRoute'));
app.use('/api/comments', require('./routes/commentRoute'));
app.use('/api/categories', require('./routes/categoriesRoute'));


// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Server Runner
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
