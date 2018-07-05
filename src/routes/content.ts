import * as  Boom from 'boom';
import * as Joi from 'joi';
import * as JWT from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { Util } from '../util';
import { config } from '../index';
const mongoObjectId = ObjectId;

module.exports = [
    {  // GET content
        method: 'GET',
        path: '/content/{id?}',
        config: {
            auth: false,
            description: 'Get content',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().optional().description('id content'),
                },
            },
        }, handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const params = req.params;
                const find: any = { isUse: true, };

                if (params.id === '{id}') { delete params.id; }
                if (params.id) { find.id = params.id; }

                const res = await mongo.collection('content').find(find).toArray();

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
    {  // POST content
        method: 'POST',
        path: '/content',
        config: {
          //  auth: false,
            description: 'Insert content ',
            notes: 'Insert content ',
            tags: ['api'],
            validate: {
                payload: Joi.any().description('content'),
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
                const res = await mongo.collection('content').find().toArray();

                if (res.length !== 0) {
                    return Boom.badRequest('data is exist');
                }

                const insert = await mongo.collection('content').insertOne(payload);

                // Get latsest ID
                const latestInsert = await mongo.collection('content').find({}).sort({ _id: -1 }).limit(1).toArray();

                // Create & Insert content-Log
                const log = Object.assign({}, payload);
                log.contentId = insert.insertedId.toString();
                const writeLog = await Util.writeLog(req, log, 'content-log', 'insert');

                return ({
                    massage: 'OK',
                    statusCode: 200,
                });

            } catch (error) {
                return (Boom.badGateway(error));
            }
        },

    },
    {  // PUT content
        method: 'PUT',
        path: '/content',
        config: {
          //  auth: false,
            description: 'Update content ',
            notes: 'Update content ',
            tags: ['api'],
            validate: {
                payload: Joi.any().description('content'),
                // payload: {
                //     contentId: Joi.string().length(24).required().description('id content'),
                //     // object: Joi.any().description('content'),
                // },
            },
        },
        handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const payload = req.payload;

                // Check No Data
                const res = await mongo.collection('content').findOne({ _id: mongoObjectId(payload._id) });

                if (!res) {
                    return (Boom.badData(`Can't find ID ${payload._id}`));
                }

                // Create Update Info & Update content
                const updateInfo = Object.assign('', payload);
                delete updateInfo._id;
                updateInfo.mdt = Date.now();

                const update = await mongo.collection('content').update({ _id: mongoObjectId(payload._id) }, { $set: updateInfo });

                // Create & Insert content-Log
                const writeLog = await Util.writeLog(req, payload, 'content-log', 'update');

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
        path: '/content/{id}',
        config: {
           // auth: false,
            description: 'delete content ',
            notes: 'delete content',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().length(24).required().description('id content'),
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const params = req.params;
                const del = await mongo.collection('content').deleteOne({ _id: mongoObjectId(params.id) });

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
