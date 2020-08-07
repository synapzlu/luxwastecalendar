# luxwastecalendar/web_crawler
Web crawler of waste pickup calendars in various cities in Luxembourg.
Datasets are matched against CACLR address database from data.public.lu

----------
# Functionalities
In the current version, it crowls from:
- www.vdl.lu
- www.sidec.lu
- www.valorlux.lu


Outputs 1 JSON file per postal code (total approx. 30 MB) containing all events from Luxembourg Ville.

Sample of one output JSON file :
```
[
  {
    "uid": "5e8a5f0732fc6",
    "event_date": "1608073200000",
    "city": "Luxembourg",
    "location": "Côte d'Eich",
    "streetNumbers": "1-25, 2-24",
    "codepostal": 1450,
    "summary": "BULKY"
  },
  {
    "uid": "5e8a5f074f2c3",
    "event_date": "1608505200000",
    "city": "Luxembourg",
    "location": "Côte d'Eich",
    "streetNumbers": "1-25, 2-24",
    "codepostal": 1450,
    "summary": "PAPER"
  },
  {
    "uid": "5e8a5f0760dcc",
    "event_date": "1608678000000",
    "city": "Luxembourg",
    "location": "Côte d'Eich",
    "streetNumbers": "1-25, 2-24",
    "codepostal": 1450,
    "summary": "GLASS"
  },
  {
    "uid": "5e8a5f07716b4",
    "event_date": "1608678000000",
    "city": "Luxembourg",
    "location": "Côte d'Eich",
    "streetNumbers": "1-25, 2-24",
    "codepostal": 1450,
    "summary": "ORGANIC"
  }
]
```

# Requirements
Developed and tested on Nodejs v12

# Usage
`node install`
`node index.js`
Output files can be found in output/${timestamp}/ folder

# Pickup types
| API Type | VDL                  | Sidec              | Valorlux | 
|----------|----------------------|--------------------|----------|
| BULKY    |                      | encombrants        |          |
| GLASS    | Verre                | verre              |          |
| ORGANIC  | Déchets alimentaires | dechets organiques |          |
| PAPER    | Papier/Carton        | papiers cartons    |          |
| PMC      | Emballages Valorlux  |                    | PMC      |
| RESIDUAL | Déchets résiduels    | dechets menagers   |          |
----------
# Known issues
## CACRL
- Several streets from "registre-national-des-localites-et-des-rues" resolve to null or empty postal codes. These streets are then ignored in waste calendar parsing.
## Valorlux
- No support for Esch-sur-Alzette, Differdange and Dudelange. Missing the mapping between postal codes and calendars
- No support for Pétange, Rodange, Lamadelaine and Walferdange. Need to add additional logic for those
## General
- Any change in data source format (json, html, ics ...) might break this library
----------
# Credits
Biggest credits go to data owners from the following web sites:
- https://data.public.lu/fr/datasets/registre-national-des-localites-et-des-rues/
- https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes/
- http://sidec.lu
- https://calendar.valorlux.lu/
----------
# Roadmap
List of identified sources to be crawled:

## Bertrange, Garnich, Kehlen, Koerich, Kopstal, Mamer, Steinfort, Habscht
- https://sicaapp.lu/
- format: html and pdf

## Differdange
- https://differdange.lu/wp-content/uploads/2020/01/Emweltkalenner.pdf
- format: pdf
