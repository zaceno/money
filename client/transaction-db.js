const PouchDB = require('pouchdb');
var name = 'transactions';
var opts = {};

if (process.env.mode === 'test') {
    const memdown = require('memdown');
    opts = {db: memdown};
}

module.exports = new PouchDB(name, opts);
