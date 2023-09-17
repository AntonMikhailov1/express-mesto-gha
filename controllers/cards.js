const cardModel = require('../models/card');

module.exports.getCard = (req, res) => cardModel
  .find({})
  .then((cards) => res.status(200).send(cards))
  .catch(() => res.status(500).send({ message: 'Ошибка по умолчанию.' }));

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  return cardModel
    .create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные при создании карточки' });
      }
      return res.status(500).send({ message: 'Ошибка по умолчанию.' });
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  return cardModel
    .findById(cardId)
    .then((card) => {
      if (!card) {
        return res
          .status(404)
          .send({ message: ' Карточка с указанным id не найдена' });
      }
      return card.remove().then(() => res.status(200).send({ message: 'Карточка удалена' }));
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
          .send({ message: 'Передан несуществующий id карточки' });
      }
      return res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .status(400)
          .send({
            message: 'Переданы некорректные данные для постановки/снятия лайка',
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
          .send({ message: 'Передан несуществующий id карточки' });
      }
      return res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .status(400)
          .send({
            message: 'Переданы некорректные данные для постановки/снятия лайка',
          });
      }
      return res.status(500).send({ message: 'Ошибка по умолчанию' });
    });
};
