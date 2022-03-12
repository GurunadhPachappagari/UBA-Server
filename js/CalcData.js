var XLSX = require('xlsx')

function getData(file_path){
    var workbook = XLSX.readFile(file_path);
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    return xlData;
}

// returns list of columns in first row of XL
function ColumnNames(xlData){
    columnList = []
    for (var column in xlData[0]) {
        if (xlData[0].hasOwnProperty(column)) {
            columnList.push(column);
        }
    }
    return columnList;
}

// returns list of plot types corresponding to each column
function PlotType(xlData, columnList){
    var plotType = [];
    // for each column
    for(var i = 0; i < columnList.length; i++){
        var colName = columnList[i], pie = 0, histogram = 0;
        // for each row
        for(var j = 0; j < xlData.length; j++){
            var value = parseFloat(xlData[j][colName]);
            if(Number.isNaN(value)){
                pie += 1;
            }
            else{
                histogram += 1;
            }
        }
        if(histogram > pie){
            plotType.push("histogram");
        }
        else{
            plotType.push("pie");
        }
    }
    return plotType;
}

// function to calc label and freq for PieChart
function CalcForPie(xlData, column_name){
    var label_set = {}
    for(var i = 0; i < xlData.length; i++){
        var s = xlData[i][column_name]
        try {
            var s = s.trim()
        }
        catch(err) {
            // console.log(err);
            continue;
        }
        if(label_set[s] == undefined){
            label_set[s] = 1;
        }
        else{
            label_set[s] += 1;
        }
    }

    var freq = []
    var label = []
    for(var i in label_set){
        label.push(i)
        freq.push(label_set[i])
    }
    return [label, freq];
}

// function to calculate labels and frequency
function CalcForHist(xlData, column_name, bins){
    var samples = []
    for(var i = 0; i < xlData.length; i++){
        var value = parseFloat(xlData[i][column_name]);
        if(Number.isNaN(value)){
            continue;
        }
        samples.push(value);
    }
    var high = Math.ceil(Math.max.apply(Math, samples));
    var low = Math.floor(Math.min.apply(Math, samples));
    var gap = Math.ceil((high - low)/bins);
    // console.log(high, low, gap);
    if(gap == 0){
        return [[high.toString()], [samples.length]];
    }

    var data = {}
    for(var i = 0; i < samples.length; i++){
        var window_num = Math.floor((samples[i] - low)/gap);
        data[window_num] = (data[window_num] || 0) + 1;
    }

    var label = [low.toString() + "-" + (low + gap).toString()]
    var ind = 0
    var freq = [(data[ind++] || 0)]

    for(var i = low + gap; i <= high && gap != 0; i += gap){
        label.push((i).toString() + "-" + (i + gap).toString());
        freq.push((data[ind++] || 0))
    }
    return [label, freq];
}


// function to return label and freq
function GetStats(file_path, column, plotType, bins){
    var xlData = getData(file_path);
    // console.log(xlData[0]);
    var label, freq;
    if(plotType == 'pie'){
        [label, freq] = CalcForPie(xlData, column);
    }
    else{
        [label, freq] = CalcForHist(xlData, column, bins);
    }
    return [label, freq];
}

// function to find column names and plot types
function CalcData(file_path){
    var xlData = getData(file_path);
    var columnList = ColumnNames(xlData);
    var plotType = PlotType(xlData, columnList);
    
    return [columnList, plotType];
}

module.exports = {CalcData, GetStats}