import * as  Boom from 'boom';
import * as Joi from 'joi';
import { ObjectId } from 'mongodb';
import { Util } from '../util';
import * as pathSep from 'path';
import * as fs from 'fs';
import { upload } from '../upload';
import { mail } from '../mail';
import { config } from '../index';
const mongoObjectId = ObjectId;
module.exports = [
    {  // Upload Image
        method: 'POST',
        path: '/image',
        config: {
            auth: false,
            tags: ['api'],
            description: 'Upload file',
            notes: 'Upload file',
            validate: {
                payload: {
                    file: Joi.any().meta({ swaggerType: 'file' }).description('upload file image'),
                }
            },
            payload: {
                maxBytes: 50000000,
                parse: true,
                output: 'stream',
                allow: 'multipart/form-data',
            },
        },
        handler: async (req, reply) => {

            try {
                const payload = req.payload;
                const mongo = Util.getDb(req);

                // If folder is not exist and Create Floder
                if (!Util.existFolder(config.path.upload)) {
                    if (Util.mkdirFolder(config.path.upload)) {
                        throw new Error('False to create upload folder');
                    }
                }
                // send data to upload file
                const path = config.path.upload;
                const fileDetail = await upload(payload.file, path, config.fileType.images);

                // insert data
                const insert = await mongo.collection('images').insert(fileDetail);

                return {
                    statusCode: 200,
                    massage: 'OK',
                    data: insert.insertedIds,
                };

            } catch (error) {
                return (Boom.badRequest(error));
            }
        }
    },
    {  // Get image file
        method: 'GET',
        path: '/image/{id}',
        config: {
            auth: false,
            tags: ['api'],
            description: 'Get image for UI',
            notes: 'Get image ',
            validate: {
                params: {
                    id: Joi.string().required().description('id image'),
                },
            },
        },
        handler: async (request, reply) => {
            const mongo = Util.getDb(request);
            try {
                const resUpload = await mongo.collection('images').findOne({ _id: mongoObjectId(request.params.id) });
                if (!resUpload) {
                    return {
                        statusCode: 404,
                        message: 'Bad Request',
                        data: 'Data not found'
                    };
                } else {
                    const path: any = pathSep.join(config.path.upload, resUpload.storeName);
                    return reply.file(path,
                        {
                            filename: resUpload.name + '.' + resUpload.fileType,
                            mode: 'inline'
                        });
                }
            } catch (error) {
                reply(Boom.badGateway(error));
            }
        },
    },
    {  // Upload PDF
        method: 'POST',
        path: '/pdf',
        config: {
            auth: false,
            tags: ['api'],
            description: 'Upload file',
            notes: 'Upload file',
            validate: {
                payload: {
                    file: Joi.any().meta({ swaggerType: 'file' }).description('upload file PDF'),
                }
            },
            payload: {
                maxBytes: 50000000,
                parse: true,
                output: 'stream',
                allow: 'multipart/form-data',
            },
        },
        handler: async (req, reply) => {

            try {
                const payload = req.payload;
                const mongo = Util.getDb(req);

                // If folder is not exist and Create Floder
                if (!Util.existFolder(config.path.upload)) {
                    if (Util.mkdirFolder(config.path.upload)) {
                        throw new Error('False to create upload folder');
                    }
                }

                const path = config.path.upload;
                const fileDetail = await upload(payload.file, path, config.fileType.pdf);
                const insert = await mongo.collection('pdf').insert(fileDetail);

                return {
                    statusCode: 200,
                    massage: 'OK',
                    data: insert.insertedIds,
                };

            } catch (error) {
                return (Boom.badRequest(error));
            }
        }
    },
    {  // Get image PDF
        method: 'GET',
        path: '/pdf',
        config: {
            auth: false,
            tags: ['api'],
            description: 'Get image for UI',
            notes: 'Get image ',
        },
        handler: async (request, reply) => {
            const mongo = Util.getDb(request);
            try {
                const res = await mongo.collection('content').find().toArray();
                const file = res[0].pdf;
                const resfile = await mongo.collection('pdf').findOne({ _id: mongoObjectId(file) })
                return reply.file(pathSep.join(config.path.upload, resfile.storeName))
                    .header('Content-Type', 'text/pdf')
                    .header(`Content-Disposition`, `attachment; filename=${resfile.storeName}`);

            } catch (error) {
                reply(Boom.badGateway(error));
            }
        },
    },
    {  // Delete
        method: 'DELETE',
        path: '/image/{id}',
        config: {
            auth: false,
            description: 'delete iamge ',
            notes: 'delete images',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().length(24).required().description('id images'),
                },
            },
        },
        handler: async (req, reply) => {
            try {
                const mongo = Util.getDb(req);
                const params = req.params;
                const res = await mongo.collection('images').findOne({ _id: mongoObjectId(params.id) });
                if (Util.unlinkFile(pathSep.join(config.path.upload, res.storeName))) {
                    return Boom.badGateway('Can not unlinkfile');
                }
                const del = await mongo.collection('images').deleteOne({ _id: mongoObjectId(params.id) });

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
