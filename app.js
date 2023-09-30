require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const httpStatus = require('http-status-codes').StatusCodes;
const CardsRouter = require('./routes/cards');
const UsersRouter = require('./routes/users');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const { validateUser, validateLogin } = require('./middlewares/validation');

const { PORT = 3000 } = process.env;

const app = express();

app.use(helmet());

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(express.json());
app.get('/', (req, res) => {
  res.status(httpStatus.OK).send('Hello World!');
});

app.post('/signin', validateLogin, login);
app.post('/signup', validateUser, createUser);

app.use('/', auth, CardsRouter);
app.use('/', auth, UsersRouter);

app.use('/*', (res) => {
  res.status(httpStatus.NOT_FOUND).send({ message: 'Страница не найдена' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
