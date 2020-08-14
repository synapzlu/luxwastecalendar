Connectors must :
- implement and export a getContent async function 

`module.exports.getContent = getContent;
async function getContent(mode) {
}`



- return a result object :

`{ name : "connector name,
  collecteList: data [
    {
      "uid": "5f29981612706",
      "event_date": 1577919600000,
      "city": "Luxembourg",
      "location": "Allée des Charmes",
      "streetNumbers": -1,
      "codepostal": 1372,
      "summary": "RESIDUAL"
    },
    {
      "uid": "5f299816171b3",
      "event_date": 1578438000000,
      "city": "Luxembourg",
      "location": "Allée des Charmes",
      "streetNumbers": -1,
      "codepostal": 1372,
      "summary": "RESIDUAL"
    }
  ]
}`

