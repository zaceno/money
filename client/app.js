const fs = require('fs');
const makeElement = require('./make-element');
const outil = require('./object-utilities');
const TransactionForm = require('./transaction/form.js');
const TransactionList = require('./transaction/list.js');
const TransactionModel = require('./transaction/model.js');
const tpl = fs.readFileSync(__dirname + '/app.html', 'utf-8');

var App = function () {
    this.form = new TransactionForm();
    this.list = new TransactionList();
    this.element = makeElement(tpl, outil.map(this, (prop) => { return prop.element }));
    this.element.querySelector('button[name=empty]').addEventListener('click', () => {
        TransactionModel.empty();
    })
};

module.exports = App;
