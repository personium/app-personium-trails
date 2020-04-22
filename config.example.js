module.exports = {
  personium: {
    CELL_NAME: '<CELL_NAME>',
    CELL_FQDN: '<CELL_FQDN>',
    CELL_ADMIN: '<ADMIN_USERNAME>',
    CELL_ADMIN_PASS: '<ADMIN_PASSWORD>',
    DIRECTORY_MAPPING: [
      {
        filePattern: ['src/app/engine/**/*', '!src/app/engine/**/*.example.*'],
        srcDir: 'src/app/engine',
        dstDir: 'front',
        resourceType: 'service',
        meta: {
          language: 'JavaScript',
          subject: 'tokenAcc',
          endPoints: {
            app: 'launchSPA.js',
          },
        },
      },
      {
        filePattern: [
          'src/app/public',
          'src/app/public/**/*',
          '!src/app/public/**/*.example.*',
        ],
        srcDir: 'src/app/public',
        dstDir: 'public',
        resourceType: 'collection',
      },
      {
        filePattern: ['src/assets/**/*', '!src/assets/**/*.example.*'],
        srcDir: 'src/assets',
        dstDir: '',
        resourceType: 'staticFile',
      },
    ],
  },
  network: {
    http_proxy: process.env.http_proxy || '',
    https_proxy: process.env.https_proxy || '',
  },
};

process.env.http_proxy = '';
process.env.https_proxy = '';
process.env.HTTP_PROXY = '';
process.env.HTTPS_PROXY = '';

console.log('------------------------------------------------------');
console.log(' <info>');
console.log('   Proxy env values are contained in `config.network` ');
console.log('------------------------------------------------------');
