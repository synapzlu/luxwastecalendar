const utils = require('./utils');

describe('Utils', () => {
    test('Timestamp must be greater than a reference one',() => {
        expect(Number(utils.initDatetimestamp())).toBeGreaterThan(60820212530);
    })

    let d1 = 1598392800000;
    let d2 = 1598392900000;
    test('Date1 must be greater than date2',() => {
        expect(utils.sortByDate(d1,d2)).toBe(-1);
        expect(utils.sortByDate(d2,d1)).toBe(1);
    })
    test('Date1 must be equal to date1',() => {
        expect(utils.sortByDate(d1,d1)).toBe(0);
    })
})
