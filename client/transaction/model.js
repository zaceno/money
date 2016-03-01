const db = require('../transaction-db');
const outil = require('../object-utilities');
const eventMixin = require('../event-emitter-mixin');

var Transaction = function (doc) {
    outil.copy(doc || Transaction._defaults, this);
};
Transaction.prototype.save = function () {
    if (this._id) {
        return db.put(this);
    } else {
        return db.post(this).then((res) => {
            this._id = res.id;
            this._rev = res.rev;
            process.nextTick(() => { Transaction.emit('created', this) });
        });
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
Transaction.create = function (data) {
    return new Transaction(data).save();
};
eventMixin(Transaction);

module.exports = Transaction;
