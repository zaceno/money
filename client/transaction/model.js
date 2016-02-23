var db = require('../transaction-db');
var outil = require('../object-utilities');


var Transaction = function (doc) {
    outil.copy(doc || Transaction._defaults, this);
};
Transaction.prototype.save = function () {
    if (this._id) {
        return db.put(this);
    } else {
        return db.post(this);
    }
}
Transaction._defaults = {
    _id: null,
    _rev: null,
    date: null,
    credit: null,
    debit: null,
    amount: null,
    note: null,
};
Transaction.list = function () {
    return db.allDocs({include_docs: true}).then(function (res) {
        return res.rows.map((row) => { return new Transaction(row.doc); });
    });
};

module.exports = Transaction;
