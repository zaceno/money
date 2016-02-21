const fs = require('fs');
const makeElement = require('../../make-element');
const html = fs.readFileSync(__dirname + '/input.html', 'utf-8');

var NumberInput = function (opts) {
    opts.type = 'number';
    opts.name = opts.name || '',
    opts.value = opts.value || '',
    this.element = makeElement(html, opts);
    Object.defineProperty(this, 'value', {
        configurable: true,
        enumerable: true,
        get: () => {
            return +this.element.value;
        },
        set: (v) => {
            this.element.value = v;
        },
    });
};

module.exports = NumberInput;
