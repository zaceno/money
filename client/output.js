const makeElement = require('./make-element');
const eventMixin = require('./event-emitter-mixin');
const fs = require('fs');
const tpl = fs.readFileSync(__dirname + '/output.html', 'utf-8');

var Output = function () {
    eventMixin(this);
    this.element = makeElement(tpl);
    Object.defineProperty(this, 'value', {
        configurable: true,
        enumerable: true,
        get: () => { return this.element.innerHTML; },
        set: (v) => {
            this.element.innerHTML = v;
            this.emit('update', v);
        },
    });
};


module.exports = Output;
