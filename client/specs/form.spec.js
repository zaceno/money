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
    var form;
    beforeEach(function () {
        return transactionDB.allDocs().then((res) => {
            return Promise.all(res.rows.map((row) => {
                return transactionDB.remove(row.id, row.value.rev);
            }));
        });
    });
    beforeEach(function () {
        form = new TransactionForm();
    });
    describe('valid entry', function () {
        beforeEach(function () {
            form.fields.date.input.value = '2012-12-12';
            form.fields.credit.input.value = 'income';
            form.fields.debit.input.value = 'groceries';
            form.fields.amount.input.value = 999;
            form.fields.note.input.value = 'somenote';
            form.submit();
        });
        describe('while saving', function () {
            it('should have disabled state', function () {
                form.fields.date.input.disabled.should.equal(true);
                form.fields.credit.input.disabled.should.equal(true);
                form.fields.debit.input.disabled.should.equal(true);
                form.fields.amount.input.disabled.should.equal(true);
                form.fields.note.input.disabled.should.equal(true);
                form.submitButton.disabled.should.equal(true);
            });
        });
        describe('after saving', function () {
            beforeEach(function (done) {
                form.on('saved', function () { done(); });
            });
            it('new transaction added in database', function () {
                return Transaction.list().then(function (transactions) {
                    transactions.length.should.equal(1);
                    var t = transactions[0];
                    t.date.should.equal('2012-12-12');
                    t.credit.should.equal('income');
                    t.debit.should.equal('groceries');
                    t.amount.should.equal(999);
                    t.note.should.equal('somenote');
                });
            });
            it('should be in initial state', function () {
                form.fields.date.input.disabled.should.equal(false);
                form.fields.credit.input.disabled.should.equal(false);
                form.fields.debit.input.disabled.should.equal(false);
                form.fields.amount.input.disabled.should.equal(false);
                form.fields.note.input.disabled.should.equal(false);
                form.submitButton.disabled.should.equal(false);
                form.fields.date.input.value.should.equal('');
                form.fields.amount.input.value.should.equal('');
                form.fields.note.input.value.should.equal('');
            });
        });
    });
});
