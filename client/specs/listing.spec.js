const jsdom = require('jsdom');
global.document = jsdom.jsdom('<html><head></head><body></body></html');
global.window = document.defaultView;
const should = require('should');
const App = require('../app.js');
const TransactionModel = require('../transaction/model');
describe('listing', function () {

    beforeEach(function () {
        return TransactionModel.empty();
    });

    it('initially contains all the items in the database at start', function () {
        var tx1 = TransactionModel.create({date: '2012-02-02', credit: 'income', debit: 'groceries', amount:100, note: 'testnote1'});
        var tx2 = TransactionModel.create({date: '2013-03-03', credit: 'common', debit: 'other', amount:111, note: 'testnote2'});
        var app;
        return Promise.all([tx1, tx2])
        .then(() => { app = new App() })
        .then(() => {
            return new Promise((resolve, reject) => { app.list.on('change', resolve) });
        })
        .then(() => {
            app.list.items.length.should.equal(2);
            app.list.items[0].date.should.equal('2013-03-03');
            app.list.items[0].amount.should.equal(111);
            app.list.items[1].date.should.equal('2012-02-02');
            app.list.items[1].amount.should.equal(100);
        });
    });

    it('updates list when new item saved through model', function () {
        var tx1 = TransactionModel.create({date: '2012-02-02', credit: 'income', debit: 'groceries', amount:100, note: 'testnote1'});
        var tx2 = TransactionModel.create({date: '2013-03-03', credit: 'common', debit: 'other', amount:111, note: 'testnote2'});
        var app;
        return Promise.all([tx1, tx2])
        .then(() => {
            app = new App()
        })
        .then(() => {
            return new Promise((resolve, reject) => { app.list.on('change', resolve) });
        })
        .then(() => {
            TransactionModel.create({
                date: '2014-04-04',
                credit: 'income',
                debit: 'bills',
                amount: 222,
                note: 'testadd',
            });
        })
        .then(() => {
            return new Promise((resolve, reject) => { app.list.on('change', resolve) });
        })
        .then(() => {
            app.list.items.length.should.equal(3);
        });
    });

    afterEach(function () {
        TransactionModel.removeAllListeners();
    })
})
