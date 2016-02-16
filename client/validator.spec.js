const should = require('should');
const validator = require('./validator');

describe('validator', () => {
    describe('no rules defined', () => {
        describe('validate(any value)',  () => {
            it('returns null', () => {
                should(validator.validate('bob')).equal(null);
            });
        });
    });
    describe('chain with one rule', () => {
        var chained;
        beforeEach(()=>{
            chained = validator.chain((x) => { return x % 2 === 0; }, 'uneven');
        });
        describe('validate(not ok value)', () => {
            it('returns the error message of rule', () => {
                should(chained.validate(3)).equal('uneven');
            });
        });
        describe('validate ok value', () => {
            it('returns the error message of rule', () => {
                should(chained.validate(4)).equal(null);
            });
        });
        describe('get()->fn', () => {
            var fn;
            beforeEach(() => {
                fn = chained.get();
            });
            describe('fn(not ok value)', () => {
                it('returns the error message of rule', () => {
                    should(fn(3)).equal('uneven');
                });
            });
            describe('fn ok value', () => {
                it('returns the error message of rule', () => {
                    should(fn(4)).equal(null);
                });
            });
        })
    });
    describe('chain with two rules', () => {
        var chained;
        beforeEach(()=>{
            chained = validator.chain((x) => { return x % 2 === 0; }, 'uneven');
            chained = chained.chain((x) => {return x % 3 === 0 }, 'not multiple of three');
        });
        describe('validate(fail both)', () => {
            it('returns the error message of first rule', () => {
                should(chained.validate(5)).equal('uneven');
            });
        });
        describe('validate(fail second)', () => {
            it('returns the error message of second rule', () => {
                should(chained.validate(8)).equal('not multiple of three');
            });
        });
        describe('validate(passes both)', () => {
            it('returns the error message of rule', () => {
                should(chained.validate(12)).equal(null);
            });
        });
        describe('get() => fn', () => {
            var fn;
            beforeEach(() => { fn = chained.get() });
            describe('fn(fail both)', () => {
                it('returns the error message of first rule', () => {
                    should(fn(5)).equal('uneven');
                });
            });
            describe('fn(fail second)', () => {
                it('returns the error message of second rule', () => {
                    should(fn(8)).equal('not multiple of three');
                });
            });
            describe('fn(passes both)', () => {
                it('returns the error message of rule', () => {
                    should(fn(12)).equal(null);
                });
            });

        });
    });
    describe('define(name, rule, messasge)', () => {
        it('creates a reusable, parametrized, rule on the chain', () => {
            var fn = validator
            .chain(()=>{return true}, 'dummy')
            .define('multipleOf', (mul, x) => { return x % mul === 0;}, 'not multiple of %s')
            .chain((x) => { return x >= 20}, 'smaller than 20')
            .multipleOf(5)
            .get();
            should(fn(6)).equal('smaller than 20');
            should(fn(26)).equal('not multiple of 5');
            should(fn(30)).equal(null);
        });
    });
    describe('get()->fn.validator chain', () => {
        it('allows you to extend the chain after get first validator', () => {
            var fn1 = validator.chain((x) => {return x % 2 === 0 }, 'not multiple of 2').get();
            var fn2 = fn1.validator.chain((x) => {return x % 3 === 0}, 'not multiple of 3').get();
            should(fn2(7)).equal('not multiple of 2');
            should(fn2(8)).equal('not multiple of 3');
            should(fn2(12)).equal(null);
        });
    });
});
