const fs = require('fs');
const ejs = require('ejs');
const makeElement = require('../make-element');
const tpl = fs.readFileSync(__dirname + '/option-input.html', 'utf-8');
var OptionInput = function (data) {
    this.element =  makeElement(tpl, data);
    this.value = function () {
        return this.element.value;
    };
};

module.exports = OptionInput;
