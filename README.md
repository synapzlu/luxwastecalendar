# luxwastecalendar
Web crawler of waste pickup calendars in various cities in Luxembourg.
Datasets are matched with CACLR address database from data.public.lu

----------
# Functionalities
In this preliminary version, will only crawl from www.vdl.lu.
Outputs 1 JSON file per postal code (total approx. 30 MB) containing all events from Luxembourg Ville.

Sample of one output JSON file :
```
[
  {
    "uid": "5e8a5f0732fc6",
    "event_date": "2020-01-01T23:00:00.000Z",
    "city": "Luxembourg",
    "location": "Côte d'Eich",
    "streetNumbers": "1-25, 2-24",
    "codepostal": 1450,
    "summary": "Déchets résiduels"
  },
  {
    "uid": "5e8a5f074f2c3",
    "event_date": "2020-01-02T23:00:00.000Z",
    "city": "Luxembourg",
    "location": "Côte d'Eich",
    "streetNumbers": "1-25, 2-24",
    "codepostal": 1450,
    "summary": "Papier/Carton"
  },
  {
    "uid": "5e8a5f0760dcc",
    "event_date": "2020-01-02T23:00:00.000Z",
    "city": "Luxembourg",
    "location": "Côte d'Eich",
    "streetNumbers": "1-25, 2-24",
    "codepostal": 1450,
    "summary": "Verre"
  },
  {
    "uid": "5e8a5f07716b4",
    "event_date": "2020-01-02T23:00:00.000Z",
    "city": "Luxembourg",
    "location": "Côte d'Eich",
    "streetNumbers": "1-25, 2-24",
    "codepostal": 1450,
    "summary": "Déchets alimentaires"
  }
]
```

# Requirements
Developed and tested on Nodejs v12

# Usage
`node index.js`
Output files can be found in output/${timestamp}/ folder

----------
# Known issues
- Several streets from "registre-national-des-localites-et-des-rues" resolve to null or empty postal codes. These streets are then ignored in waste calendar parsing.

# Credits
- https://data.public.lu/fr/datasets/registre-national-des-localites-et-des-rues/
- https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes/

# Roadmap
List of identified sources to be crawled:
## VDL
- https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes/
- format: ics

## Bertrange, Garnich, Kehlen, Koerich, Kopstal, Mamer, Steinfort, Habscht
- https://sicaapp.lu/
- format: html and pdf

## Differdange
- https://differdange.lu/wp-content/uploads/2020/01/Emweltkalenner.pdf
- format: pdf

## Center and Nord
- http://sidec.lu/fr/Collectes/Calendrier?annee=2020&myCommune=1042
- format: html

## Country (Valorlux)
- https://calendar.valorlux.lu/
- format: html and pdf
