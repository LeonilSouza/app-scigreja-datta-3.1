// Arquivo exigida pela platataforma Heroku
const express = require('express')
const path = require('path')
const app = express();

// const appName = 'sc-igreja'



app.use(express.static(__dirname + '/dist'))

app.get('/*', (req, res)=>{
      res.sendFile(path.join(__dirname + '/dist/index.html'))
});

app.listen(process.env.PORT || 8000)

//  antes funcionava com este. Tive que remover a variavel do nome do appName

// const express = require('express')
// const path = require('path')
// const app = express();

// const appName = 'sc-igreja'

// app.use(express.static(__dirname + `/dist/${appName}`))

// app.get('/*', (req, res)=>{
//       res.sendFile(path.join(__dirname + `/dist/${appName}/index.html`))
// });

// app.listen(process.env.PORT || 8000)