const userModel = require("../models/user");
const mongoose = require("mongoose");

module.exports.getUser = (req, res) => {
  return userModel
    .find({})
    .then((user) => {
      return res.status(200).send(user);
    })
    .catch((e) => {
      return res.status(500).send({ message: "Ошибка по умолчанию" });
    });
};

module.exports.getUserById = (req, res) => {
  const id = req.user._id;
  console.log(id);
  return userModel
    .findById(id)
    .then((user) => {
      if (user === null) {
        return res
          .status(404)
          .send({ message: " Пользователь по указанному _id не найден" });
      }

      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(400).send({ message: "Некорректный _id" });
      }
      return res.status(500).send({ message: "Ошибка по умолчанию" });
    });
};

module.exports.createUser = (req, res, next) => {
  const { name, about, avatar } = req.body;
  return userModel
    .create({ name, about, avatar })

    .then((user) => {
      return res.status(201).send(user);
    })
    .catch((e) => {
      console.log(e.name);
      if (e instanceof mongoose.Error.ValidationError) {
        res
          .status(400)
          .send({
            message: "Переданы некорректные данные при создании пользователя",
          });
        return next();
      }
      return res.status(500).send({ message: "Ошибка по умолчанию" });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;

  return userModel
    .findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true }
    )
    .then((user) => {
      return res.status(200).send(user);
    })
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        return res
          .status(400)
          .send({
            message: "Переданы некорректные данные при обновлении профиля",
          });
      }
      return res.status(500).send({ message: "Ошибка по умолчанию" });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  return userModel
    .findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true }
    )

    .then((user) => {
      return res.status(200).send(user);
    })
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        return res
          .status(400)
          .send({
            message: " Переданы некорректные данные при обновлении аватара",
          });
      }
      return res.status(500).send({ message: "Ошибка по умолчанию" });
    });
};
