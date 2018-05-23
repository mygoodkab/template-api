import * as  Boom from 'boom';
import * as Joi from 'joi';
import * as JWT from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { Util } from '../util';
import { config } from '../index';
import { mail } from '../mail';
const mongoObjectId = ObjectId;

module.exports = [
   
    {  // Send mail
        method: 'POST',
        path: '/form/send',
        config: {
            auth: false,
            description: 'Sent form',
            notes: 'Sent form',
            tags: ['api'],
            validate: {
                payload: {
                    companyName: Joi.string(),
                    personName: Joi.string(),
                    form: Joi.string(),
                    address: Joi.string(),
                    inquiry: Joi.string(),
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const payload = req.payload;
                const mongo = Util.getDb(req);
                payload.crt = Date.now();
                const receiver = await mongo.collection('form').find().toArray();
                payload.receiver = receiver[0].form;
                const sendmail = await mail(payload);
                const insert = await mongo.collection('mail-send').insertOne(payload);
                return ({
                    msg: 'OK',
                    statusCode: 200,
                });
            } catch (error) {
                return (Boom.badRequest(error));
            }
        },
    },
];
