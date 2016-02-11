const fs = require('fs');
const makeElement = require('./make-element');
const tpl = fs.readFileSync(__dirname + '/output.html', 'utf-8');

var Output = function (obj) {
    this.element = makeElement(tpl);
    this.set = (obj) => { this.element.innerHTML = JSON.stringify(obj) };
    obj && this.set(obj);
};


module.exports = Output;
