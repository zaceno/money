const ejs = require('ejs');
const fs = require('fs');
const val = require('../validator');
const makeElement = require('../make-element');
const eventMixin = require('../event-emitter-mixin');
const Dropdown = require('./dropdown');
const DateInput = require('./date-input');
const NumberInput = require('./number-input');
const TextInput = require('./text-input');
const tpl = fs.readFileSync(__dirname + '/form.html', 'utf-8');

var creditAccounts = ['income', 'common', 'zach', 'sara'];
var debitAccounts = ['zach', 'sara', 'groceries', 'bills', 'kidgear', 'fuel', 'other'];

var txValidation = val.objectValidator({
    date: [
        val.exists(),
        val.hasFormat(/\d\d\d\d-\d\d-\d\d/),
        val.isDate(),
        val.isBefore(new Date().getTime()),
    ],
    credit: [
        val.exists(),
        val.isOption(creditAccounts),
    ],
    debit: [
        val.exists(),
        val.isOption(debitAccounts),
    ],
    amount: [
        val.exists(),
        val.isNumber(),
        val.atLeast(1),
    ],
    note: [
        val.atLongest(100),
    ],
});



var Form = function () {
    eventMixin(this);

    var dateInput   = new DateInput({name: 'date'});
    var amountInput = new NumberInput({name: 'amount'});
    var noteInput   = new TextInput({name: 'note'});

    var creditSelector = new Dropdown({
        name: 'credit',
        options: creditAccounts,
    });

    var debitSelector = new Dropdown({
        name: 'debit',
        options: debitAccounts,
    });

    var tplData = {
        input: {
            date: dateInput.element,
            credit: creditSelector.element,
            debit: debitSelector.element,
            amount: amountInput.element,
            note: noteInput.element,
        },
        error: null
    };
    this.element = makeElement(tpl, tplData);

    this.value = () => {
        return {
            date:    dateInput.value(),
            credit:  creditSelector.value(),
            debit:   debitSelector.value(),
            amount:  amountInput.value(),
            note:    noteInput.value(),
        }
    };
    this.errors = () => {  return txValidation(this.value()); };
    var onSubmit = (e) => {
            e.preventDefault(true);
            var data = this.value();
            var err = txValidation(data);
            tplData.error = err;
            var newElement = makeElement(tpl, tplData);
            if (this.element.parentNode) {
                this.element.parentNode.replaceChild(newElement, this.element);
            }
            this.element = newElement;
            this.element.addEventListener('submit', onSubmit);
            if (!err) this.emit('submit', data);
    };
    this.element.addEventListener('submit', onSubmit);
};

module.exports = Form;
