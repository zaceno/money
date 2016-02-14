
var validator = {

    _assertion:  function () {},



    validate: function (x) {
        try {
            this._assertion(x);
            return null;
        } catch (e) {
            return e;
        }
    },



    get: function () {
        var f = this.validate.bind(this);
        f.validator = this;
        return f;
    },



    chain: function (fn, msg) {
        var v = Object.create(this);
        var assert = this._assertion.bind(this);
        v._assertion = (x) => {
            assert(x);
            if (!fn(x)) throw msg;
        };
        return v;
    },



    define: function (name, fn, msg) {
        this[name] = function () {
            return this.chain(fn.bind.apply(fn, [null].concat(Array.prototype.slice.call(arguments))), msg);
        };
    },
};



[
    [ 'exists',             (x) => { return (typeof x !== 'undefined' && x !== '') }, 'required'],
    [ 'hasFormat',    (fmt, x) => { return x.match(fmt) },                            'wrong format'],
    [ 'isDate',            (x) => { return !isNaN(Date.parse(x))},                    'not a date'],
    [ 'isBefore',       (t, x) => { return Date.parse(x) <= t},                       'too late'],
    [ 'isOption',    (opts, x) => {return opts.indexOf(x) > -1},                      'invalid option'],
    [ 'isNumber',          (x) => {return !isNaN(+x)},                                'not a number'],
    [ 'atLeast',      (min, x) => { return (x >= min)},                               'too small'],
    [ 'atMost',       (max, x) => { return (x <= max)},                               'too large'],
    [ 'atLongest', (maxlen, x) => { return x.length <= maxlen},                       'too long'],
].forEach((def) => {
    validator.define.apply(validator, def)
});


module.exports = validator;
