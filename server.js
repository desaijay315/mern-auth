const express = require('express');
const connectDB = require('./config/db');
const app = express();
const authRoute = require('./routes/api/auth');
const postsRoute = require('./routes/api/posts');
const usersRoute = require('./routes/api/users');
const profileRoute = require('./routes/api/profile');

//Connect database
connectDB();
app.get('/', (req, res) => {
  res.send('API is runining');
});

app.use(express.json({ extended: true }));
//routes

app.use('/api/users', usersRoute);
app.use('/api/posts', postsRoute);
app.use('/api/auth', authRoute);
app.use('/api/profile', profileRoute);

const PORT = process.env.port || 5001;

app.listen(PORT, () => {
  console.log(`express is workign on port ${PORT}`);
});
