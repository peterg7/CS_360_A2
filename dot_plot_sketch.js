//----------------- DOT PLOT -----------------
const BACKGROUND_COLOR = 220;
const chunkSize = 2500;
const DOT_COLOR = [66, 135, 245];
const scale = 0.1;
const numYTicks = 10;
const numXTicks = 10;

const FILTER_DATE = '2013-01-01';

const SCREEN_DIMENSIONS = {
    width:600,
    height: 600,
    leftMargin: 75,
    rightMargin: 75,
    upperMargin: 50,
    lowerMargin: 50,
    yTitleOffset: 25,
    xTitleOffset: 25,
    yTickSize: 10,
    xTickSize: 10
};


let table; // Global object to hold results from the loadTable call
let buckets = []; // Global array to hold all bubble objects
let data = [];

let minX, maxX, minY, maxY;

function preload() {
    table = loadTable("data/earth_surface_temperature/GlobalLandTemperaturesByCountry.csv", 
    "csv", "header");
}

function preprocess() {
    const numberOfRows = table.getRowCount();
    
    maxX = Number.MIN_VALUE;
    maxY = Number.MIN_VALUE;

    minX = Number.MAX_VALUE;
    minY = Number.MAX_VALUE;

    let currX, currY;
    let extractedData = [];
    let rowValues = table.getRows();
    let numericFilterDate = Date.parse(FILTER_DATE);

    for (let i = 0; i < rowValues.length; i++) {

        if (Date.parse(rowValues[i].get("dt")) < numericFilterDate) {
            continue;
        }

        currX = parseFloat(rowValues[i].get("AverageTemperature"));
        currY = parseFloat(rowValues[i].get("AverageTemperatureUncertainty"));

        if (currX && currY) {
            extractedData.push( {
                x: currX,
                y: currY
            });

            if (currX < minX) { minX = currX; }
            else if (currX > maxX) { maxX = currX; }

            if (currY < minY) { minY = currY; }
            else if (currY > maxY) { maxY = currY; }
        }
    }

    data = extractedData.map(val => { return { 
        x: map(val.x, minX, maxX, SCREEN_DIMENSIONS.leftMargin, SCREEN_DIMENSIONS.width), 
        y: map(val.y, minY, maxY, SCREEN_DIMENSIONS.height, SCREEN_DIMENSIONS.upperMargin) }; 
    });
}


function setup() {
    createCanvas(SCREEN_DIMENSIONS.width + (SCREEN_DIMENSIONS.leftMargin + SCREEN_DIMENSIONS.rightMargin), 
    SCREEN_DIMENSIONS.height + (SCREEN_DIMENSIONS.upperMargin + SCREEN_DIMENSIONS.lowerMargin));
    preprocess();
}

function draw() {
    background(BACKGROUND_COLOR);
    fill(color(...DOT_COLOR));

    
    // Y-Axis
    line(SCREEN_DIMENSIONS.leftMargin, 
        SCREEN_DIMENSIONS.upperMargin, 
        SCREEN_DIMENSIONS.leftMargin, 
        SCREEN_DIMENSIONS.height - SCREEN_DIMENSIONS.lowerMargin + SCREEN_DIMENSIONS.upperMargin);
    push();
    translate((SCREEN_DIMENSIONS.leftMargin / 2) - SCREEN_DIMENSIONS.yLabelOffset, (SCREEN_DIMENSIONS.height) / 2 + SCREEN_DIMENSIONS.upperMargin);
    rotate(radians(270));
    text("Average Temperature (°C)", 0, 0);
    pop();
    
    // X-Axis
    line(SCREEN_DIMENSIONS.leftMargin, 
        SCREEN_DIMENSIONS.height - SCREEN_DIMENSIONS.lowerMargin + SCREEN_DIMENSIONS.upperMargin, 
        SCREEN_DIMENSIONS.width - SCREEN_DIMENSIONS.rightMargin + SCREEN_DIMENSIONS.leftMargin,
        SCREEN_DIMENSIONS.height - SCREEN_DIMENSIONS.lowerMargin + SCREEN_DIMENSIONS.upperMargin);
    text("Average Temperature Uncertainty (°C)",
        SCREEN_DIMENSIONS.leftMargin + (SCREEN_DIMENSIONS.width / 2), 
        SCREEN_DIMENSIONS.height - SCREEN_DIMENSIONS.lowerMargin + SCREEN_DIMENSIONS.upperMargin + SCREEN_DIMENSIONS.xLabelOffset);
    
    let xPos, yPos;
    for (var i = 0; i < data.length - 1; i++) {
        point(data[i].x, data[i].y);
    }

    // Y-labels
    let yTickLabelSpacing = (maxY - minY) / numYTicks;
    let yTickPosSpacing = (SCREEN_DIMENSIONS.height / numYTicks);
    textAlign(RIGHT);
    for (var i = 0; i < numYTicks; i++) {
        fill(0);
        text((maxY - (yTickLabelSpacing * i)).toPrecision(3), 
            SCREEN_DIMENSIONS.leftMargin - (SCREEN_DIMENSIONS.yTickSize * 1.5), 
            (yTickPosSpacing * i) + SCREEN_DIMENSIONS.upperMargin);

        line(SCREEN_DIMENSIONS.leftMargin - (SCREEN_DIMENSIONS.yTickSize / 2), 
            (yTickPosSpacing * i) + SCREEN_DIMENSIONS.upperMargin, 
            SCREEN_DIMENSIONS.leftMargin + (SCREEN_DIMENSIONS.yTickSize / 2), 
            (yTickPosSpacing * i) + SCREEN_DIMENSIONS.upperMargin);
    }

    // X-labels
    let xTickLabelSpacing = (maxX - minX) / numXTicks;
    let xTickPosSpacing = (SCREEN_DIMENSIONS.width / numXTicks);
    textAlign(LEFT);
    for (var i = 0; i < numXTicks; i++) {
        fill(0);
        text((minX + (xTickLabelSpacing * i)).toPrecision(3), 
            (xTickPosSpacing * i) + SCREEN_DIMENSIONS.leftMargin,
            SCREEN_DIMENSIONS.height - SCREEN_DIMENSIONS.lowerMargin + SCREEN_DIMENSIONS.upperMargin + (SCREEN_DIMENSIONS.xTickSize * 1.5));

        line((xTickPosSpacing * i) + SCREEN_DIMENSIONS.leftMargin, 
            SCREEN_DIMENSIONS.height - SCREEN_DIMENSIONS.lowerMargin + SCREEN_DIMENSIONS.upperMargin - (SCREEN_DIMENSIONS.xTickSize / 2), 
            (xTickPosSpacing * i) + SCREEN_DIMENSIONS.leftMargin,
            SCREEN_DIMENSIONS.height - SCREEN_DIMENSIONS.lowerMargin + SCREEN_DIMENSIONS.upperMargin + (SCREEN_DIMENSIONS.xTickSize / 2))
    }

    //     // X-labels
//     textAlign(LEFT);
//     let xTickStepSize = Math.ceil((maxBucket / numXTicks) / 10000) * 10000;
//     let xTickSpacing = Math.ceil((minBucket + maxBucket) / numXTicks) * scale;
    
//     for (var i = 0; i < numXTicks + 1; i++) {
//         line((i * xTickSpacing + 110), ((buckets.length - 1) * 30 + 60) + 5, 
//         (i * xTickSpacing + 110), ((buckets.length - 1) * 30 + 60) - 5);
        
//         text(i * xTickStepSize, (i * xTickSpacing + 90), ((buckets.length - 1) * 30 + 70), 75);
//     }


    //     textAlign(RIGHT);
//     for (var i = 0; i < buckets.length - 1; i++) {
//         fill(color(...BAR_COLOR));
//         // noStroke();
//         rect(110, i * 30 + 40, (buckets[buckets.length - i] * scale), 20);
        
//         // Y-labels
//         yLabel = `${ceil.toPrecision(3)} - ${(ceil - bucketSpan).toPrecision(3)}`;
        
//         fill(0);
//         text(yLabel, 25, i * 30 + 40, 75);
//         line(110 - 5, (i * 30 + 50), 110 + 5, (i * 30 + 50));
        
//         ceil -= bucketSpan + Number.MIN_VALUE;
//     }
}



















