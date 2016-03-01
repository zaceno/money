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

/*

    form has states:
        initial,
        errors,
        pending (in which case it cannot be submitted again),


    form interface:
        submit -- cause value to be submitted.
        values -- read Write property that disseminates to individual fields.
        errors -- readonly property that tells you all the errors of individual fields.
        you can ask for state,
        any field has set / get values, errors state, error.
        has a submitbutton which should get disabled. Tests should not check disabled
        state of component, but individual components should be able to be enabled/disabled
        based on state.
*/

var creditAccounts = ['income', 'common', 'zach', 'sara'];
var debitAccounts = ['groceries', 'bills', 'fuel', 'kidgear', 'other', 'zach', 'sara'];
var validators = {
    date: validator
        .exists()
        .hasFormat(/\d\d\d\d-\d\d-\d\d/)
        .isDate()
        .isBefore(new Date().getTime())
        .get(),
    credit: validator
        .exists()
        .isOption(creditAccounts)
        .get(),
    debit: validator
        .exists()
        .isOption(debitAccounts)
        .get(),
    amount: validator
        .exists()
        .isNumber()
        .atLeast(1)
        .get(),
    note: validator
        .atLongest(100)
        .get(),
};




var Form = function () {
    eventMixin(this);

    this.fields = {
        date: {
            label: 'Date',
            input: makeElement(tplInput, {type: 'date', name: 'date', value: ''}),
            error: null,
        },
        credit: {
            label: 'Credit',
            input: makeElement(tplSelect, {name: 'credit', options: creditAccounts}),
            error: null,
        },
        debit: {
            label: 'Debit',
            input: makeElement(tplSelect, {name: 'debit', options: debitAccounts}),
            error: null,
        },
        amount: {
            label: 'Amount',
            input: makeElement(tplInput, {name: 'amount', type: 'number', value: ''}),
            error: null,
        },
        note: {
            label: 'Note',
            input: makeElement(tplInput, {type: 'text', name: 'note', value: ''}),
            error: null,
        },
    };
    Object.defineProperty(this, 'state', {
        configurable: true,
        enumerable: true,
        readonly: true,
        get: () => { return this._state; }
    });
    this._setState('initial');
};



Form.prototype._setState = function (state) {
    var fn = this['_setState_' + state];
    fn && fn.call(this);
    this.render();
};



Form.prototype._setState_initial = function () {
    this._state = 'initial';
    outil.forEach(this.fields, (field) => {
        field.input.disabled = false;
        field.input.value = '';
        field.error = null;
    });
    if (!this.element) return;
    this.element.querySelector('input[type=submit]').disabled = false;
};



Form.prototype._setState_error = function () {
    this._state = 'error';
};



Form.prototype._setState_saving = function () {
    this._state = 'saving';
    //while saving, disable all controls.
    this.element.querySelector('input[type=submit]').disabled = true;
    outil.forEach(this.fields, (field) => { field.input.disabled = true; });
};



Form.prototype._save = function () {
    this._setState('saving');
    var data = outil.map(this.fields, (field) => {
        return field.input.value
    });
    data.amount = +data.amount;
    Transaction.create(data).then(() => { this._setState('initial'); });
};



Form.prototype.checkErrors = function () {
    var foundError = false;
    outil.forEach(this.fields, (field, key) => {
        var e = validators[key](field.input.value);
        field.error = e;
        foundError = foundError || !!e;
    });
    return foundError;
}



Form.prototype.submit = function (ev) {
    ev && ev.preventDefault(true);
    if (this.checkErrors()) return this._setState('error');
    this._save();
};



Form.prototype.render = function () {
    var tplData = {
        fields: outil.values(outil.map(this.fields, (field) => {
            return {
                input: field.input,
                label: field.label,
                error: field.error,
            };
        })),
        submitButton: this.submitButton,
        state: this._state,
    };
    var newElement = makeElement(tpl, tplData);
    if (!!this.element && !!this.element.parentNode) {
        this.element.parentNode.replaceChild(newElement, this.element);
    }
    this.element = newElement;
    this.element.addEventListener('submit', this.submit.bind(this));
}

module.exports = Form;
