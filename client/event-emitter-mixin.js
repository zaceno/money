const EventEmitter = require('events');

module.exports = function (obj) {
    var ev = new EventEmitter();
    obj.on = ev.addListener.bind(ev);
    obj.off = ev.removeListener.bind(ev);
    obj.removeAllListeners = ev.removeAllListeners.bind(ev);
    obj.once = ev.once.bind(ev);
    obj.emit = ev.emit.bind(ev);
}
