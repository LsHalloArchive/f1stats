let races = {
    'sgp': {
        name: 'Singapore',
        start: 1569154200000,
        end: 1569161400000
    },
    'rus': {
        name: 'Russia',
        start: 1569755400000,
        end: 1569762600000
    },
    'jpn': {
        name: 'Japan',
        start: 1570943400000,
        end: 1570950600000
    },
    'mex': {
        name: 'Mexico',
        start: 1572203400000,
        end: 1572210600000
    },
    'usa': {
        name: 'United States',
        start: 1572808200000,
        end: 1572815400000
    },
    'bra': {
        name: 'Brazil',
        start: 1574010600000,
        end: 1574017800000
    },
    'are': {
        name: 'Abu Dhabi',
        start: 1575205800000,
        end: 1575213000000
    }
};

let cachedRaceData = {};
let chartData = {};
let lineChart = undefined;
let timeOffset = 1800000;

function showTable(selectedRaces) {
    let requests = [];
    for(let i = 0; i < selectedRaces.length; i++) {
        if(cachedRaceData[selectedRaces.name] !== undefined) {

        } else {
            requests.push($.get({
                url: dataUrl,
                data: {
                    type: 'data',
                    from: selectedRaces[i].start,
                    to: selectedRaces[i].end
                },
                success: function (requestData) {
                    chartData.push(new ChartData(selectedRaces[i].name, JSON.parse(requestData)));
                    cachedRaceData[selectedRaces[i].name] = new ChartData(selectedRaces[i].name, JSON.parse(requestData));
                },
                error: function () {
                    //TODO: tell me more
                }
            }));
        }
    }

    $.when(requests).then(function () {
        updateChartData();
    });
    
    function updateChartData() {
        for(let i = 0; i < chartData.length; i++) {
            lineChart.data.datasets[i].label = chartData[i].getName();
            lineChart.data.datasets[i].data = chartData[i].getF1();
        }
        lineChart.update();
    }
}

class RaceData {
    constructor(name, data) {
        if(data[0].length === 2) {
            data.splice(0, 1);
        }
        this.name = name;
        this.timeOffset = timeOffset;

        this.f1 = [];
        this.f1_5 = [];
        this.f1feeder = [];
        for(let i = 0; i < data.length; i++) {
            let date = new Date(data[0] * 1000);
            this.f1.push({x: date, y: parseInt(data[1])});
            this.f1_5.push({x: date, y: parseInt(data[2])});
            this.f1feeder.push({x: date, y: parseInt(data[3])});
        }
    }

    getName() {
        return this.name;
    }

    getOffset() {
        return this.timeOffset;
    }

    getF1() {
        return this.f1;
    }

    getF1Point5() {
        return this.f1_5;
    }

    getF1FeederSeries() {
        return this.f1feeder;
    }
}