const makeElement = require('../make-element');
const eventMixin = require('../event-emitter-mixin.js');
const TransactionModel = require('./model.js');
const fs = require('fs');
const tpl = fs.readFileSync(__dirname + '/list.html', 'utf-8');

var TransactionList = function () {
    eventMixin(this);
    TransactionModel.on('created', () => { this._updateItems(); });
    TransactionModel.on('change', () => { this._updateItems(); });
    this.on('change', () => { this._render() });

    this.items = [];
    this._render();
    this._updateItems();
};
TransactionList.prototype._updateItems = function () {
    TransactionModel.list().then((items) => {
        this.items = items;
        this.emit('change');
    });
};
TransactionList.prototype._render = function () {
    var newElement = makeElement(tpl, {items: this.items});
    if (!!this.element && !!this.element.parentNode) {
        this.element.parentNode.replaceChild(newElement, this.element);
    }
    this.element = newElement;
};

module.exports = TransactionList;
