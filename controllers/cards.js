const httpStatus = require('http-status-codes').StatusCodes;
const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getCard = (req, res, next) => Card.find({})
  .then((cards) => res.status(httpStatus.OK).send(cards))
  .catch(next);

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  return Card.create({ name, link, owner })
    .catch(() => {
      throw new BadRequestError(
        'Переданы некорректные данные при создании карточки',
      );
    })
    .then((card) => res.status(httpStatus.CREATED).send(card))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  return (
    Card.findById(cardId)
      // eslint-disable-next-line consistent-return
      .then((card) => {
        if (!card) {
          throw new NotFoundError('Карточка с указанным id не найдена');
        }
        if (!card.owner.toString() !== req.user._id) {
          throw new ForbiddenError('Вы не можете удалить данную карточку');
        }
        card
          .remove()
          .then(() => res.status(httpStatus.ОК).send({ message: 'Карточка удалена' }));
      })
      .catch(next)
  );
};

module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;
  return Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Передан несуществующий id');
      }
      return res.status(httpStatus.OK).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(
          new BadRequestError('Переданы некорректные данные для постановки/снятия лайка'),
        );
      }
      return next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  return Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Передан несуществующий id');
      }
      return res.status(httpStatus.OK).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(
          new BadRequestError(
            'Переданы некорректные данные для постановки/снятия лайка',
          ),
        );
      }
      return next(err);
    });
};
