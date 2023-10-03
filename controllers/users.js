/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status-codes').StatusCodes;
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUser = (req, res, next) => {
  User.find({})
    .then((user) => res.status(httpStatus.OK).send(user))
    .catch(next);
};
const getCurrentUser = (req, res, next) => {
  const currentUserId = req.user._id;

  User.findById(currentUserId)
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        throw new NotFoundError({ message: 'Пользователь по указанному id не найден' });
      }
      res.status(httpStatus.OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(BadRequestError({ message: 'Переданы некорректные данные' }));
      } else next(err);
    });
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError({ message: 'Пользователь по указанному id не найден' });
      }
      return res.status(httpStatus.OK).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError({ message: 'Переданы некорректные данные' }));
      } else next(err);
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      User
        .create({
          name,
          about,
          avatar,
          email,
          password: hash,
        })
        .then((user) => res.status(httpStatus.CREATED).send({
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          email: user.email,
          _id: user._id,
        }))
        // eslint-disable-next-line consistent-return
        .catch((err) => {
          if (err.code === 11000) {
            return next(
              new ConflictError({ message: 'Пользователь с таким email уже существует' }),
            );
          }
          if (err instanceof mongoose.Error.ValidationError) {
            return next(
              new BadRequestError(
                { message: 'Переданы некоректные данные при создании пользователя' },
              ),
            );
          }
          next(err);
        });
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError({ message: 'Пользователь не найден' });
      }
      res.status(httpStatus.OK).send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(
          { message: 'Переданы некорректные данные при обновлении пофиля' },
        ));
      }
      next(err);
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(httpStatus.OK).send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(
          { message: 'Переданы некорректные данные при обновлении пофиля' },
        ));
      }
      next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      })
        .send({ message: 'Авторизация прошла успешно' });
    })
    .catch(next);
};

module.exports = {
  getUser,
  getCurrentUser,
  getUserById,
  createUser,
  updateUser,
  updateAvatar,
  login,
};
