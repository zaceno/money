

var assertion = (fn, msg) => {
    return (arg) => {
        return (x) => {
            if (!fn(x, arg)) throw msg;
        };
    };
};

module.exports = {
    exists:          assertion((x) => { return (typeof x !== 'undefined' && x !== '') }, 'required'),
    hasFormat:       assertion((x, fmt) => { return x.match(fmt) }, 'wrong format'),
    isDate:          assertion((x) => { return !isNaN(Date.parse(x))}, 'not a date'),
    isBefore:        assertion((x, t) => { return Date.parse(x) <= t}, 'too late'),
    isOption:        assertion((x, opts) => {return opts.indexOf(x) > -1}, 'invalid option'),
    isNumber:        assertion((x) => {return !isNaN(+x)}, 'not a number'),
    atLeast:         assertion((x, min) => { return (x >= min)}, 'too small'),
    atLongest:       assertion((x, maxlen) => { return x.length <= maxlen}, 'too long'),
    objectValidator: function (validators) {
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
    },
}
