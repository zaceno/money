
var util = {
    forEach: function (o, fn) {
        Object.keys(o).forEach((k) => {
            if (!o.hasOwnProperty(k)) return;
            fn(o[k], k, o);
        });
    },

    map: function (src, fn, tgt) {
        var tgt = tgt || {};
        util.forEach(src, (v, k) => { tgt[k] = fn(v); });
        return tgt;
    },

    values: function (o, keys) {
        keys = keys || Object.keys(o);
        return keys.map((k) => { return o[k]; });
    },

    copy: function (src, tgt) {
        util.map(src, (v) => { return v; }, tgt);
    },
};

module.exports = util;
