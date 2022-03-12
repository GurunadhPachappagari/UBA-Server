const express = require('express');
const cors = require("cors");
const app = express();
const PORT = 8080;
const fs=require('fs');
const req = require('express/lib/request');
const Helpers = require('./js/CalcData.js');

app.use( express.json() );
app.use( cors() );

app.listen(
    PORT,
    () => console.log(`it is alive on http://localhost:${PORT}`)
);

app.get('/', (req, res) => {
    res.status(200).send({
        data: 'Welcome to UBA-Server'
    })
})

app.post('/data', (req, res) => {
    const {column} = req.body;

    if(!column){
        res.status(420).send({message: 'the column does not exist'})
    }
    res.send({labels: ['neem', 'coconut'], values: [21, 32], type: 'pie'})
})

// resonding with the list of datasets available
app.post('/file_paths', (req, res) => {
    var file_path = fs.readdirSync("./assets/survey_data");
    for(var i = 0; i < file_path.length; i++){
        file_path[i] = "assets/survey_data/" + file_path[i];
    }
    res.send({files : file_path});
})


app.post('/column', (req, res) => {
    const {file_path} = req.body;
    var [columnList, plotType] = Helpers.CalcData(file_path);
    res.send({columns: columnList, plotType: plotType});
})

app.post('/get_stats', (req, res) => {
    const {file_path} = req.body;
    const {column} = req.body;
    const {plotType} = req.body;
    const {bins} = req.body;
    var [label, freq] = Helpers.GetStats(file_path, column, plotType, bins);
    res.send({"label": label, "freq": freq});
})
