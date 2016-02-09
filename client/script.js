
var output = document.querySelector('pre#output');
var form = document.querySelector('form');
form.addEventListener('submit', function (e) {
    e.preventDefault(true);
    var data = {
        date:    form.querySelector('[name=date]').value,
        credit:  form.querySelector('[name=credit]').value,
        debit:   form.querySelector('[name=debit]').value,
        amount: +form.querySelector('[name=amount]').value,
        note:    form.querySelector('[name=note]').value,
    };
    output.innerHTML = JSON.stringify(data);
});
