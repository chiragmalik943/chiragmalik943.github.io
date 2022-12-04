var GDP = document.getElementById("GDP");
var Population = document.getElementById("Population");
var GdpCapita = document.getElementById("GDP-capita");

var startGdp = 3049704000000;
var endGdp = 3312949000000;

var StartPopulation = 1391990000;
var EndPopulation = 1405200000;

var Now = new Date(); // current date
var startDate = new Date("03/30/2021");
var endDate = new Date("03/30/2022"); // mm/dd/yyyy format
var totalTimeDiff = Math.abs(endDate.getTime() - startDate.getTime());
var totalSeconds = Math.ceil(totalTimeDiff / 1000);
var timeDiff = Math.abs(Now.getTime() - startDate.getTime()); // in miliseconds
var seconds = Math.ceil(timeDiff / 1000); // in second
var nowToEnd = Math.abs(endDate.getTime() - Now.getTime()); // in miliseconds
var nteSeconds = Math.ceil(nowToEnd / 1000); // in second 


var GDPGrowthPerSecond = (endGdp - startGdp) / totalSeconds;
var PopulationGrowthPerSecond = (EndPopulation - StartPopulation) / totalSeconds;

var gdpNow = startGdp + (GDPGrowthPerSecond * seconds);
var populationNow = StartPopulation + (PopulationGrowthPerSecond * seconds);

var GdpUpdateValue = GDPGrowthPerSecond / 10;
var PopulationUpdateValue = PopulationGrowthPerSecond / 10;

function update() {
    if (gdpNow == endGdp) {
        clearInterval(interval);
    } else {
        gdpNow = gdpNow + GdpUpdateValue
        populationNow = populationNow + PopulationUpdateValue
        GDP.innerText = "$ " + parseInt(gdpNow)
        Population.innerText = parseInt(populationNow);
        GdpCapita.innerText = "$ " + (gdpNow / populationNow).toFixed(5);

    }
}

var interval = setInterval(update, 100);

console.log(seconds);