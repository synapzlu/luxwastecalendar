const utils = require('../utils');

describe('Utils', () => {
    test('Timestamp must be greater than a reference one',() => {
        expect(Number(utils.initDatetimestamp())).toBeGreaterThan(60820212530);
    })


    test('Date1 must be greater than date2',() => {
        let d1 = 1598392800000;
        let d2 = 1598392900000;

        expect(utils.sortByDate(d1,d2)).toBe(-1);
        expect(utils.sortByDate(d2,d1)).toBe(1);
        expect(utils.sortByDate(d1,d1)).toBe(0);
    })


    test('City name normalization',() => {
        expect(utils.normalizeCityName("Diekrich")).toBe("Diekirch");
        expect(utils.normalizeCityName("TOTO")).toBe("TOTO");
    })
    

    test('Postal codes by city names',() => {
        let expectedPostalCodes = [7593, 7409, 7592, 7591, 7590, 7594, 7759, 7424, 7526, 7568, 7524, 7410, 7543, 7572, 7560, 7559, 7534, 7599, 7541, 7545, 7521, 7533, 7556, 7512, 7513, 7571, 7522, 7535, 7517, 7525, 7536, 7554, 7562, 7561, 7563, 7569, 7519, 7514, 7515, 7566, 7531, 7538, 7544, 7565, 7463, 7573, 7520, 7553, 7555, 7542, 7557, 7570, 7564, 7523, 7462, 7464, 7415, 7425, 7598, 7597, 7596, 7595, 7511, 7567, 7539, 7558, 7532, 7540, 7546, 7516, 7518, 7527, 
            7547, 7537, 7473];

        expect(utils.getPostalCodesByCityName("Mersch")).toEqual(expectedPostalCodes);
    })
    
})
