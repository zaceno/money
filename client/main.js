const Form = require('./form/form.js');
const Output = require('./output');



var form = new Form();
var output = new Output();

var write = output.set.bind(output);
form.on('save',  write);
form.on('invalid', write);

var container = document.querySelector('#container');
container.appendChild(form.element);
container.appendChild(output.element);
