const Form = require('./form/form.js');
const Output = require('./output');

var output = new Output();
var form = new Form();
form.on('submit',  output.set.bind(output));

var container = document.querySelector('#container');
container.appendChild(form.element);
container.appendChild(output.element);
