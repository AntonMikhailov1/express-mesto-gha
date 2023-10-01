require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errors } = require('celebrate');
const httpStatus = require('http-status-codes').StatusCodes;
const CardsRouter = require('./routes/cards');
const UsersRouter = require('./routes/users');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const NotFoundError = require('./errors/NotFoundError');
const { validateUser, validateLogin } = require('./middlewares/validation');

const { PORT = 3000 } = process.env;

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Слишком много запросов',
});

app.use(express.json());
app.use(limiter);

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.get('/', (req, res) => {
  res.status(httpStatus.OK).send('Hello World!');
});

app.post('/signin', validateLogin, login);
app.post('/signup', validateUser, createUser);

app.use(auth);

app.use('/', CardsRouter);
app.use('/', UsersRouter);

app.use('/*', () => {
  throw new NotFoundError('Страница не найдена');
});

app.use(errors());

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send(err.message);
    return;
  }
  res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: `Ошибка по умолчанию: ${err.message}` });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
