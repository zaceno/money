var output = document.querySelector('pre#output');
var form = document.querySelector('form');

var creditAccounts = ['income', 'common', 'zach', 'sara'];
var debitAccounts = ['zach', 'sara', 'groceries', 'bills', 'kidgear', 'fuel', 'other'];



var objectValidator = (validators) => {
    return (o) => {
        var haveErrors = false;
        var errors = {};
        Object.keys(validators).forEach(function (key) {
            if (!validators.hasOwnProperty(key)) return;
            try {
                validators[key].forEach((fn) => {
                    fn(o[key]);
                });
            } catch (msg) {
                if (typeof msg !== 'string') throw msg;
                errors[key] = msg;
                haveErrors = true;
            }
        });
        return haveErrors ? errors : null;
    }
};
var assertion = (fn, msg) => {
    return (arg) => {
        return (x) => {
            if (!fn(x, arg)) throw msg;
        };
    };
};
var exists    = assertion((x) => { return typeof x !== 'undefined' }, 'required');
var hasFormat = assertion((x, fmt) => { return x.match(fmt) }, 'wrong format');
var isDate    = assertion((x) => { return !isNaN(Date.parse(x))}, 'not a date');
var isBefore  = assertion((x, t) => { return Date.parse(x) <= t}, 'too late');
var isOption  = assertion((x, opts) => {return opts.indexOf(x) > -1}, 'invalid option');
var isNumber  = assertion((x) => {return !isNaN(+x)}, 'not a number');
var atLeast   = assertion((x, min) => { return (x >= min)}, 'too small');
var atLongest = assertion((x, maxlen) => { return x.length <= maxlen}, 'too long');

var txValidation = objectValidator({
    date: [
        exists(),
        hasFormat(/\d\d\d\d-\d\d-\d\d/),
        isDate(),
        isBefore(new Date().getTime()),
    ],

    credit: [
        exists(),
        isOption(creditAccounts),
    ],
    debit: [
        exists(),
        isOption(debitAccounts),
    ],
    amount: [
        exists,
        isNumber,
        atLeast(1),
    ],
    note: [
        atLongest(100),
    ],
});




function saveRecord(data) {
    var err = txValidation(data);
    output.innerHTML = err ? JSON.stringify(err) : JSON.stringify(data);
}

form.addEventListener('submit', function (e) {
    e.preventDefault(true);
    var data = {
        date:    form.querySelector('[name=date]').value,
        credit:  form.querySelector('[name=credit]').value,
        debit:   form.querySelector('[name=debit]').value,
        amount: +form.querySelector('[name=amount]').value,
        note:    form.querySelector('[name=note]').value,
    };
    saveRecord(data);
});
