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
  validateUserId,
  validateUserUpdate,
  validateAvatar,
} = require('../middlewares/validation');

router.get('/users', getUser);
router.get('/users/me', getCurrentUser);
router.get('/users/:userId', validateUserId, getUserById);
router.patch('/users/me', validateUserUpdate, updateUser);
router.patch('/users/me/avatar', validateAvatar, updateAvatar);

module.exports = router;
