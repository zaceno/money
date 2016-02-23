
/*

transactionFormPresenter, uses a transactionFormView, to render the
transactionModel, on submit extracts the values from the form element, validates them
and of ok, pass them on to the transaction model. if not, the errors are rendered
back into the form.

with bindings, the presenter has a computed errors object, which will cause
the form to rerender, and a reference to the model object. then raises a save event
for the model.

that means that the form has a view which is the actual template.
a model which contains the fields, errors etc, and a presenter, which
causes the render when things change. then binds the onsubmit of the Form
to be the data check and data move. And if the data is ok,


render the Form
etner values into the fields (bda)
simulate submit of the Form
assert form has rerendered with errors

//new
render form
enter good values
simultate submit

render Form
set a model
enter other bad values
simulate submit
assert no submit triggered
assert values same still
enter other good values
simulate submit
get save() event.
retrieve model from Form
assert modelinstacnce has new entered values
assert modelinstance is same instance as it was before.
Assert that the model instance was not touched until the save event,
after the valids.
(so we can have it reactive and not worried it will change during)

so the form doesnt even need to *have* the model object, it can just be
pointed to it, and it will refer to it. But if it's not got one, it points
to a new default one.


transactionModel has date, et c. It has save methods (to save it in database)
and factory methods to create new ones.

transactionFormView jsut renders some transaction data, and errors

transactionForm, has object reference or refers to new one. renders the form,
with the values it gets from the model. Validates form values and rerenders,
onsubmit saves the transaction object.

for testing, the form component needs to expose a simulated submit
also, needs to expose a way to set values, get values, and get errors it has
rendered. But what if we pass the form component a fake element that
fakeyly triggers submit events, provides values, and renders itself with
errors it gives.

How does form component deal with child objects?
Well it could set it's rendering to elements of child components.  like now.

then how would we access the values? Well we could mock the view of each (but
how do we really mock the views? It asks to render a thing) and then how
would we know which one it is rendering for what?

Or it could expose it's children: such as it does:

form.date.input.value()
form.date.input.element()
form.submit()
form.on('submit')
form.fields['date']. each field should expose a way to set/get value.


so form.model = (allows you to set new model)
form.model (allows you to get new model, if any set, or any errors)

*/
process.env.mode = 'test';
const jsdom = require('jsdom');
global.document = jsdom.jsdom('<html><head></head><body></body></html');
global.window = document.defaultView;
const should = require('should');
const TransactionForm = require('../transaction/form.js');
const Transaction = require('../transaction/model.js');
const transactionDB = require('../transaction-db');

describe('Invalid entry into new model', function () {
    var form;
    beforeEach(function () {
        form = new TransactionForm();
        form.fields.date.input.value = 'notadate';
        form.fields.amount.input.value = 'notanumber';
        form.fields.note.input.value = 'somenote';
        form.submit();
    });
    it ('renders the errors', function () {
        form.errors.should.equal(true);
        form.fields.date.error.should.equal('wrong format');
        form.fields.amount.error.should.equal('not a number');
    });
    it('provides null for a model', function () {
        should(form.model).equal(null);
    });
});
describe('Valid entry into new model', function () {
    var form;
    beforeEach(function () {
        form = new TransactionForm();
        form.fields.date.input.value = '2012-12-12';
        form.fields.credit.input.value = 'income';
        form.fields.debit.input.value = 'groceries';
        form.fields.amount.input.value = 999;
        form.fields.note.input.value = 'somenote';
        form.submit();
    });
    it ('has no errors', function () {
        form.errors.should.equal(false);
        should(form.fields.date.error).equal(null);
        should(form.fields.debit.error).equal(null);
        should(form.fields.credit.error).equal(null);
        should(form.fields.amount.error).equal(null);
        should(form.fields.note.error).equal(null);
    });
    it('provides valid transaction for a model', function () {
        form.model.should.be.instanceof(Transaction);
        form.model.date.should.equal('2012-12-12');
        form.model.credit.should.equal('income');
        form.model.debit.should.equal('groceries');
        form.model.amount.should.equal(999);
        form.model.note.should.equal('somenote');
    });
});




describe('Saving', function () {
    beforeEach(function () {
        return transactionDB.allDocs().then((res) => {
            return Promise.all(res.rows.map((row) => {
                return transactionDB.remove(row.id, row.value.rev);
            }));
        });
    });
    it('adds new transaction to database', function (done) {
        var form = new TransactionForm();
        form.fields.date.input.value = '2012-12-12';
        form.fields.credit.input.value = 'income';
        form.fields.debit.input.value = 'groceries';
        form.fields.amount.input.value = 999;
        form.fields.note.input.value = 'somenote';
        form.on('saved', function () {
            Transaction.list().then(function (transactions) {
                transactions.length.should.equal(1);
                var t = transactions[0];
                t.date.should.equal('2012-12-12');
                t.credit.should.equal('income');
                t.debit.should.equal('groceries');
                t.amount.should.equal(999);
                t.note.should.equal('somenote');
                done();
            }).catch(done);
        });
        form.submit();
        form.state.should.equal('saving');
    });
});
