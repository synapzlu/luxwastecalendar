const sidec = require('../connectors/sidec');

test('complete url is built', () => {
    expect(sidec.getCommuneUrl("2020","Merch")).toBe("http://sidec.lu/fr/Collectes/Calendrier?annee=2020&myCommune=Merch");
})

test('multiple type extraction from image file name', () => {
    expect(sidec.extractTypes("dechets menagers verre")).toEqual(['RESIDUAL', 'GLASS']);
    expect(sidec.extractTypes("papiers cartons")).toEqual(['PAPER']);    
})