const jsdom = require('jsdom');
global.document = jsdom.jsdom('<html><head></head><body></body></html');
global.window = document.defaultView;
const should = require('should');
const transactionDB = require('../transaction-db');
const TransactionModel = require('../transaction/model.js');
const App = require('../app.js');

describe('form entry', function () {
    var app;
    beforeEach(function () {
        return transactionDB.allDocs({include_docs: true}).then((res) => {
            return Promise.all(res.rows.map((row) => {
                return transactionDB.remove(row.id, row.value.rev);
            }));
        });
    });
    beforeEach(function () {
        app = new App();
    });
    describe('form initially', function () {
        it('is empty', function () {
            app.form.fields.date.input.value.should.equal('');
            app.form.fields.amount.input.value.should.equal('');
            app.form.fields.note.input.value.should.equal('');
        });
        it('has initial state', function () {
            app.form.state.should.equal('initial');
        });
    });
    describe('invalid entry', function () {
        var saveCalled;

        beforeEach(function () {
            saveCalled = false;
            app.output.on('update', function () {
                saveCalled = true;
            });
            app.form.fields.date.input.value = 'notadate';
            app.form.fields.amount.input.value = 'notanumber';
            app.form.fields.note.input.value = 'somenote';
            app.form.submit();
        });
        it('does not save anything"', function (done) {
            process.nextTick(function () {
                saveCalled.should.equal(false);
                done();
            });
        });
        it('keeps bad values in form', function () {
            app.form.fields.date.input.value.should.equal('notadate');
            app.form.fields.amount.input.value.should.equal('notanumber');
            app.form.fields.note.input.value.should.equal('somenote');;
        });
        it('registers validation errors in the form', function () {
            app.form.fields.date.error.should.equal('wrong format');
            app.form.fields.amount.error.should.equal('not a number');
        });
        it('form has error state', function () {
            app.form.state.should.equal('error');
        });
    });
    describe('valid entry', function () {
        var input;
        beforeEach(function () {
            input = {
                date: '2012-12-12',
                credit: 'income',
                debit: 'groceries',
                amount: 999,
                note: 'somenote',
            };

            Object.keys(input).forEach((k) => {
                app.form.fields[k].input.value = input[k];
            });
            app.form.submit();
        });
        describe('while saving', function () {
            it('should have saving state', function () {
                app.form.state.should.equal('saving');
            });
        });
        describe('after saving', function () {
            var output = '';
            beforeEach(function (done) {
                app.output.once('update', function (str) {
                    output = str;
                    done();
                });
            });
            it('outputs the newly saved item', function () {
                var o = JSON.parse(output);
                Object.keys(input).forEach((k) => {
                    o.should.have.property(k, input[k]);
                });
                o.should.have.property('_id');
                o.should.have.property('_rev');
                o._rev.should.startWith('1-');
            });
            it('shuould have reset values' ,function () {
                app.form.fields.date.input.value.should.equal('');
                app.form.fields.amount.input.value.should.equal('');
                app.form.fields.note.input.value.should.equal('');
            });
            it('should be in initial state', function () {
                app.form.state.should.equal('initial');
            });
        });
    });
});
