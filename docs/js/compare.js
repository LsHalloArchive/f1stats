let races = {
    'sgp': {
        name: 'Singapore',
        start: 1569154200000,
        length: '1:58:33'
    },
    'rus': {
        name: 'Russia',
        start: 1569755400000,
        length: '1:33:38'
    },
    'jpn': {
        name: 'Japan',
        start: 1570943400000
    },
    'mex': {
        name: 'Mexico',
        start: 1572203400000
    },
    'usa': {
        name: 'United States',
        start: 1572808200000
    },
    'bra': {
        name: 'Brazil',
        start: 1574010600000
    },
    'are': {
        name: 'Abu Dhabi',
        start: 1575205800000
    }
};

let mainDataUrls = ['https://f1stats.4lima.de/getData.php', 'https://f1status.000webhostapp.com/getData.php'];
let backupDataUrl = 'http://wotmods.square7.ch/getData.php';
let dataUrl = mainDataUrls[Math.floor(Math.random() * mainDataUrls.length)];
dataUrl = mainDataUrls[0];

let cachedRaceData = {};
let lineChart = undefined;
let timeOffset = 1800;

function showTable(selectedRaces) {
    console.log("Showing comparison between " + selectedRaces[0].name + " and " + selectedRaces[1].name);

    let requests = [];
    let chartData = [];
    let error = false;
    for(let i = 0; i < selectedRaces.length; i++) {
        if(cachedRaceData[selectedRaces[i].name] !== undefined) {
            if(cachedRaceData[selectedRaces[i].name].getOffset() === timeOffset) {
                console.log("Cache hit: " + selectedRaces[i].name);
                console.log("Pre: ", chartData);
                chartData.push(cachedRaceData[selectedRaces[i].name]);
                console.log("Post: ", chartData);
            }
        } else {
            requests.push(
                $.get({
                    url: dataUrl,
                    data: {
                        type: 'data',
                        from: selectedRaces[i].start / 1000 - timeOffset,
                        to: selectedRaces[i].start / 1000  + parseTime(selectedRaces[i].length) + timeOffset
                    },
                    success: function (requestData) {
                        chartData.push(new RaceData(selectedRaces[i].name, JSON.parse(requestData), selectedRaces[i].start));
                        cachedRaceData[selectedRaces[i].name] = new RaceData(selectedRaces[i].name, JSON.parse(requestData), selectedRaces[i].start);
                    },
                    error: function (e) {
                        console.error(e);
                        error = true;
                    }
                })
            );
        }
    }

    $.when(requests[0], requests[1]).then(function () {
        if(!error) {
            updateChartData();
        }
    });
    
    function updateChartData() {
        let options = {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }],
                xAxes: [{
                    type: 'linear'
                }]
            },
            tooltips: {
                callbacks: {
                    title: function(tooltipItem) {
                        let pre = '-';
                        if(tooltipItem[0].label > 0) {
                            pre = '+';
                        }
                        return 'Start ' + pre + Math.round(tooltipItem[0].label)+"min";
                    },
                    label: function(tooltipItem, data) {
                        return data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel + ' users';
                    },
                }
            },
            maintainAspectRatio: false,
            responsive: true,
        };

        if(lineChart === undefined) {
            let ctx = $('#chart');
            lineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: chartData[0].getName(),
                        data: chartData[0].getF1(),
                        fill: false,
                        borderColor: '#ee5000',
                        backgroundColor: '#ee5000',
                        pointRadius: 3
                    },
                    {
                        label: chartData[1].getName(),
                        data: chartData[1].getF1(),
                        fill: false,
                        borderColor: '#0010ee',
                        backgroundColor: '#0010ee',
                        pointRadius: 3
                    }]
                }
            }, options);
        }
        for(let i = 0; i < chartData.length; i++) {
            lineChart.data.datasets[i].label = chartData[i].getName();
            lineChart.data.datasets[i].data = chartData[i].getF1();
            lineChart.options = options;
        }
        lineChart.update();
    }
}

function getSelectedRaces() {
    let compareSource = $('#compareSource');
    let compareTarget = $('#compareTarget');
    let source = compareSource.val();
    let target = compareTarget.val();
    return [races[source], races[target]];
}

function fillSelectOptions() {
    let compareSource = $('#compareSource');
    let compareTarget = $('#compareTarget');
    for(let shorthand in races) {
        let race = races[shorthand];
        let name = race.name;
        let length = parseTime(race.length);
        let start = race.start;
        let disabled = true;

        let now = new Date().getTime();
        if(now > start + length * 1000) {
            disabled = false;
        }
        $('<option>', {
            disabled: disabled,
            value: shorthand,
            text: name
        }).appendTo([compareSource, compareTarget]);
    }
    $('#compareBtn').prop('disabled', false);
    compareTarget.val('rus');
}

/**
 * Returns a time string in the format hh:mm:ss in seconds
 * @param time
 * @returns {number}
 */
function parseTime(time) {
    if(time !== undefined) {
        let parts = time.split(':');
        if (parts.length === 3) {
            return (parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]));
        }
    }
    //If race length is not specified return maximum race length of 2h
    return 7200;
}

$(function() {
    fillSelectOptions();
    $('#compareBtn').on('click', function () {
        showTable(getSelectedRaces());
    });
});


class RaceData {
    constructor(name, data, start) {
        if(data[0].length === 2) {
            data.splice(0, 1);
        }
        this.name = name;
        this.timeOffset = timeOffset;

        this.f1 = [];
        this.f1_5 = [];
        this.f1feeder = [];
        for(let i = 0; i < data.length; i++) {
            let date = (new Date(parseInt(data[i][0]) * 1000) - start) / 1000 / 60;
            this.f1.push({x: date, y: parseInt(data[i][1])});
            this.f1_5.push({x: date, y: parseInt(data[i][2])});
            this.f1feeder.push({x: date, y: parseInt(data[i][3])});
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

class Race {
    constructor(shorthand) {
        if(races[shorthand] !== undefined) {
            this.name = races[shorthand].name;
            this.start = races[shorthand].start;
            this.end = races[shorthand].end;
        }
    }
}