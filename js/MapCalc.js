var XMLHttpRequest_xhr = require('xhr2');
var XLSX = require('xlsx')
    // import fetch from 'node-fetch';
const fetch = require('node-fetch');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}




function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function sort_by_key(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}


// var v1 = ["poverty_status", "house_type", "drainage_linked", "compost_pit"];
// var colNAMES = [];
// var file_name;
// var ids = document.querySelectorAll('[id]');

// document.getElementById("m1").innerHTML = "Map Visualization";
// document.getElementById("m2").innerHTML = "The maps are only shown for the pie chart columns ";
// map_func("./assets/survey_data/Pudussery.xlsx","poverty_status")

// map_func("./assets/survey_data/Pudussery.xlsx","education")

// map_func1("./assets/survey_data/Pudussery.xlsx","poverty_status")


function map_func(file_path, col_name) {
    // var file_path = "./assets/survey_data/Pudussery.xlsx";
    //  document.getElementById("demo").innerHTML = "hey ";
    // const response = await fetch(file_path);
    // const data = await response.arrayBuffer();
    // var values;
    // var workbook = XLSX.read(new Uint8Array(data), {
    //     type: 'array'
    // });
    // workbook.SheetNames.forEach(function(sheetName) {
    //         values = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    //         // json_object = JSON.stringify(XL_row_object);
    //     })
    //   console.log("hellooyyy");
    //   console.log(values);

    var workbook = XLSX.readFile(file_path);
    var sheet_name_list = workbook.SheetNames;
    var values = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    // console.log(values);
    var key;
    var flag = 0;
    var c = 0;
    key = (Object.keys(values[0]));
    //console.log(key);
    for (var i = 0; i < key.length; i++) {
        if (key[i] == "village_name") {
            c = c + 1;
        }
    }
    if (c == 1) {
        flag = 1;
    } else {
        flag = 0;
    }
    //console.log(flag);
    if (flag == 0) {
        var centre_lat = 0;
        var centre_long = 0;
        var final_arr = [];
        return [final_arr, centre_lat, centre_long];
        // document.getElementById("exp").innerHTML = "No address available to show visualization of " + col_name;

    } else {
        //   console.log(values[0]["village_name"]);

        var village = [];
        var state = [];
        for (var i = 0; i < values.length; i++) {
            village.push(values[i]["village_name"]);
            state.push(values[i]["state"]);
        }
        var unique_village = village.filter(onlyUnique);
        var unique_state = state.filter(onlyUnique);
        //console.log(unique_village);
        var latitude = [];
        var longitude = [];
        for (var j = 0; j < unique_village.length; j++) {
            //var json_res;
            var place = "";
            // unique_village[j] = unique_village[j].split(" ");
            // console.log(unique_village[j]);

            var ans = unique_village[j].split(" ");
            // var stringArray = unique_village[j].split(/(\s+)/);
            // console.log(ans.length);
            var max_len;
            if (ans.length > 2) {
                max_len = 2;
            } else {
                max_len = ans.length;
            }
            for (var k = 0; k < max_len; k++) {
                place = place + ans[k] + "+";
            }
            place = place + unique_state + "+" + "India";
            //console.log(place)
            var json_res = httpGet("https://www.mapquestapi.com/geocoding/v1/address?key=3cRkGFGmfDZKypAWTPWKgJML7ZNeUqjg&location=" + place + ",&outFormat=csv");
            // console.log("^^^^^^^^^^^^^^^");
            // var json_res = fetch("https://www.mapquestapi.com/geocoding/v1/address?key=3cRkGFGmfDZKypAWTPWKgJML7ZNeUqjg&location=" + place + ",&outFormat=csv").then(res => res.text()).then(text => console.log(text));
            // console.log("&&&&&&&&&&&&&&&&&&");
            // console.log(json_res);
            // console.log("**********");
            json_res = json_res.split("\n");
            // json_res = json_res.split(",");
            // var lat_columnNo = json_res[0].indexOf("DisplayLat");
            for (var i = 0; i < json_res.length; i++) {
                json_res[i] = json_res[i].split(",");
            }
            //console.log(json_res);
            var lat_columnNo = json_res[0].indexOf('"Lat"');
            var lng_columnNo = json_res[0].indexOf('"Lng"');
            var lat = json_res[1][lat_columnNo];
            var lng = json_res[1][lng_columnNo];
            latitude.push(Number(lat.split('"')[1]));
            longitude.push(Number(lng.split('"')[1]));

        }

        let centre_lat = 0;
        let centre_long = 0;

        for (let i = 0; i < latitude.length; i++) {
            centre_lat += latitude[i];
            centre_long += longitude[i];
        }
        centre_lat = centre_lat / latitude.length;
        centre_long = centre_long / longitude.length;
        // console.log(centre_lat);

        var val = [];
        for (var i = 1; i < values.length; i++) {
            val.push(values[i][col_name]);
        }
        var unique_val = val.filter(onlyUnique);
        // console.log(unique_val);

        var an = [];
        for (var i = 0; i < unique_village.length; i++) {
            let counts = {};
            var arr = [];
            for (var j = 0; j < values.length; j++) {
                if (values[j]["village_name"] == unique_village[i]) {
                    arr.push(values[j][col_name]);
                }
                //  console.log(arr);

            }
            counts['village_name'] = unique_village[i];
            counts["latitude"] = latitude[i];
            counts["longitude"] = longitude[i];
            counts["coordinates"] = [latitude[i], longitude[i]];
            counts["country"] = "India";
            // for(var h=0;h<unique_val.length-1;h++){
            //     counts[column_name] = unique_val[h];
            // }
            arr.forEach(el => counts[el] = 1 + (counts[el] || 0));
            // console.log(counts);    
            an.push(counts);


        }
        for (var p = 0; p < an.length; p++) {
            for (var f = 0; f < unique_val.length; f++) {
                if (an[p][unique_val[f]] == undefined) {
                    an[p][unique_val[f]] = 0;
                }
            }
        }

        var counter = 0;
        // console.log(unique_val);
        var final_arr = [];
        while (counter < an.length) {
            for (var j = 0; j < unique_val.length; j++) {
                var final_set = {};
                final_set["village_name"] = an[counter]["village_name"];
                final_set["latitude"] = an[counter]["latitude"];
                final_set["longitude"] = an[counter]["longitude"];
                final_set[col_name] = unique_val[j];
                final_set["count"] = an[counter][unique_val[j]];
                final_arr.push(final_set);
            }
            counter = counter + 1;
        }
        // console.log(final_arr); 
        final_arr = sort_by_key(final_arr, 'count');
        return [final_arr, centre_lat, centre_long, col_name];

    }
}


module.exports = { map_func }