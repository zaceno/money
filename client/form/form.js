const ejs = require('ejs');
const fs = require('fs');
const validator = require('../validator');
const makeElement = require('../make-element');
const eventMixin = require('../event-emitter-mixin');
const OptionInput = require('./option-input');
const DateInput = require('./date-input');
const NumberInput = require('./number-input');
const TextInput = require('./text-input');
const tpl = fs.readFileSync(__dirname + '/form.html', 'utf-8');

var eachProp = function (o, fn) {
    Object.keys(o).forEach((k) => {
        if (!o.hasOwnProperty(k)) return;
        fn(o[k], k, o);
    });
};
var mapObj = function (o, fn) {
    var oo = {};
    Object.keys(o).forEach((k) => {
        if (!o.hasOwnProperty(k)) return;
        oo[k] = fn(o[k]);
    });
    return oo;
};

var obj2Array = function (o, keys) {
    keys = keys || Object.keys(o);
    return keys.map((k) => { return o[k]; });
};

var Form = function () {
    eventMixin(this);

    var creditAccounts = ['income', 'common', 'zach', 'sara'];
    var debitAccounts = ['groceries', 'bills', 'fuel', 'kidgear', 'other', 'zach', 'sara'];
    var fields = {
        date: {
            label: 'Date',
            input: new DateInput({name: 'date'}),
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
            input: new OptionInput({name: 'credit', options: creditAccounts}),
            error: null,
            validator:
                validator
                .exists()
                .isOption(creditAccounts)
                .get(),
        },
        debit: {
            label: 'Debit',
            input: new OptionInput({name: 'debit', options: debitAccounts}),
            error: null,
            validator:
                validator
                .exists()
                .isOption(debitAccounts)
                .get(),
        },
        amount: {
            label: 'Amount',
            input: new NumberInput({name: 'amount'}),
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
            input: new TextInput({name: 'note'}),
            error: null,
            validator:
                validator
                .atLongest(100)
                .get(),
        },
    };

    this.value = () => {
        return mapObj(fields, (field) => {
            return field.input.value();
        });
    };

    this.errors = () => {
        var errors = mapObj(fields, (field) => { return field.error;});
        return !!Object.keys(errors).length ? errors : null;
    };

    var onSubmit = (e) => {
        e.preventDefault(true);
        eachProp(fields, (field) => { field.error = field.validator(field.input.value()) });
        render();
        if (!err) this.emit('submit', this.value());
    };

    var render = () => {
        var tplData = {
            fields: obj2Array(
                mapObj(
                    fields,
                    (field) => {
                        return {
                            input: field.input.element,
                            label: field.label,
                            error: field.error,
                        };
                    }
                )
            ),
            errors: this.errors(),
        };
        var newElement = makeElement(tpl, tplData);
        if (!!this.element && !!this.element.parentNode) {
            this.element.parentNode.replaceChild(newElement, this.element);
        }
        this.element = newElement;
        this.element.addEventListener('submit', onSubmit);
    };
    render();
};

module.exports = Form;
