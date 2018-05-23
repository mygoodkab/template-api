
import * as pathSep from 'path';
module.exports = {
    dev: {
        mongodb: {
            url: 'mongodb://admin:123456@ds119160.mlab.com:19160/adoma',
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
            host: 'api.adoma.codth.com', // 'api.adoma.codth.com' 'localhost:38101',
            port: '38101',
            router: { routes: 'dist/routes/*.js' }
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
        mail: {
            DOMAIN: `mg.codth.com`,
            API_KEY: `key-b09165d35576ee942a4158800f0282af`,
        },
    }
};
