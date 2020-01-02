'use strict'

const express = require('express');
const router = express.Router();
const controller = require('../controllers/order-controller')
const authService = require('../services/auth-service')

// Rotas da API

router.get('/', authService.authorize, controller.get)
router.post('/', authService.authorize,  authService.isAdmin, controller.post)


module.exports = router