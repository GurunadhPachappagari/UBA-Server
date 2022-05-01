const express = require('express');
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const PORT = 8080;
const HOST = '192.168.1.197';
const fs = require('fs');
const req = require('express/lib/request');
const Helpers = require('./js/CalcData.js');

///////////////////////////

// var http = require('http');
var https = require('https');
// var certificate = fs.readFileSync('/home/cclab/newssl2/STAR_iitpkd_ac_in.crt', 'utf8');
var privateKey = fs.readFileSync('/etc/pki/tls/certs/iitpkd.key', 'utf8');
// var certificate = fs.readFileSync('/home/cclab/newssl2/STAR_iitpkd_ac_in.crt', 'utf8');
var certificate = fs.readFileSync('/etc/pki/tls/certs/STAR_iitpkd_ac_in.crt', 'utf8');

var credentials = { key: privateKey, cert: certificate };

// your express configuration here

// var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// httpServer.listen(8443);
httpsServer.listen(
    PORT, HOST,
    () => console.log('it is alive on https://', HOST, ':', PORT, '')
);



app.get('/', (req, res) => {
    res.status(200).send({
        data: 'Welcome to UBA-Server'
    })
})

app.post('/data', (req, res) => {
    const { column } = req.body;

    if (!column) {
        res.status(420).send({ message: 'the column does not exist' })
    }
    res.send({ labels: ['neem', 'coconut'], values: [21, 32], type: 'pie' })
})

// resonding with the list of datasets available
app.post('/file_paths', (req, res) => {
    var file_path = fs.readdirSync("./assets/survey_data");
    for (var i = 0; i < file_path.length; i++) {
        file_path[i] = "assets/survey_data/" + file_path[i];
    }
    res.send({ files: file_path });
})


app.post('/column', (req, res) => {
    const { file_path } = req.body;
    var [columnList, plotType] = Helpers.CalcData(file_path);
    res.send({ columns: columnList, plotType: plotType });
})

app.post('/get_stats', (req, res) => {
    const { file_path } = req.body;
    const { column } = req.body;
    const { plotType } = req.body;
    const { bins } = req.body;
    var [label, freq] = Helpers.GetStats(file_path, column, plotType, bins);
    res.send({ "label": label, "freq": freq });
})

app.post('/map_vis', (req, res) => {
    const { file_path } = req.body;
    const { column } = req.body;
    var [final_arr, centre_lat, centre_long] = MapHelpers.map_func(file_path, column);

    res.send({ "final_arr": final_arr, "centre_lat": centre_lat, "centre_long": centre_long });

})