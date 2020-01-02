'user strict';

var config = require('../config/config');
var sendGrid = require('sendgrid')(config.sendgridKey);

exports.send = async (to, subject, body)=>{
    sendGrid.send({
        to: to,
        from: 'nodeStore@gmail.com',
        subject: subject,
        html: body
    });
}