module.exports = class Address {

    constructor(canton, district, commune, localite, rue, codePostal) {
      this.canton = canton;    
      this.district = district;
      this.commune = commune;
      this.localite = localite;
      this.rue = rue;
      this.codePostal = codePostal;
    }
  }
  
  var canton;
  var district;
  var commune;
  var localité;
  var rue;
  var codePostal;