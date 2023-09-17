const mongoose = require("mongoose");
const cardModel = require("../models/card");

module.exports.getCard = (req, res) => {
  return cardModel
    .find({})
    .then((user) => {
      return res.status(200).send(user);
    })
    .catch((e) => {
      return res.status(500).send({ message: "Ошибка по умолчанию." });
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const id = req.user._id;

  console.log(id);

  return cardModel
    .create({ name, link, owner: id })
    .then((user) => {
      return res.status(201).send(user);
    })
    .catch((e) => {
      return res.status(500).send({ message: "Ошибка по умолчанию." });
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  console.log(cardId);
  
  return cardModel
    .findByIdAndDelete(cardId)
    .then((user) => {
      if (user === null) {
        return res
          .status(404)
          .send({ message: " Карточка с указанным _id не найдена" });
      }
      return res.status(200).send(user);
    })
    .catch(() => {
      return res.status(500).send({ message: "Ошибка по умолчанию." });
    });
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  return cardModel
    .findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
    .then((user) => {
      if (user === null) {
        return res
          .status(404)
          .send({ message: "Передан несуществующий _id карточки" });
      }
      return res.status(200).send(user);
    })
    .catch((e) => {
      console.log(e.name);
      if (e.name === "CastError") {
        return res
          .status(400)
          .send({
            message: "Переданы некорректные данные для постановки/снятии лайка",
          });
      }
      return res.status(500).send({ message: "Ошибка по умолчанию." });
    });
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  return cardModel
    .findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
    .then((user) => {
      if (user === null) {
        return res
          .status(404)
          .send({ message: "Передан несуществующий _id карточки" });
      }
      return res.status(200).send(user);
    })
    .catch((e) => {
      console.log(e.name);
      if (e.name === "CastError") {
        return res
          .status(400)
          .send({
            message: "Переданы некорректные данные для постановки/снятии лайка",
          });
      }
      return res.status(500).send({ message: "Ошибка по умолчанию" });
    });
};
