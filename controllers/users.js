const mongoose = require('mongoose');
const userModel = require('../models/user');

module.exports.getUser = (req, res) => userModel
  .find({})
  .then((user) => res.status(200).send(user))
  .catch(() => res.status(500).send({ message: 'Ошибка по умолчанию' }));

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;
  return userModel
    .findById(userId)
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .send({ message: ' Пользователь по указанному id не найден' });
      }
      return res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Передан некорректный id' });
      }
      return res.status(500).send({ message: 'Ошибка по умолчанию' });
    });
};

module.exports.createUser = (req, res, next) => {
  const { name, about, avatar } = req.body;
  return userModel
    .create({ name, about, avatar })

    .then((user) => res.status(201).send(user))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        res
          .status(400)
          .send({
            message: 'Переданы некорректные данные при создании пользователя',
          });
        return next();
      }
      return res.status(500).send({ message: 'Ошибка по умолчанию' });
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
    .then((user) => res.status(200).send(user))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        return res
          .status(400)
          .send({
            message: 'Переданы некорректные данные при обновлении профиля',
          });
      }
      return res.status(500).send({ message: 'Ошибка по умолчанию' });
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

    .then((user) => res.status(200).send(user))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        return res
          .status(400)
          .send({
            message: ' Переданы некорректные данные при обновлении аватара',
          });
      }
      return res.status(500).send({ message: 'Ошибка по умолчанию' });
    });
};
