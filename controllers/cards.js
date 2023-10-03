const httpStatus = require('http-status-codes').StatusCodes;
const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

const getCard = (req, res, next) => Card.find({})
  .then((cards) => res.status(httpStatus.OK).send(cards))
  .catch(next);

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .catch(() => {
      throw new BadRequestError(
        { message: 'Переданы некорректные данные при создании карточки' },
      );
    })
    .then((card) => res.status(httpStatus.CREATED).send(card))
    .catch(next);
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  return Card.findById(cardId)
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) {
        throw new NotFoundError({ message: 'Карточка с указанным id не найдена' });
      }
      if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Вы не можете удалить данную карточку');
      }
      return card
        .deleteOne()
        .then(() => res.status(httpStatus.ОК).send({ message: 'Карточка удалена' }));
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError({ message: 'Передан несуществующий id' });
      }
      return res.status(httpStatus.OK).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(
          new BadRequestError(
            { message: 'Переданы некорректные данные для постановки/снятия лайка' },
          ),
        );
      }
      return next(err);
    });
};

const dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError({ message: 'Передан несуществующий id' });
      }
      return res.status(httpStatus.OK).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(
          new BadRequestError(
            { message: 'Переданы некорректные данные для постановки/снятия лайка' },
          ),
        );
      }
      return next(err);
    });
};

module.exports = {
  getCard,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
