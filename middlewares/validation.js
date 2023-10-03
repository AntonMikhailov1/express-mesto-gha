const { celebrate, Joi, CelebrateError } = require('celebrate');
const validator = require('validator');

const urlValidation = (url) => {
  if (!validator.isURL(url)) {
    throw new CelebrateError('Некорректный адрес');
  }
  return url;
};

const validateCard = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().custom(urlValidation).required(),
  }),
});

const validateUserId = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24).hex(),
  }),
});

const validateCardId = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().length(24).hex(),
  }),
});

const validateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(20),
    avatar: Joi.string().custom(urlValidation),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

const validateUserUpdate = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
});

const validateAvatar = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().custom(urlValidation).required(),
  }),
});

const validateLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

module.exports = {
  validateCard,
  validateUserId,
  validateCardId,
  validateUser,
  validateUserUpdate,
  validateAvatar,
  validateLogin,
};
