'user strict'

const orderRepository = require('../repositories/order-repositories')
const guid = require('guid')
const authService = require('../services/auth-service')

exports.get = async (req, res, next)=>{
    try{
        var data = await orderRepository.get();
        res.status(200).send(data);
    }catch(e){
        res.status(500).send({
            message: 'Falha ao processar requisição',
            data: e
        })
    }
}

exports.post = async (req, res, next)=>{
  
    try {

        // Recupera Token
        const token = req.body.token || req.query.token || req.headers['x-access-token']

        // Decodifica o Token
        const data = await authService.decodeToken(token)


        await orderRepository.create({
            customer: data.id,
            number: guid.raw().substring(0,6),
            items: req.body.items
        });
           res.status(201).send({
               message : "Pedido salvo com sucesso"
           })           
       } catch (e) {
           res.status(500).send({
               message: "Erro na gravação dos dados",
               data : e
           })
           
       }
     }