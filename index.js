const express = require('express');
const cors = require("cors");
const app = express();
const PORT = 8080;
const fs = require('fs');
const req = require('express/lib/request');
const Helpers = require('./js/CalcData.js');
const MapHelpers = require('./js/MapCalc.js');
const bodyParser = require('body-parser');
const repo = require('./repository');
const forPwd = require('./js/forgot.js');
const OtpHelpers = require('./js/mail.js');
var nodemailer = require('nodemailer');;


app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
const users = require("./datastore");
var otp_val = 0000;

app.listen(
    PORT,
    () => console.log(`it is alive on http://localhost:${PORT}`)
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

function checkCredentials(mail, pwd) {
    // const users = JSON.parse(data);
    var length = users.length;
    var password = users[length - 1].password;
    // console.log(password);
    if (mail != "uba@iitpkd.ac.in" || pwd != password) {
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
        return;
    } else {
        fs.rename(uploadPath + randId, uploadPath + originalId, function(err) {
            if (err) {
                console.log(err);
            }
        });
        res.json({ message: "Successfully uploaded files" });
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
    res.send({ "otp": otp_val });
})