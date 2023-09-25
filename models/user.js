// models/user.js
const mongoose = require('mongoose');
const validator = require('validator');
const httpStatus = require("http-status-codes").StatusCodes;


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто'
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследоваель'
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (url) => validator.isURL(url),
      message: 'Некорректный адрес URL'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: 'Некорректный адрес электронной почты'
    }
  },
  password: {
    type: String,
    required: true,
    select: true,
  }
});

userSchema.statics.findUserByCredentials = function (res, email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return res
        .status(httpStatus.UNAUTHORIZED)
        .send({ message: 'Пользователя не существует' });
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return res
            .status(httpStatus.UNAUTHORIZED)
            .send({ message: 'Неправильные email или пароль' });
          }
          return user;
        });
    });
};

module.exports = mongoose.model('User', userSchema);
