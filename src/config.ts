
import * as pathSep from 'path';
module.exports = {
    dev: {
        mongodb: {
            url: 'mongodb://admin:Adoma2557$@127.0.0.1:27017/adoma',//'mongodb://admin:Adoma2557$@127.0.0.1:27017/adoma', 'mongodb://admin:123456@ds119160.mlab.com:19160/adoma'
            decorate: true,
            settings: {
                poolSize: 10,
            },
        },
        path: {
            upload: pathSep.join(__dirname, 'uploads'),
            pdf: pathSep.join(__dirname, 'uploads', 'document.pdf'),
        },
        hapi: {
            host: '127.0.0.1', // 'api.adoma.codth.com' 'localhost:38101',
            port: '38101',
            router: { routes: 'routes/*.js' }, // { routes: 'dist/routes/*.js' }
        },
        fileType: {
            images: [
                'png',
                'jpg',
                'jpeg',
            ],
            pdf: ['pdf'],
        },
        jwt: {
            timeout: '8h',
            refreshInterval: 30 * 60 * 1000 // 30 mins
        },
        timezone: {
            thai: 7 * 60 * 60 * 1000
        },
        regex: /[\S]+/,
        smtp :{
            pass : 'siripornn0811391015',
        }
    }
};
