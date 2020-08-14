const valorlux = require('../connectors/valorlux');
const Collecte = require('../classes/Collecte');

describe('Valorlux', () => {

    let testData = {
        "cities": {
            "Beaufort": {
                "1": [
                    "31\/12\/19"]
            }
        }
    };

    let testExpectedResult = {
        collecteList: [
            {
                'city': 'Beaufort',
                'codepostal': 6315,
                'event_date': 1577746800000,
                'location': '',
                'streetNumbers': '',
                'summary': 'PMC',
                'uid': ''
            },
            {
                'city': 'Beaufort',
                'codepostal': 6316,
                'event_date': 1577746800000,
                'location': '',
                'streetNumbers': '',
                'summary': 'PMC',
                'uid': ''
            },
            {
                'city': 'Beaufort',
                'codepostal': 6314,
                'event_date': 1577746800000,
                'location': '',
                'streetNumbers': '',
                'summary': 'PMC',
                'uid': ''
            },
            {
                'city': 'Beaufort',
                'codepostal': 6310,
                'event_date': 1577746800000,
                'location': '',
                'streetNumbers': '',
                'summary': 'PMC',
                'uid': ''
            },
            {
                'city': 'Beaufort',
                'codepostal': 6312,
                'event_date': 1577746800000,
                'location': '',
                'streetNumbers': '',
                'summary': 'PMC',
                'uid': ''
            },
            {
                'city': 'Beaufort',
                'codepostal': 6311,
                'event_date': 1577746800000,
                'location': '',
                'streetNumbers': '',
                'summary': 'PMC',
                'uid': ''
            },
            {
                'city': 'Beaufort',
                'codepostal': 6313,
                'event_date': 1577746800000,
                'location': '',
                'streetNumbers': '',
                'summary': 'PMC',
                'uid': ''
            },
            {
                'city': 'Beaufort',
                'codepostal': 6350,
                'event_date': 1577746800000,
                'location': '',
                'streetNumbers': '',
                'summary': 'PMC',
                'uid': ''
            },
            {
                'city': 'Beaufort',
                'codepostal': 6360,
                'event_date': 1577746800000,
                'location': '',
                'streetNumbers': '',
                'summary': 'PMC',
                'uid': ''
            }
        ]
    };

    test('Parse data must be correct', () => {
        expect(valorlux.parseContent(testData)).toEqual(testExpectedResult);
    });
})
