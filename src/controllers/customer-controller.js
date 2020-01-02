'user strict'

const customerRepository = require('../repositories/customer-repository')
const ValidatorsContract = require('../validators/fluent-validators')
const md5 = require('md5')
const emailService = require('../services/email-service')
const authService = require('../services/auth-service')

exports.get = async (req, res, next)=>{
    try{
        var data = await customerRepository.get();
        res.status(200).send(data);
    }catch(e){
        res.status(500).send({
            message: 'Falha ao processar requisição',
            data: e
        })
    }
}

exports.post = async (req, res, next)=>{
    let contract = new ValidatorsContract()
    
    contract.hasMinLen(req.body.name, 3, 'O nome deve conter pelo menos 3 caracteres');
    contract.isEmail(req.body.email,'E-mail inválido');
    contract.hasMinLen(req.body.password, 6, 'A senha deve conter pelo menos 6 caracteres');
    
    // Se os dados forem inválidos
    if (!contract.isValid()) {
        res.status(400).send(contract.errors()).end();
        return;
    }

    try {
        await customerRepository.create({
            name: req.body.name,
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY),
            roles: ["user"]
        });

        emailService.send(
            req.body.email,
            'Bem vindo ao NodeStore',
            global.EMAIL_TMPL.replace('{0}', req.body.name)
            );
            
           res.status(201).send({
               message : "Cliente salvo com sucesso"
           })           
       } catch (e) {
           res.status(500).send({
               message: "Erro na gravação dos dados",
               data : e
           })
           
       }
     }

exports.authenticate = async (req, res, next)=>{
       
    try {
        const customer =  await customerRepository.authenticate({                
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY)
        });


        if(!customer){
            res.status(404).send({
                message : "E-mail ou Senha inválidos"
            });
            return
        }
            const token = await authService.generateToken({
                id: customer._id,
                email: customer.email,
                name: customer.name,
                roles: customer.roles
            });

            res.status(201).send({
                token: token,
                data: customer
            }) 
            
        }catch (e) {
            res.status(500).send({
            message: "Erro na solicitação",
            data : e
         });
    }
}

exports.refreshToken = async (req, res, next)=>{
       
    try {

         // Recupera Token
         const token = req.body.token || req.query.token || req.headers['x-access-token']

         // Decodifica o Token
         const data = await authService.decodeToken(token)

        const customer =  await customerRepository.getById(data.id);
        

        if(!customer){
            res.status(404).send({
                message : "Cliente não encontrado"
            });
            return
        }
            const tokenData = await authService.generateToken({
                id: customer._id,
                email: customer.email,
                name: customer.name,
                roles: customer.roles
            });

            res.status(201).send({
                token: token,
                data: customer,
                message: 'Token atualizado'
            }) 
            
        }catch (e) {
            res.status(500).send({
            message: "Erro na solicitação",
            data : e
         });
    }
}