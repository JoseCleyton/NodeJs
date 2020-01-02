'user strict'

const ValidatorsContract = require('../validators/fluent-validators')
const productRepository = require('../repositories/product-repository')
const config = require('../config/config')
const azure = require('azure-storage')
const guid = require('guid')

exports.get = async (req, res, next)=>{
    try{
        var data = await productRepository.get();
        res.status(200).send(data);
    }catch(e){
        res.status(500).send({
            message: 'Falha ao processar requisição',
            data: e
        })
    }
}

exports.getBySlug = async (req, res, next)=>{
    try{
        var data = await productRepository.getBySlug(req.params.slug);
        res.status(200).send(data)
    }catch(e){
        res.status(500).send({
            message:'Falha ao processar requisição',
            data: e
        })
    }
}

exports.getById = async (req, res, next)=>{
    try{
        var data = await productRepository.getById(req.params.id);
         res.status(200).send(data)
    }catch(e){
        res.status(500).send({
            message:'Falha ao processar requisição',
            data: e
        })
    }
           
}

exports.getByTag = async (req, res, next)=>{
    try {
        var data = await productRepository.getByTag(req.params.tag)                 
        res.status(200).send(data)        
    } catch (e) {
        res.status(500).send({
            message:'Falha ao processar requisição',
            data: e
        })
    }
               
}

exports.post = async (req, res, next)=>{
    let contract = new ValidatorsContract()
    
    contract.hasMinLen(req.body.title, 3, 'O título deve conter pelo menos 3 caracteres');
    contract.hasMinLen(req.body.slug, 3, 'O Slug deve conter pelo menos 3 caracteres');
    contract.hasMinLen(req.body.description, 3, 'A Descrição deve conter pelo menos 3 caracteres');
    
    // Se os dados forem inválidos
    if (!contract.isValid()) {
        res.status(400).send(contract.errors()).end();
        return;
    }

    try {

        // Cria o Blob Service

        const blobService = azure.createBlobService(config.containerConnectionString);
        
        let filename = guid.raw().toString() + '.jpg';
        let rawData = req.body.image;
        let matches = rawData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let type = matches[1];
        let buffer = new Buffer(matches[2], 'base64');

        // Salva a Imagem
        await blobService.createBlockBlobFromText('product-images', filename, buffer, {
            contentType: type
        }, function(error, result, response){
            if(error){
                filename = 'default-product.png';
            }
        });

        await productRepository.create({
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            price: req.body.price,
            active: true,
            tags: req.body.tags,
            image: 'https://nodestorebaltaio.blob.core.windows.net/product-images/' + filename 
        });
           res.status(201).send({
               message : "Produto salvo com sucesso"
           })           
       } catch (e) {
           res.status(500).send({
               message: "Erro na gravação dos dados",
               data : e
           })
           
       }
}
exports.put = async (req, res, next)=>{
    try {
    await productRepository.update(req.params.id, req.body);
        res.status(200).send({
            message: 'Produto atualizado com sucesso'
        });
        
    } catch (e) {
        res.status(400).send({
            message: 'Falha ao atualizar produto',
            data: e
        })
    }

}
exports.delete = async (req, res, next)=>{
    try {
        await productRepository.delete(req); 
        res.status(200).send({
            message: 'Produto removido com sucesso'
        })       
    } catch (e) {
        res.status(400).send({
            message: 'Erro ao remover produto',
            data: erro
        })
    }
}