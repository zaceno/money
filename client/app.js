const fs = require('fs');
const makeElement = require('./make-element');
const outil = require('./object-utilities');
const TransactionForm = require('./transaction/form.js');
const TransactionModel = require('./transaction/model.js');
const Output = require('./output.js');
const tpl = fs.readFileSync(__dirname + '/app.html', 'utf-8');

var App = function () {
    this.form = new TransactionForm();
    this.output = new Output();
    TransactionModel.on('created', (transaction) => {
        this.output.value = JSON.stringify(transaction);
    });
    this.element = makeElement(tpl, outil.map(this, (prop) => { return prop.element }));
};

module.exports = App;
