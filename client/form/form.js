const ejs = require('ejs');
const fs = require('fs');
const val = require('../validator');
const makeElement = require('../make-element');
const EventEmitter = require('events');
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
    var ev = new EventEmitter();
    this.emit = ev.emit.bind(ev);
    this.on  = ev.on.bind(ev);

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

    this.element = makeElement(tpl, {
        date: dateInput.element,
        credit: creditSelector.element,
        debit: debitSelector.element,
        amount: amountInput.element,
        note: noteInput.element,
    });

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
    this.element.addEventListener('submit', (e) => {
        e.preventDefault(true);
        var data = this.value();
        var err = txValidation(data);
        if (!!err) return this.emit('invalid', err);
        this.emit('save', data);
    });
};

module.exports = Form;
