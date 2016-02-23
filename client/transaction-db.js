const PouchDB = require('pouchdb');
var name = 'transactions';
var opts = {};

if (process.env.mode === 'test') {
    const memdown = require('memdown');
    opts = {db: memdown};
}
var db = new PouchDB(name, opts);
module.exports = db;
