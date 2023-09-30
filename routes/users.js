// routes/users.js
const router = require('express').Router();
const {
  getUser,
  getUserById,
  getCurrentUser,
  updateUser,
  updateAvatar,
} = require('../controllers/users');
const {
  validateId,
  validateUserUpdate,
  validateAvatar,
} = require('../middlewares/validation');

router.get('/users', getUser);
router.get('/users/:userId', validateId, getUserById);
router.get('/users/me', validateId, getCurrentUser);
router.patch('/users/me', validateUserUpdate, updateUser);
router.patch('/users/me/avatar', validateAvatar, updateAvatar);

module.exports = router;
