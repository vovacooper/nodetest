var winston = require('winston');

winston.add(winston.transports.File, {filename: '/var/log/dozenlikes/nodejs.log'});
// winston.remove(winston.transports.Console);

winston.log('info', 'Hello distributed log files!');
winston.info('Hello again distributed logs');

winston.level = 'debug';
winston.log('debug', 'Now my debug messages are written to console!');