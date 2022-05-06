var XLSX = require('xlsx')
var XMLHttpRequest_xhr = require('xhr2');
// import fetch from 'node-fetch';
const fetch = require('node-fetch');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function getData(file_path) {
    var workbook = XLSX.readFile(file_path);
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    return xlData;
}

// returns list of columns in first row of XL
function ColumnNames(xlData) {
    columnList = []
    for (var column in xlData[0]) {
        if (xlData[0].hasOwnProperty(column)) {
            columnList.push(column);
        }
    }
    return columnList;
}

// returns list of plot types corresponding to each column
function PlotType(xlData, columnList) {
    var plotType = [];
    // for each column
    for (var i = 0; i < columnList.length; i++) {
        var colName = columnList[i],
            pie = 0,
            histogram = 0;
        // for each row
        for (var j = 0; j < xlData.length; j++) {
            var value = parseFloat(xlData[j][colName]);
            if (Number.isNaN(value)) {
                pie += 1;
            } else {
                histogram += 1;
            }
        }
        if (histogram > pie) {
            plotType.push("histogram");
        } else {
            plotType.push("pie");
        }
    }
    return plotType;
}

// function to calc label and freq for PieChart
function CalcForPie(xlData, column_name) {
    var label_set = {}
    for (var i = 0; i < xlData.length; i++) {
        var s = xlData[i][column_name]
        try {
            var s = s.trim()
        } catch (err) {
            // console.log(err);
            continue;
        }
        if (label_set[s] == undefined) {
            label_set[s] = 1;
        } else {
            label_set[s] += 1;
        }
    }

    var freq = []
    var label = []
    for (var i in label_set) {
        label.push(i)
        freq.push(label_set[i])
    }
    return [label, freq];
}

// function to calculate labels and frequency
function CalcForHist(xlData, column_name, bins) {
    var samples = []
    for (var i = 0; i < xlData.length; i++) {
        var value = parseFloat(xlData[i][column_name]);
        if (Number.isNaN(value)) {
            continue;
        }
        samples.push(value);
    }
    var high = Math.ceil(Math.max.apply(Math, samples));
    var low = Math.floor(Math.min.apply(Math, samples));
    var gap = Math.ceil((high - low) / bins);
    // console.log(high, low, gap);
    if (gap == 0) {
        return [
            [high.toString()],
            [samples.length]
        ];
    }

    var data = {}
    for (var i = 0; i < samples.length; i++) {
        var window_num = Math.floor((samples[i] - low) / gap);
        data[window_num] = (data[window_num] || 0) + 1;
    }

    var label = [low.toString() + "-" + (low + gap).toString()]
    var ind = 0
    var freq = [(data[ind++] || 0)]

    for (var i = low + gap; i <= high && gap != 0; i += gap) {
        label.push((i).toString() + "-" + (i + gap).toString());
        freq.push((data[ind++] || 0))
    }
    return [label, freq];
}


// function to return label and freq
function GetStats(file_path, column, plotType, bins) {
    var xlData = getData(file_path);
    // console.log(xlData[0]);
    var label, freq;
    if (plotType == 'pie') {
        [label, freq] = CalcForPie(xlData, column);
    } else {
        [label, freq] = CalcForHist(xlData, column, bins);
    }
    return [label, freq];
}

// function to find column names and plot types
function CalcData(file_path) {
    var xlData = getData(file_path);
    var columnList = ColumnNames(xlData);
    var plotType = PlotType(xlData, columnList);

    return [columnList, plotType];
}


// function httpGet_Val(theUrl) {
//     var xhr = new XMLHttpRequest();
//     console.log("&&&&&&&&&&&&&&&&");
//     console.log(xhr.response);
//     xhr.addEventListener("load", function() {
//         initialArray = JSON.parse(xhr.response);
//     }, false);
//     xhr.open('GET', theUrl);
//     xhr.send();
//     return xhr.response;
// }

// function httpGet(theUrl) {
//     var xmlHttp = new XMLHttpRequest();
//     xmlHttp.open("GET", theUrl, false); // false for synchronous request
//     xmlHttp.send(null);
//     return xmlHttp.responseText;
// }




// function onlyUnique(value, index, self) {
//     return self.indexOf(value) === index;
// }

// function sort_by_key(array, key) {
//     return array.sort(function(a, b) {
//         var x = a[key];
//         var y = b[key];
//         return ((x > y) ? -1 : ((x < y) ? 1 : 0));
//     });
// }


// // var v1 = ["poverty_status", "house_type", "drainage_linked", "compost_pit"];
// // var colNAMES = [];
// // var file_name;
// // var ids = document.querySelectorAll('[id]');

// // document.getElementById("m1").innerHTML = "Map Visualization";
// // document.getElementById("m2").innerHTML = "The maps are only shown for the pie chart columns ";
// // map_func("./assets/survey_data/Pudussery.xlsx","poverty_status")

// // map_func("./assets/survey_data/Pudussery.xlsx","education")

// // map_func1("./assets/survey_data/Pudussery.xlsx","poverty_status")


// function map_func(file_path, col_name) {
//     // var file_path = "./assets/survey_data/Pudussery.xlsx";
//     //  document.getElementById("demo").innerHTML = "hey ";
//     // const response = await fetch(file_path);
//     // const data = await response.arrayBuffer();
//     // var values;
//     // var workbook = XLSX.read(new Uint8Array(data), {
//     //     type: 'array'
//     // });
//     // workbook.SheetNames.forEach(function(sheetName) {
//     //         values = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
//     //         // json_object = JSON.stringify(XL_row_object);
//     //     })
//     //   console.log("hellooyyy");
//     //   console.log(values);

//     var workbook = XLSX.readFile(file_path);
//     var sheet_name_list = workbook.SheetNames;
//     var values = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
//     // console.log(values);
//     var key;
//     var flag = 0;
//     var c = 0;
//     key = (Object.keys(values[0]));
//     //console.log(key);
//     for (var i = 0; i < key.length; i++) {
//         if (key[i] == "village_name") {
//             c = c + 1;
//         }
//     }
//     if (c == 1) {
//         flag = 1;
//     } else {
//         flag = 0;
//     }
//     //console.log(flag);
//     if (flag == 0) {
//         var centre_lat = 0;
//         var centre_long = 0;
//         var final_arr = [];
//         return [final_arr, centre_lat, centre_long];
//         // document.getElementById("exp").innerHTML = "No address available to show visualization of " + col_name;

//     } else {
//         //   console.log(values[0]["village_name"]);

//         var village = [];
//         var state = [];
//         for (var i = 0; i < values.length; i++) {
//             village.push(values[i]["village_name"]);
//             state.push(values[i]["state"]);
//         }
//         var unique_village = village.filter(onlyUnique);
//         var unique_state = state.filter(onlyUnique);
//         //console.log(unique_village);
//         var latitude = [];
//         var longitude = [];
//         for (var j = 0; j < unique_village.length; j++) {
//             //var json_res;
//             var place = "";
//             // unique_village[j] = unique_village[j].split(" ");
//             // console.log(unique_village[j]);

//             var ans = unique_village[j].split(" ");
//             // var stringArray = unique_village[j].split(/(\s+)/);
//             // console.log(ans.length);
//             var max_len;
//             if (ans.length > 2) {
//                 max_len = 2;
//             } else {
//                 max_len = ans.length;
//             }
//             for (var k = 0; k < max_len; k++) {
//                 place = place + ans[k] + "+";
//             }
//             place = place + unique_state + "+" + "India";
//             //console.log(place)
//             var json_res = httpGet("https://www.mapquestapi.com/geocoding/v1/address?key=3cRkGFGmfDZKypAWTPWKgJML7ZNeUqjg&location=" + place + ",&outFormat=csv");
//             // console.log("^^^^^^^^^^^^^^^");
//             // var json_res = fetch("https://www.mapquestapi.com/geocoding/v1/address?key=3cRkGFGmfDZKypAWTPWKgJML7ZNeUqjg&location=" + place + ",&outFormat=csv").then(res => res.text()).then(text => console.log(text));
//             // console.log("&&&&&&&&&&&&&&&&&&");
//             // console.log(json_res);
//             // console.log("**********");
//             json_res = json_res.split("\n");
//             // json_res = json_res.split(",");
//             // var lat_columnNo = json_res[0].indexOf("DisplayLat");
//             for (var i = 0; i < json_res.length; i++) {
//                 json_res[i] = json_res[i].split(",");
//             }
//             console.log(json_res);
//             var lat_columnNo = json_res[0].indexOf('"Lat"');
//             var lng_columnNo = json_res[0].indexOf('"Lng"');
//             var lat = json_res[1][lat_columnNo];
//             var lng = json_res[1][lng_columnNo];
//             latitude.push(Number(lat.split('"')[1]));
//             longitude.push(Number(lng.split('"')[1]));

//         }

//         let centre_lat = 0;
//         let centre_long = 0;

//         for (let i = 0; i < latitude.length; i++) {
//             centre_lat += latitude[i];
//             centre_long += longitude[i];
//         }
//         centre_lat = centre_lat / latitude.length;
//         centre_long = centre_long / longitude.length;
//         // console.log(centre_lat);

//         var val = [];
//         for (var i = 1; i < values.length; i++) {
//             val.push(values[i][col_name]);
//         }
//         var unique_val = val.filter(onlyUnique);
//         console.log(unique_val);

//         var an = [];
//         for (var i = 0; i < unique_village.length; i++) {
//             let counts = {};
//             var arr = [];
//             for (var j = 0; j < values.length; j++) {
//                 if (values[j]["village_name"] == unique_village[i]) {
//                     arr.push(values[j][col_name]);
//                 }
//                 //  console.log(arr);

//             }
//             counts['village_name'] = unique_village[i];
//             counts["latitude"] = latitude[i];
//             counts["longitude"] = longitude[i];
//             counts["coordinates"] = [latitude[i], longitude[i]];
//             counts["country"] = "India";
//             // for(var h=0;h<unique_val.length-1;h++){
//             //     counts[column_name] = unique_val[h];
//             // }
//             arr.forEach(el => counts[el] = 1 + (counts[el] || 0));
//             // console.log(counts);    
//             an.push(counts);


//         }
//         for (var p = 0; p < an.length; p++) {
//             for (var f = 0; f < unique_val.length; f++) {
//                 if (an[p][unique_val[f]] == undefined) {
//                     an[p][unique_val[f]] = 0;
//                 }
//             }
//         }

//         var counter = 0;
//         // console.log(unique_val);
//         var final_arr = [];
//         while (counter < an.length) {
//             for (var j = 0; j < unique_val.length; j++) {
//                 var final_set = {};
//                 final_set["village_name"] = an[counter]["village_name"];
//                 final_set["latitude"] = an[counter]["latitude"];
//                 final_set["longitude"] = an[counter]["longitude"];
//                 final_set[col_name] = unique_val[j];
//                 final_set["count"] = an[counter][unique_val[j]];
//                 final_arr.push(final_set);
//             }
//             counter = counter + 1;
//         }
//         // console.log(final_arr); 
//         final_arr = sort_by_key(final_arr, 'count');
//         return [final_arr, centre_lat, centre_long, col_name];

//     }
// }




// function visualized_map(file_path, col_name) {
//     // console.log("((((((((");
//     // console.log(file_path,col_name);
//     colNAMES.push(col_name);
//     file_name = file_path;
// }
// export { visualized_map, map_func };


module.exports = { CalcData, GetStats, getData}