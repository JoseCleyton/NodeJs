'use strict'

const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const config = require('./config/config')
const md5 = require('md5')

const app = express();

// Conexão com Banco de Dados MongoDb
mongoose.connect(config.connectionString)

// Carregando Models
const Product = require('./models/product-model')
const Customer = require('./models/customer-model')
const Order = require('./models/order-model')

// Carrega as Rotas
const indexRoute = require('./routes/index-route')
const productRoute = require('./routes/product-route')
const customerRoute = require('./routes/customer-route')
const orderRoute = require('./routes/order-route')

app.use(bodyParser.json({
     limit: "5mb"
}));
app.use(bodyParser.urlencoded({
     extended: false
}));

// Habilita o CORS
app.use(function (req, res, next) {
     res.header('Access-Control-Allow-Origin', '*');
     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
     next();
 });

app.use('/', indexRoute);
app.use('/products', productRoute);
app.use('/customers', customerRoute);
app.use('/orders', orderRoute);

module.exports = app