const httpStatus = require('http-status-codes').StatusCodes;
const Card = require('../models/card');

module.exports.getCard = (req, res) => Card
  .find({})
  .then((cards) => res.status(httpStatus.OK).send(cards))
  .catch(() => res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' }));

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  return Card
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

  return Card
    .findById(cardId)
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) {
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ message: 'Карточка с указанным id не найдена' });
      }
      if (!card.owner.toString() !== req.user._id) {
        return res
          .status(httpStatus.FORBIDDEN)
          .send({ message: 'Вы не можете удалить данную карточку' });
      }
      card.remove().then(() => res.status(httpStatus.ОК).send({ message: 'Карточка удалена' }));
    })
    .catch(() => res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' }));
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  return Card
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
  return Card
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
