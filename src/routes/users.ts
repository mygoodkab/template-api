import * as  Boom from 'boom';
import * as Joi from 'joi';
import * as JWT from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { Util } from '../util';
import { config } from '../index';
import * as JWTDecode from 'jwt-decode';
const mongoObjectId = ObjectId;

module.exports = [
    {  // Insert user profile
        method: 'POST',
        path: '/users',
        config: {
            auth: false,
            description: 'Insert user data',
            notes: 'Insert user data',
            tags: ['api'],
            validate: {
                payload: {
                    username: Joi.string().min(1).max(20).regex(config.regex).required(),
                    password: Joi.string().min(1).max(100).regex(config.regex).required()
                        .description('password'),
                    // type: Joi.string().valid(['admin', 'super-adim', 'users']),
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const payload = req.payload;
                payload.password = Util.hash(payload.password);
                payload.isUse = true;
                const insert = await mongo.collection('users').insert(payload);
                return ({
                    msg: 'OK',
                    statusCode: 200,
                });
            } catch (error) {
                return (Boom.badGateway(error));
            }
        },

    },
    {  // Select all user
        method: 'GET',
        path: '/users/{id?}',
        config: {
            auth: false,
            description: 'Select all user ',
            notes: 'Select all user ',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().optional().description('id user'),
                },
            },
        }, handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const params = req.params;
                const find: any = { isUse: true, };

                if (params.id === '{id}') { delete params.id; }
                if (params.id) { find._id = mongoObjectId(params.id); }

                const res = await mongo.collection('users').find(find).toArray();

                return ({
                    data: res,
                    msg: 'OK',
                    statusCode: 200,
                });

            } catch (error) {
                return (Boom.badGateway(error));
            }
        },

    },
    {  // Login
        method: 'POST',
        path: '/login',
        config: {
            auth: false,
            description: 'Check login',
            notes: 'Check login',
            tags: ['api'],
            validate: {
                payload: {
                    username: Joi.string().min(1).max(20).regex(config.regex).required(),
                    password: Joi.string().min(1).max(100).regex(config.regex).required().description('password'),
                },
            },
        },
        handler: async (req, reply) => {
            const mongo = Util.getDb(req);
            const payload = req.payload;
            payload.password = Util.hash(payload.password);
            try {
                const login = await mongo.collection('users').findOne({ username: payload.username, password: payload.password, isUse: true });
                if (login) {
                    delete login.password;
                    login.ts = Date.now();
                    login.refresh = Util.hash(login);
                    const token = JWT.sign(login, Util.jwtKey(), { expiresIn: config.jwt.timeout });
                    const insert = await mongo.collection('token').insertOne({ token, refresh: login.refresh, method: 'login' });
                    return ({
                        data: token,
                        message: 'Login success',
                        statusCode: 200,
                    });
                } else {
                    return (Boom.notFound('Invaild username or password'));
                }
            } catch (error) {
                return (Boom.badGateway(error));
            }
        },
    },
    {  // Refresh Token
        method: 'POST',
        path: '/token/refresh',
        config: {
            auth: false,
            description: 'Refresh Token',
            notes: 'Refresh Token',
            tags: ['api'],
            validate: {
                payload: {
                    refresh: Joi.string().required().description('refresh token code'),
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const payload = req.payload;
                const res = await mongo.collection('token').findOne({ refresh: payload.refresh });

                if (!res) { return Boom.badRequest('Can not find Refresh Token'); }

                // Decode JWT to get EXP
                const decode = JWTDecode(res.token);

                // Check EXP is Timeout/Time to refresh
                if (!Util.tokenTimeout(decode.exp, config.token.preiousRefresh)) { return Boom.badRequest('Token was TIME OUT/NOT TIME TO REFRESH'); }

                // Create new refresh code
                res.refresh = Util.hash(res);
                const token = JWT.sign(res, Util.jwtKey(), { expiresIn: config.token.timeout });
                const insert = await mongo.collection('token').insert({ token, refresh: res.refresh, method: 'refresh' });

                return {
                    statusCode: 200,
                    message: 'OK',
                    data: token,
                };

            } catch (error) {
                return (Boom.badGateway(error));
            }
        },
    },
    {  // Delete User
        method: 'DELETE',
        path: '/users/{id}',
        config: {
            auth: false,
            description: 'delete user',
            notes: 'delete user ',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().length(24).required().description('id user'),
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const params = req.params;
                const del = await mongo.collection('users').deleteOne({ _id: mongoObjectId(params.id) });

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
    {  // Refresh Token
        method: 'GET',
        path: '/token/auth',
        config: {
            description: 'check token',
            notes: 'check token',
            tags: ['api'],
        },
        handler: async (req, reply) => {
            try {
                return {
                    statusCode: 200,
                    data: true
                };
            } catch (error) {
                return (Boom.badGateway(error));
            }
        },
    },
    {  // PUT users
        method: 'PUT',
        path: '/users',
        config: {
            auth: false,
            description: 'Update users ',
            notes: 'Update users ',
            tags: ['api'],
            validate: {
                payload: {
                    userId: Joi.string().length(24).required().description('id users'),
                    password: Joi.string().min(1).max(100).regex(config.regex).required()
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const payload = req.payload;
                payload.password = Util.hash(payload.password);
                // Check No Data

                const res = await mongo.collection('users').findOne({ _id: mongoObjectId(payload.userId) });

                if (!res) {
                    return (Boom.badData(`Can't find ID ${payload.userId}`));
                }

                // Create Update Info & Update users
                const updateInfo = Object.assign('', payload);
                delete updateInfo.userId;
                updateInfo.mdt = Date.now();

                const update = await mongo.collection('users').update({ _id: mongoObjectId(payload.userId) }, { $set: updateInfo });


                // Return 200
                return reply.response({
                    massage: 'OK',
                    statusCode: 200,
                }).code(200);

            } catch (error) {
                return (Boom.badGateway(error));
            }
        },

    },

];
