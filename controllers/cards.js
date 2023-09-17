const cardModel = require('../models/card');

module.exports.getCard = (req, res) => cardModel
  .find({})
  .then((cards) => res.status(200).send(cards))
  .catch(() => res.status(500).send({ message: 'Ошибка по умолчанию.' }));

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const id = req.user._id;

  return cardModel
    .create({ name, link, id })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании карточки' });
      } else {
        res.status(500).send({ message: 'Ошибка по умолчанию.' });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  return cardModel
    .findByIdAndDelete(cardId)
    .then((card) => {
      if (!card) {
        return res
          .status(404)
          .send({ message: ' Карточка с указанным id не найдена' });
      }
      return res.status(200).send(card);
    })
    .catch(() => res.status(500).send({ message: 'Ошибка по умолчанию.' }));
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  return cardModel
    .findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
    .then((card) => {
      if (!card) {
        return res
          .status(404)
          .send({ message: 'Передан несуществующий _id карточки' });
      }
      return res.status(200).send(card);
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        return res
          .status(400)
          .send({
            message: 'Переданы некорректные данные для постановки/снятии лайка',
          });
      }
      return res.status(500).send({ message: 'Ошибка по умолчанию.' });
    });
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  return cardModel
    .findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
    .then((card) => {
      if (!card) {
        return res
          .status(404)
          .send({ message: 'Передан несуществующий _id карточки' });
      }
      return res.status(200).send(card);
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        return res
          .status(400)
          .send({
            message: 'Переданы некорректные данные для постановки/снятии лайка',
          });
      }
      return res.status(500).send({ message: 'Ошибка по умолчанию' });
    });
};
