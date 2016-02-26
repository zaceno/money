const ejs = require('ejs');
const fs = require('fs');
const validator = require('../validator');
const makeElement = require('../make-element');
const eventMixin = require('../event-emitter-mixin');
const tpl = fs.readFileSync(__dirname + '/form.html', 'utf-8');
const tplInput = fs.readFileSync(__dirname + '/input.html', 'utf-8');
const tplSelect = fs.readFileSync(__dirname + '/select.html', 'utf-8')

const Transaction = require('./model.js');
const outil = require('../object-utilities');

var Form = function () {
    eventMixin(this);

    var creditAccounts = ['income', 'common', 'zach', 'sara'];
    var debitAccounts = ['groceries', 'bills', 'fuel', 'kidgear', 'other', 'zach', 'sara'];
    var fields = {
        date: {
            label: 'Date',
            input: makeElement(tplInput, {type: 'date', name: 'date', value: ''}),
            error: null,
            validator:
                validator
                .exists()
                .hasFormat(/\d\d\d\d-\d\d-\d\d/)
                .isDate()
                .isBefore(new Date().getTime())
                .get(),
        },
        credit: {
            label: 'Credit',
            input: makeElement(tplSelect, {name: 'credit', options: creditAccounts}),
            error: null,
            validator:
                validator
                .exists()
                .isOption(creditAccounts)
                .get(),
        },
        debit: {
            label: 'Debit',
            input: makeElement(tplSelect, {name: 'debit', options: debitAccounts}),
            error: null,
            validator:
                validator
                .exists()
                .isOption(debitAccounts)
                .get(),
        },
        amount: {
            label: 'Amount',
            input: makeElement(tplInput, {name: 'amount', type: 'number', value: ''}),
            error: null,
            validator:
                validator
                .exists()
                .isNumber()
                .atLeast(1)
                .get(),
        },
        note: {
            label: 'Note',
            input: makeElement(tplInput, {type: 'text', name: 'note', value: ''}),
            error: null,
            validator:
                validator
                .atLongest(100)
                .get(),
        },
    };
    this.submitButton = makeElement(tplInput, {type: 'submit', name: 'submit', value: 'Submit'});
    this.fields = fields;

    var getErrors = () => {
        return outil.map(fields, (field) => { return field.error;});
    };

    Object.defineProperty(this, 'value', {
        configurable: true,
        enumerable: true,
        readonly: true,
        get: () => {
            var o = outil.map(fields, (field) => { return field.input.value });
            o.amount = +o.amount;
            return o;
        }
    })
    Object.defineProperty(this, 'errors', {
        configurable: true,
        enumerable: true,
        readonly: true,
        get: function () {
            return outil.values(fields)
            .map((field) => { return !!field.error})
            .reduce((all, err) => { return all || err; }, false);
        },
    });

    var model = null;
    Object.defineProperty(this, 'model', {
        configurable: true,
        enumerable: true,
        get: () => { return model;},
        set: (m) => { model = m; },
    });


    this.submit = (e) => {
        e && e.preventDefault(true);
        outil.forEach(fields, (field) => { field.error = field.validator(field.input.value) });
        if (!this.errors) {
            model = outil.copy(this.value, model || new Transaction());
            outil.forEach(fields, (field) => { field.input.disabled = true; });
            this.submitButton.disabled = true;
            model.save().then(() => {
                outil.forEach(fields, (field) => {
                    field.input.disabled = false;
                    field.input.value = '';
                });
                this.submitButton.disabled = false;
                model = null;
                process.nextTick(() =>{ this.emit('saved'); });
            });
        }
        render();
    };

    var render = () => {
        var tplData = {
            fields: outil.values(outil.map(fields, (field) => {
                return {
                    input: field.input,
                    label: field.label,
                    error: field.error,
                };
            })),
            submitButton: this.submitButton,
            errors: getErrors(),
        };
        var newElement = makeElement(tpl, tplData);
        if (!!this.element && !!this.element.parentNode) {
            this.element.parentNode.replaceChild(newElement, this.element);
        }
        this.element = newElement;
        this.element.addEventListener('submit', this.submit.bind(this));
    };


    render();
};

module.exports = Form;
