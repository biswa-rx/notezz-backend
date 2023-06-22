const express = require('express');
const { register } = require('../Controllers/Auth.controller');
const router = express.Router();
const AuthController = require('../Controllers/Auth.controller')

router.post('/resister',AuthController.register);
router.post('/login',AuthController.login);
router.post('/refresh-token',AuthController.refreshToken);
router.delete('/logout',AuthController.logout)

module.exports = router;