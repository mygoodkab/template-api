import * as  Boom from 'boom';
import * as Joi from 'joi';
import * as JWT from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { Util } from '../util';
import { config } from '../index';
import { mail } from '../mail';
const mongoObjectId = ObjectId;

module.exports = [
    {  // GET email
        method: 'GET',
        path: '/email/{id?}',
        config: {
            auth: false,
            description: 'Get email',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().optional().description('id email'),
                },
            },
        }, handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const params = req.params;
                const find: any = { isUse: true, };

                if (params.id === '{id}') { delete params.id; }
                if (params.id) { find.id = params.id; }

                const res = await mongo.collection('email').find(find).toArray();

                return {
                    data: res,
                    message: 'OK',
                    statusCode: 200,
                };

            } catch (error) {
                return (Boom.badGateway(error));
            }
        },

    },
    {  // POST email
        method: 'POST',
        path: '/email',
        config: {
           // auth: false,
            description: 'Insert email ',
            notes: 'Insert email ',
            tags: ['api'],
            validate: {
                payload: {
                    email: Joi.string().email().regex(config.regex).description('staff email')
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const payload = req.payload;

                // Create Date
                payload.crt = Date.now();

                // Status's using
                payload.isUse = true;
                const res = await mongo.collection('email').find().toArray();

                if (res.length !== 0) {
                    return Boom.badRequest('data is exist');
                }

                const insert = await mongo.collection('email').insertOne(payload);

                // Get latsest ID
                const latestInsert = await mongo.collection('email').find({}).sort({ _id: -1 }).limit(1).toArray();

                // Create & Insert email-Log
                const log = Object.assign({}, payload);
                log.emailId = insert.insertedId.toString();
                const writeLog = await Util.writeLog(req, log, 'email-log', 'insert');

                return ({
                    massage: 'OK',
                    statusCode: 200,
                });

            } catch (error) {
                return (Boom.badGateway(error));
            }
        },

    },
    {  // PUT email
        method: 'PUT',
        path: '/email',
        config: {
           // auth: false,
            description: 'Update email ',
            notes: 'Update email ',
            tags: ['api'],
            validate: {
                payload: {
                    emailId: Joi.string().length(24).required().description('id staff'),
                    email: Joi.string().email().regex(config.regex).description('email')
                }
            },
        },
        handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const payload = req.payload;

                // Check No Data
                const res = await mongo.collection('email').findOne({ _id: mongoObjectId(payload.emailId) });

                if (!res) {
                    return (Boom.badData(`Can't find ID ${payload._id}`));
                }

                // Create Update Info & Update email
                const updateInfo = Object.assign('', payload);
                delete updateInfo._id;
                updateInfo.mdt = Date.now();

                const update = await mongo.collection('email').update({ _id: mongoObjectId(payload.emailId) }, { $set: updateInfo });

                // Create & Insert email-Log
                const writeLog = await Util.writeLog(req, payload, 'email-log', 'update');

                // Return 200
                return ({
                    massage: 'OK',
                    statusCode: 200,
                });

            } catch (error) {
                return (Boom.badGateway(error));
            }
        },

    },
    {  // Delete Unit
        method: 'DELETE',
        path: '/email/{id}',
        config: {
          //  auth: false,
            description: 'delete email ',
            notes: 'delete email',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().length(24).required().description('id email'),
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const params = req.params;
                const del = await mongo.collection('email').deleteOne({ _id: mongoObjectId(params.id) });

                // Return 200
                return ({
                    massage: 'OK',
                    statusCode: 200,
                });

            } catch (error) {
                return (Boom.badGateway(error));
            }

        },

    },
    {  // Send mail
        method: 'POST',
        path: '/email/send',
        config: {
            auth: false,
            description: 'Sent email',
            notes: 'Sent email',
            tags: ['api'],
            validate: {
                payload: {
                    companyName: Joi.string(),
                    personName: Joi.string(),
                    email: Joi.string(),
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
                const receiver = await mongo.collection('email').find().toArray();
                payload.receiver = receiver[0].email;
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
