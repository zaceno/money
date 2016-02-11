const fs = require('fs');
const makeElement = require('../make-element');
const html = fs.readFileSync(__dirname + '/input.html', 'utf-8');

var TextInput = function (opts) {
    opts.type = 'text';
    opts.name = opts.name || '',
    opts.value = opts.value || '',
    this.element = makeElement(html, opts);
    this.value = () => { return '' + this.element.value; };
};

module.exports = TextInput;
