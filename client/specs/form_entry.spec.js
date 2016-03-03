const jsdom = require('jsdom');
global.document = jsdom.jsdom('<html><head></head><body></body></html');
global.window = document.defaultView;
const should = require('should');
const TransactionModel = require('../transaction/model.js');
const App = require('../app.js');

describe('form entry', function () {
    var app;
    beforeEach(function () {
        TransactionModel.empty();
    });
    beforeEach(function () {
        app = new App();
    });
    afterEach(function () {
        TransactionModel.removeAllListeners();
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
            TransactionModel.on('created', function () {
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
            beforeEach(function () {
                return new Promise((resolve, reject) => {
                    TransactionModel.on('created', resolve);
                }).then(() => {
                    return new Promise((resolve, reject) => {
                        app.list.on('change', resolve);
                    });
                });
            });
            it('outputs the newly saved item', function () {
                app.list.items[0].should.have.property('_id');
                app.list.items[0].should.have.property('_rev');
                app.list.items[0]._rev.should.startWith('1-');
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
