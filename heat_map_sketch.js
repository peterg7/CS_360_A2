
const BACKGROUND_COLOR = 220;
const SCREEN_DIMENSIONS = {
    width:900,
    height: 700,
    leftMargin: 220,
    rightMargin: 120,
    upperMargin: 120,
    lowerMargin: 120,
    yTitleOffset: 20,
    xTitleOffset: 40,
    yTickSize: 10,
    xTickSize: 10
};

let table;
let countryData = [];
const NUM_COUNTRIES = 7; // number of tiles down
const COUNTRY_SELECT_MODE = "random";

let minVal, maxVal;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];



// Load CSV data. Will be executed asynchrously
function preload() {
    table = loadTable("data/earth_surface_temperature/GlobalLandTemperaturesByCountry.csv", 
    "csv", "header");
}

function preprocess() {
    
    let rawTempData = table.getColumn("AverageTemperature").map(s => parseFloat(s)).filter(Boolean);
    rawTempData.sort((a, b) => a - b);
    minVal = rawTempData[0];
    maxVal = rawTempData[rawTempData.length - 1];
    
    let uniqueCountries = [...new Set(table.getColumn("Country"))];
    
    (countryData = []).length = NUM_COUNTRIES;
    countryData.fill({});
    
    let randRows, randCountry;
    if (COUNTRY_SELECT_MODE == "random") {
        for (let i = 0; i < NUM_COUNTRIES; i++) {
            
            randCountry = uniqueCountries[Math.floor(Math.random() * (uniqueCountries.length))];
            // Holds all rows corresponding to a random country
            randRows = table.findRows(randCountry, "Country").filter(r => r.get("AverageTemperature"));

            if (!randRows) {
                // Safety check
                i++;
                continue;
            }
            
            var monthlyTemps = Array(12);
            monthlyTemps.fill([]);
            let currRow, currMonth;
            for (let j = 0; j < randRows.length; j++) {
                currRow = randRows[j]
                currMonth = new Date(currRow.getString("dt")).getMonth();
                monthlyTemps[currMonth].push(parseFloat(currRow.get("AverageTemperature")));
            }
            
            for (let i = 0; i < monthlyTemps.length; i++) {
                monthlyTemps[i] = monthlyTemps[i].reduce((a, b) => a + b, 0) / monthlyTemps[i].length;
            }

            countryData[i] = {
                name: randRows[0].getString("Country"),
                temps: monthlyTemps,
                size: randRows.length
            };
        }
    }
}


function setup() {
    createCanvas(SCREEN_DIMENSIONS.width + (SCREEN_DIMENSIONS.leftMargin + SCREEN_DIMENSIONS.rightMargin), 
    SCREEN_DIMENSIONS.height + (SCREEN_DIMENSIONS.upperMargin + SCREEN_DIMENSIONS.lowerMargin));
    preprocess();
}

function draw() {
    background(BACKGROUND_COLOR);
    // noStroke();
    
    drawGraph();
    drawLabels();
}

let blockHeight, blockWidth;
function drawGraph() {
    let newWidth = SCREEN_DIMENSIONS.width;

    blockHeight = (SCREEN_DIMENSIONS.height - (SCREEN_DIMENSIONS.upperMargin)) / NUM_COUNTRIES - 10;

    let Verbose = makeStruct('headline subheadline');
    let wantsVerboseInfo;

    for (let i = 0; i < countryData.length; i++) {
        let aggregate = countryData[i];
        blockWidth = newWidth / aggregate.temps.length;
        
        for (let j = 0; j < aggregate.temps.length; j++) {
            let primary = aggregate.temps[j];
            
            let x = SCREEN_DIMENSIONS.leftMargin + (j * blockWidth);

            let y = ((i * blockHeight) + SCREEN_DIMENSIONS.upperMargin) - (blockHeight / 2);
            
            colorMode(HSL);
            fill(luminance(primary, minVal, maxVal), 100, 50);
            rect(x, y, blockWidth, blockHeight);
            
            let shouldShowVerbose = ((mouseX > x) && (mouseX < x + blockWidth) && (mouseY > y) && (mouseY < y + blockHeight));
            if (shouldShowVerbose) {
                wantsVerboseInfo = new Verbose(aggregate.name, formatPrecision(primary));
            }
        }
    }

    // Popup data
    if (wantsVerboseInfo != undefined) {
        fill(255);
        textAlign(LEFT);
        textSize(12);
        stroke(18);
        text(wantsVerboseInfo.headline + "\n" + wantsVerboseInfo.subheadline,
        mouseX + 12,
        mouseY);
    }
}

function drawLabels() {
    colorMode(RGB);
    fill(18, 18, 18);
    
    // Add labels to the chart header
    let header_label_location_x = SCREEN_DIMENSIONS.width / 2;
    textSize(12);
    textAlign(CENTER);
    noStroke();
    text("Monthly Average Temperatures", header_label_location_x, 12);
    
    // Add labels to the chart y - axis
    let y_label_location_y = (SCREEN_DIMENSIONS.height / 2);
    verticalText("Country", 12, y_label_location_y);
    
    // Add labels to the chart y - axis, including measure ranges
    let x_label_location_x = SCREEN_DIMENSIONS.width / 2;
    let x_label_location_y = SCREEN_DIMENSIONS.height - 24;
    textSize(12);
    textAlign(CENTER);
    noStroke();
    text("Month", x_label_location_x, x_label_location_y);
    
    let aggregateCount = MONTHS.length;
    let percent_location_padding = (1.0 / parseFloat(aggregateCount));
    for (let i = 0; i < aggregateCount; i += 1) {
        let percent_location_on_chart = (parseFloat(i) / parseFloat(aggregateCount));
        
        let newWidth = SCREEN_DIMENSIONS.width - (SCREEN_DIMENSIONS.rightMargin + SCREEN_DIMENSIONS.leftMargin);
        let labelX_location = (percent_location_on_chart * newWidth) + SCREEN_DIMENSIONS.leftMargin + 16;
        
        //Label of the totals
        noStroke();
        textSize(12);
        text(MONTHS[i],
            labelX_location,
            SCREEN_DIMENSIONS.height - 48)
            
        //lines for ease of sight
        strokeWeight(1);
        stroke(200);
        line(labelX_location,
            SCREEN_DIMENSIONS.height - SCREEN_DIMENSIONS.lowerMargin,
            labelX_location,
            SCREEN_DIMENSIONS.upperMargin)
    }
        
    //Names of the key dimension that will positioned along the y-axis
    let measureCount = countryData.length;
    
    for (let i = 0; i < measureCount; i += 1) {
        
        //The labels for the dimension used
        text(countryData[i].name, SCREEN_DIMENSIONS.leftMargin - 21, (i*blockHeight) + SCREEN_DIMENSIONS.upperMargin);
    }
    
    //Heatmap legend
    let legendSize = 48;
    let chartWidth = 120;
    let chartHeight = 24;
    for (let i = 0; i < legendSize; i += 1) {
        let legend_color_for_locale = luminance(i, 0, legendSize);
        colorMode(HSL);
        fill(legend_color_for_locale, 120, 50);
        noStroke();
        rect(SCREEN_DIMENSIONS.leftMargin + ((chartWidth/legendSize) * i), SCREEN_DIMENSIONS.height - 24, (chartWidth/legendSize), chartHeight);
    }
    stroke(400);
    
    //Labels for the Heatmap Legend Mins and Maximas
    colorMode(RGB);
    fill(18, 18, 18);
    textSize(12);
    textAlign(RIGHT);
    text(formatPrecision(minVal), SCREEN_DIMENSIONS.leftMargin - 4, SCREEN_DIMENSIONS.height - 8);
    textAlign(LEFT);
    text(formatPrecision(maxVal), SCREEN_DIMENSIONS.leftMargin + chartWidth + 4 , SCREEN_DIMENSIONS.height - 8);
    text("Average Temp", SCREEN_DIMENSIONS.leftMargin, SCREEN_DIMENSIONS.height - chartHeight -4);
}

//Format large numbers with commas
function formatPrecision(num) {
    return num.toPrecision(3);
}


function verticalText(input, x, y) {
    push();
    translate(x, y);
    rotate(radians(270));
    textAlign(CENTER, TOP);
    text(input, 0, 0);
    pop();
}


function luminance(value, min, max) {
    frac = map(value, min, max, 0, 1.0);
    h = (1.0 - frac) * 240;
    return h;
}

//Struct generator for Data Storage
function makeStruct(names) {
    var names = names.split(' ');
    var count = names.length;
    function constructor() {
        for (var i = 0; i < count; i++) {
            this[names[i]] = arguments[i];
        }
    }
    return constructor;
}