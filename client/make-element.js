var html2Element = function (html) {
    var div = document.createElement(div);
    div.innerHTML = html;
    var el = div.firstChild;
    div.removeChild(div.firstChild);
    return el;
};

var render = function(str, data) {
    var elements = {};
    var html;
    if (data) {
        Object.keys(data).forEach((key) => {
            if (data[key] instanceof HTMLElement) {
                elements[key] = data[key];
                data[key] = '<div class="placeholder" id="' + key + '">';
            }
        });
        html = ejs.render(str, data);
    } else {
        html = str;
    }
    var element = html2Element(html);
    Object.keys(elements).forEach((key) => {
        var pl = element.querySelector('div.placeholder#' + key);
        pl.parentNode.replaceChild(elements[key], pl);
    })
    return element;
};

module.exports = render;
