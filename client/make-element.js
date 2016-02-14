var html2Element = function (html) {
    var div = document.createElement(div);
    div.innerHTML = html;
    var el = div.firstChild;
    div.removeChild(div.firstChild);
    return el;
};

var render = function(str, values) {
    if (!values) return html2Element(str);

    var placeholders = {};
    var dataMap = function (val, key) {
        if (Array.isArray(val)) {
            return val.map(dataMap);
        }
        if (val instanceof HTMLElement && !!key) {
            placeholders[key] = val;
            return '<div class="placeholder" id="' + key + '">';
        };
        if (!!val && typeof val === 'object') {
            var val2 = {};
            Object.keys(val).forEach((key2) => {
                if (!val.hasOwnProperty(key2)) return;
                val2[key2] = dataMap(val[key2], key2);
            });
            return val2;
        }
        return val;
    }
    var mapped = dataMap(values);
    var element = html2Element(ejs.render(str, mapped));
    Object.keys(placeholders).forEach((key) => {
        var pl = element.querySelector('div.placeholder#' + key);
        pl.parentNode.replaceChild(placeholders[key], pl);
    });
    return element;
};

module.exports = render;
