import * as  Boom from 'boom';
import * as Joi from 'joi';
import * as JWT from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { Util } from '../util';
import { config } from '../index';
import { mail } from '../mail';
const mongoObjectId = ObjectId;

module.exports = [
    {  // GET form
        method: 'GET',
        path: '/form/{id?}',
        config: {
            auth: false,
            description: 'Get form',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().optional().description('id form'),
                },
            },
        }, handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const params = req.params;
                const find: any = { isUse: true, };

                if (params.id === '{id}') { delete params.id; }
                if (params.id) { find.id = params.id; }

                const res = await mongo.collection('form').find(find).toArray();

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
    {  // POST form
        method: 'POST',
        path: '/form',
        config: {
            auth: false,
            description: 'Insert form ',
            notes: 'Insert form ',
            tags: ['api'],
            validate: {
                payload: {
                    form: Joi.string().regex(config.regex).description('staff form')
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
                const res = await mongo.collection('form').find().toArray();

                if (res.length !== 0) {
                    return Boom.badRequest('data is exist');
                }

                const insert = await mongo.collection('form').insertOne(payload);

                // Get latsest ID
                const latestInsert = await mongo.collection('form').find({}).sort({ _id: -1 }).limit(1).toArray();

                // Create & Insert form-Log
                const log = Object.assign({}, payload);
                log.formId = insert.insertedId.toString();
                const writeLog = await Util.writeLog(req, log, 'form-log', 'insert');

                return ({
                    massage: 'OK',
                    statusCode: 200,
                });

            } catch (error) {
                return (Boom.badGateway(error));
            }
        },

    },
    {  // PUT form
        method: 'PUT',
        path: '/form',
        config: {
            auth: false,
            description: 'Update form ',
            notes: 'Update form ',
            tags: ['api'],
            validate: {
                payload: {
                    formId: Joi.string().length(24).required().description('id staff'),
                    form: Joi.string().regex(config.regex).description('form')
                }
            },
        },
        handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const payload = req.payload;

                // Check No Data
                const res = await mongo.collection('form').findOne({ _id: mongoObjectId(payload.formId) });
                if (!res) {
                    return (Boom.badData(`Can't find ID ${payload._id}`));
                }

                // Create Update Info & Update form
                const updateInfo = Object.assign('', payload);
                delete updateInfo._id;
                updateInfo.mdt = Date.now();

                const update = await mongo.collection('form').update({ _id: mongoObjectId(payload.formId) }, { $set: updateInfo });

                // Create & Insert form-Log
                const writeLog = await Util.writeLog(req, payload, 'form-log', 'update');

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
        path: '/form/{id}',
        config: {
            auth: false,
            description: 'delete form ',
            notes: 'delete form',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().length(24).required().description('id form'),
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const params = req.params;

                // Check No Data
                const res = await mongo.collection('form').findOne({ _id: mongoObjectId(params.formId) });
                if (!res) {
                    return (Boom.badData(`Can't find ID ${params._id}`));
                }
                
                const del = await mongo.collection('form').deleteOne({ _id: mongoObjectId(params.id) });

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

];
