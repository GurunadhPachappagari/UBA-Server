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
const MapHelpers = require('./js/MapCalc.js');
const OtpHelpers = require('./js/mail.js');
var nodemailer = require('nodemailer');;

///////////////////////////

// var http = require('http');
var https = require('https');
// var certificate = fs.readFileSync('/home/cclab/newssl2/STAR_iitpkd_ac_in.crt', 'utf8');
var privateKey = fs.readFileSync('/etc/pki/tls/certs/iitpkd.key', 'utf8');
// var certificate = fs.readFileSync('/home/cclab/newssl2/STAR_iitpkd_ac_in.crt', 'utf8');
var certificate = fs.readFileSync('/etc/pki/tls/certs/STAR_iitpkd_ac_in.crt', 'utf8');

var credentials = { key: privateKey, cert: certificate };
var otp_val = 0000;

// your express configuration here

// var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(
    PORT, HOST,
    () => console.log('it is alive on https://', HOST, ':', PORT, '')
);


//
const uploadPath = "./assets/survey_data/";
const multer = require("multer");
const upload = multer({ dest: uploadPath });
app.use(express.urlencoded({ extended: true }));
//


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

// file uploads
app.post("/upload_files", upload.array("files"), uploadFiles);

function CheckConfig(file_path){
    var xldata = Helpers.getData(file_path);
    if(xldata.length < 2){
        return false;
    }
    return true;
}


function uploadFiles(req, res) {
    var originalId = req.files[0].originalname;
    var otp_entered = req.body.password;
    var randId = req.files[0].filename;
    //var mailId = req.body.name;
    //var pwd = req.body.otp;
    //  console.log("hi", req);

    if (otp_val != otp_entered) {
        console.log("unequal");
        fs.unlinkSync(uploadPath + randId);
        res.status(400).send();
        otp_val = Math.floor(1000 + Math.random()*9000);
        return;
    } else {
        fs.rename(uploadPath + randId, uploadPath + originalId, function(err) {
            if (err) {
                fs.unlinkSync(uploadPath + originalId);
                console.log(err);
            }
            else if (CheckConfig(uploadPath + originalId)){
                res.json({ message: "Successfully uploaded files" });
            }
            else{
                fs.unlinkSync(uploadPath + originalId);
                res.status(401).send();
            }
            otp_val = Math.floor(1000 + Math.random()*9000);
        });
    }
}

app.post('/map_vis', (req, res) => {
    const { file_path } = req.body;
    const { column } = req.body;
    var [final_arr, centre_lat, centre_long] = MapHelpers.map_func(file_path, column);

    res.send({ "final_arr": final_arr, "centre_lat": centre_lat, "centre_long": centre_long });

})

app.post('/otp', (req, res) => {
    otp_val = OtpHelpers.sendOtp();
    res.send({ "otp": 'Success' });
})