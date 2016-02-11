const fs = require('fs');
const ejs = require('ejs');
const makeElement = require('../make-element');
const tpl = fs.readFileSync(__dirname + '/dropdown.html', 'utf-8');
var Dropdown = function (data) {
    this.element =  makeElement(tpl, data);
    this.value = function () {
        return this.element.value;
    };
};

module.exports = Dropdown;
