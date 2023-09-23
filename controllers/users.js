const mongoose = require('mongoose');
const httpStatus = require('http-status-codes').StatusCodes;
const userModel = require('../models/user');

module.exports.getUser = (req, res) => userModel
  .find({})
  .then((user) => res.status(httpStatus.OK).send(user))
  .catch(() => res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' }));

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;
  return userModel
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
        return res.status(httpStatus.BAD_REQUEST).send({ message: 'Передан некорректный id' });
      }
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  return userModel
    .create({ name, about, avatar })

    .then((user) => res.status(httpStatus.CREATED).send(user))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        res
          .status(httpStatus.BAD_REQUEST)
          .send({
            message: 'Переданы некорректные данные при создании пользователя',
          });
      }
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;

  return userModel
    .findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    )
    .then((user) => res.status(httpStatus.OK).send(user))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .send({
            message: 'Переданы некорректные данные при обновлении профиля',
          });
      }
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  return userModel
    .findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    )

    .then((user) => res.status(httpStatus.OK).send(user))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .send({
            message: ' Переданы некорректные данные при обновлении аватара',
          });
      }
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
    });
};
