// ICS files have the following content :

// BEGIN:VEVENT
// UID:5e81089110e24
// DTSTART;VALUE=DATE:20200106
// SEQUENCE:0
// TRANSP:OPAQUE
// DTEND;VALUE=DATE:20200107
// LOCATION:Allée de l'Unioun Luxembourg
// SUMMARY:Déchets résiduels
// CLASS:PUBLIC
// X-MICROSOFT-CDO-ALLDAYEVENT:TRUE
// DTSTAMP:20200329T204401Z
// END:VEVENT


module.exports = class Collecte {

  constructor(uid, event_date, city, location, codepostal, summary) {
    this.uid = uid;    
    this.event_date = event_date;
    this.city = city;
    this.location = location;
    this.codepostal = codepostal;
    this.summary = summary;
  }
}

var uid;
var event_date;
var location;
var city;
var codepostal;
var summary;

