const fs = require('fs');
const ejs = require('ejs');
const makeElement = require('../../make-element');
const tpl = fs.readFileSync(__dirname + '/option-input.html', 'utf-8');
var OptionInput = function (data) {
    this.element =  makeElement(tpl, data);
    Object.defineProperty(this, 'value', {
        configurable: true,
        enumerable: true,
        get: () => {
            return '' + this.element.value;
        },
        set: (v) => {
            this.element.value = v;
        },
    });
};

module.exports = OptionInput;
