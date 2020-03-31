# luxwastecalendar
Web crawler of waste pickup calendars in various cities in Luxembourg.
Datasets are matched with CACLR address database from data.public.lu

----------
# Functionalities
In this preliminary version, will only crawl from www.vdl.lu.
Outputs a single JSON file (approx. 30 MB) containing all events from Luxembourg Ville, enriched with postal codes.

# Requirements
Developed and tested on Nodejs v12

# Usage
`node index.js`
Output files can be found in tmp/ folder

----------
# Known issues
Several streets in Luxembourg-Ville have 2 different waste pickup calendars. This is not handled yet and all street entries will have a null postal code.

# Credits
- https://data.public.lu/fr/datasets/registre-national-des-localites-et-des-rues/
- https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes/

# Roadmap
The list of potential sources to be crawled are listed in: [sources.md](sources.md)