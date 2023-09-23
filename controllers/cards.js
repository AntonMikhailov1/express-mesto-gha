const httpStatus = require('http-status-codes').StatusCodes;
const cardModel = require('../models/card');

module.exports.getCard = (req, res) => cardModel
  .find({})
  .then((cards) => res.status(httpStatus.OK).send(cards))
  .catch(() => res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' }));

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  return cardModel
    .create({ name, link, owner })
    .then((card) => res.status(httpStatus.CREATED).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(httpStatus.BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки' });
      }
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  return cardModel
    .findByIdAndDelete(cardId)
    .then((card) => {
      if (!card) {
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ message: ' Карточка с указанным id не найдена' });
      }
      return res.status(httpStatus.OK).send({ data: card });
    })
    .catch(() => res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' }));
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
          .status(httpStatus.NOT_FOUND)
          .send({ message: 'Передан несуществующий id карточки' });
      }
      return res.status(httpStatus.OK).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .status(httpStatus.BAD_REQUEST)
          .send({
            message: 'Переданы некорректные данные для постановки/снятия лайка',
          });
      }
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
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
          .status(httpStatus.NOT_FOUND)
          .send({ message: 'Передан несуществующий id карточки' });
      }
      return res.status(httpStatus.OK).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .status(httpStatus.BAD_REQUEST)
          .send({
            message: 'Переданы некорректные данные для постановки/снятия лайка',
          });
      }
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
    });
};
