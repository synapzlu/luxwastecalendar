const sidec = require('./sidec');

test('complete url is built', () => {
    expect(sidec.getCommuneUrl("2020","Merch")).toBe("http://sidec.lu/fr/Collectes/Calendrier?annee=2020&myCommune=Merch");
})