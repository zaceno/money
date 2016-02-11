const fs = require('fs');
const makeElement = require('../make-element');
const html = fs.readFileSync(__dirname + '/input.html', 'utf-8');

var NumberInput = function (opts) {
    opts.type = 'number';
    opts.name = opts.name || '',
    opts.value = opts.value || '',
    this.element = makeElement(html, opts);
    this.value = () => { return +this.element.value; };
};

module.exports = NumberInput;
