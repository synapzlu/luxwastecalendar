const fs = require('fs');

describe('Valorlux list', () => {
    const file = JSON.parse(fs.readFileSync('./output/latest/valorlux.json'));    
    test('file exists',() => {
        expect(file).not.toBe(null);
    })
    test('file should have at least 1 record',() => {
        expect(file.length).toBeGreaterThan(1);
    })
    test('file should have at least 500 records',() => {
        expect(file.length).toBeGreaterThan(500);
    })
    test('all entries must have a valid summary',() => {
        for (e of file) {
            expect(e.summary).toBeTruthy();
            expect(e.codepostal).toBeTruthy();
            expect(e.city).toBeTruthy();
        }
    })
})

describe('VDL list', () => {
    const file = JSON.parse(fs.readFileSync('./output/latest/vdl.json'));    
    test('file exists',() => {
        expect(file).not.toBe(null);
    })
    test('file should have at least 1 record',() => {
        expect(file.length).toBeGreaterThan(1);
    })
    test('file should have at least 500 records',() => {
        expect(file.length).toBeGreaterThan(500);
    })
    test('all entries must have a valid summary',() => {
        for (e of file) {
            expect(e.summary).toBeTruthy();
            expect(e.codepostal).toBeTruthy();
            expect(e.city).toBeTruthy();
        }
    })
})


describe('Sidec list', () => {
    const file = JSON.parse(fs.readFileSync('./output/latest/sidec.json'));    
    test('file exists',() => {
        expect(file).not.toBe(null);
    })
    test('file should have at least 1 record',() => {
        expect(file.length).toBeGreaterThan(1);
    })
    test('file should have at least 500 records',() => {
        expect(file.length).toBeGreaterThan(500);
    })
    test('entries must have a valid summary',() => {
        for (e of file) {
            expect(e.summary).toBeTruthy();
            expect(e.codepostal).toBeTruthy();
            expect(e.city).toBeTruthy();
        }
    })
})


describe('Full list', () => {
    const file = JSON.parse(fs.readFileSync('./output/latest/full.json'));    
    test('full file exists',() => {
        expect(file).not.toBe(null);
    })
    test('full file should have at least 1 record',() => {
        expect(file.length).toBeGreaterThan(1);
    })
    test('full file should have at least 100000 records',() => {
        expect(file.length).toBeGreaterThan(100000);
    })
})


