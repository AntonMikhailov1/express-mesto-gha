const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status-codes').StatusCodes;
const User = require('../models/user');

module.exports.getUser = (req, res) => User
  .find({})
  .then((user) => res.status(httpStatus.OK).send(user))
  .catch(() => res
    .status(httpStatus.INTERNAL_SERVER_ERROR)
    .send({ message: 'Ошибка по умолчанию' }));

module.exports.getCurrentUser = (req, res) => {
  const currentUserId = req.user._id;

  User
    .findById(currentUserId)
    .then((user) => {
      if (!user) {
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ message: ' Пользователь по указанному id не найден' });
      }
      res.status(httpStatus.OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .status(httpStatus.BAD_REQUEST)
          .send({ message: 'Передан некорректный id' });
      }
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: 'Ошибка по умолчанию' });
    });
};

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;

  return User
    .findById(userId)
    .then((user) => {
      if (!user) {
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ message: ' Пользователь по указанному id не найден' });
      }
      return res.status(httpStatus.OK).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .status(httpStatus.BAD_REQUEST)
          .send({ message: 'Передан некорректный id' });
      }
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: 'Ошибка по умолчанию' });
    });
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt
    .hash(password, 8)
    .then((hash) => {
      User
        .create({
          name, about, avatar, email, password: hash,
        })
        .then(() => res
          .status(httpStatus.CREATED)
          .send({
            data: {
              name, about, avatar, email,
            },
          }));
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(httpStatus.UNAUTHORIZED).send({
          message: 'Пользователь с таким email уже существует',
        });
      }
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(httpStatus.BAD_REQUEST).send({
          message: 'Переданы некорректные данные при создании пользователя',
        });
      }
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: 'Ошибка по умолчанию' });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;

  return User
    .findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    )
    .then((user) => res.status(httpStatus.OK).send(user))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        return res.status(httpStatus.BAD_REQUEST).send({
          message: 'Переданы некорректные данные при обновлении профиля',
        });
      }
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: 'Ошибка по умолчанию' });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  return User
    .findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    )

    .then((user) => res.status(httpStatus.OK).send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(httpStatus.BAD_REQUEST).send({
          message: 'Переданы некорректные данные при обновлении аватара',
        });
      }
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: 'Ошибка по умолчанию' });
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, { expiresIn: '7d' });

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      });
    })
    .catch((err) => {
      res.status(httpStatus.UNAUTHORIZED).send({ message: err.message });
    });
};
