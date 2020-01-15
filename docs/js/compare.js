let races = {
    '2019': {
        'sgp': {
            id: 14,
            name: 'Singapore',
            start: 1569154200000,
            length: '1:58:33'
        },
        'rus': {
            id: 15,
            name: 'Russia',
            start: 1569755400000,
            length: '1:33:38'
        },
        'jpn': {
            id: 16,
            name: 'Japan',
            start: 1570943400000,
            length: '1:21:46'
        },
        'mex': {
            id: 17,
            name: 'México',
            start: 1572203400000,
            length: '1:36:48'
        },
        'usa': {
            id: 18,
            name: 'United States',
            start: 1572808200000,
            length: '1:33:55'
        },
        'bra': {
            id: 19,
            name: 'Brazil',
            start: 1574010600000,
            length: '1:33:14'
        },
        'are': {
            id: 20,
            name: 'Abu Dhabi',
            start: 1575205800000,
            length: '1:34:05'
        }
    },
    '2020': {
        'aus': {
            id: 0,
            name: 'Australia',
            start: 1584252600000
        },
        'bhr': {
            id: 1,
            name: 'Bahrain',
            start: 1584893400000
        },
        'vnm': {
            id: 2,
            name: 'Vietnam',
            start: 1587373800000
        },
        'chn': {
            id: 3,
            name: 'China',
            start: 1587283800000
        },
        'nld': {
            id: 4,
            name: 'Netherlands',
            start: 1588522200000
        },
        'esp': {
            id: 5,
            name: 'Spain',
            start: 1589123400000
        },
        'mco': {
            id: 6,
            name: 'Monaco',
            start: 1590333000000
        },
        'aze': {
            id: 7,
            name: 'Azerbaijan',
            start: 1591539000000
        },
        'can': {
            id: 8,
            name: 'Canada',
            start: 1592165400000
        },
        'fra': {
            id: 9,
            name: 'France',
            start: 1593357000000
        },
        'aut': {
            id: 10,
            name: 'Austria',
            start: 1593961800000
        },
        'gbr': {
            id: 11,
            name: 'Great Britain',
            start: 1595171400000
        },
        'hun': {
            id: 12,
            name: 'Hungary',
            start: 1596381000000
        },
        'bel': {
            id: 13,
            name: 'Belgium',
            start: 1598800200000
        },
        'ita': {
            id: 14,
            name: 'Italy',
            start: 1599405000000
        },
        'sgp': {
            id: 15,
            name: 'Singapore',
            start: 1600611000000
        },
        'rus': {
            id: 16,
            name: 'Russia',
            start: 1601212200000
        },
        'jpn': {
            id: 17,
            name: 'Japan',
            start: 1602400200000
        },
        'usa': {
            id: 18,
            name: 'United States',
            start: 1603653000000
        },
        'mex': {
            id: 19,
            name: 'México',
            start: 1604261400000
        },
        'bra': {
            id: 20,
            name: 'Brazil',
            start: 1605463800000
        },
        'are': {
            id: 21,
            name: 'Abu Dhabi',
            start: 1606659000000
        }
    }
};

let mainDataUrls = ['https://f1stats.4lima.de/getData.php', 'https://f1status.000webhostapp.com/getData.php'];
let dataUrl = mainDataUrls[Math.floor(Math.random() * mainDataUrls.length)];

let cachedRaceData = {};
let lineChart = undefined;
let chartColors = ['#365eff', '#b93432'];
let timeOffset = 5400;

let exportJsonHandler = undefined;
let exportImageHandler = undefined;

function showTable(selectedRaces) {
    let loading = $('.loading');
    let compareBtn = $('#compareBtn');
    $('#helpText').remove();
    loading.animateWidth(38, 38, 1);
    compareBtn.prop('disabled', true);
    console.log("Showing comparison between " + selectedRaces[0].year + '-' + selectedRaces[0].name + " and " + selectedRaces[1].year + '-' + selectedRaces[1].name);

    let chartData = [];
    let requestedRaces = [];
    let fromTimes = [];
    let toTimes = [];
    for(let i = 0; i < selectedRaces.length; i++) {
        let raceName = selectedRaces[i].year + '-' + selectedRaces[i].name;
        if(cachedRaceData[raceName] !== undefined) {
            if(cachedRaceData[raceName].getOffset() === timeOffset && cachedRaceData[raceName].name === selectedRaces[i].name && cachedRaceData[raceName].year === selectedRaces[i].year) {
                console.log("Cache hit: " + raceName);
                console.log("Data: ", cachedRaceData[raceName]);
                chartData.push(cachedRaceData[raceName]);
            }
        } else {
            let from = selectedRaces[i].start;
            let to = selectedRaces[i].start / 1000 + 7200; //Get 2h from race start
            requestedRaces.push({name: selectedRaces[i].name, year: selectedRaces[i].year, start: from});
            fromTimes.push(Math.round(from / 1000 - timeOffset / 2));
            toTimes.push(Math.round(to + timeOffset));
        }
    }
    if(fromTimes.length > 0 && toTimes.length > 0) {
        $.get({
            url: dataUrl,
            data: {
                type: 'multi',
                from: fromTimes,
                to: toTimes
            },
            timeout: 30000,
            success: function (requestData) {
                let data = JSON.parse(requestData);
                for (let i = 0; i < data.length; i++) {
                    let raceName = selectedRaces[i].year + '-' + selectedRaces[i].name;
                    cachedRaceData[raceName] = new RaceData(requestedRaces[i].name, requestedRaces[i].year, data[i], requestedRaces[i].start);
                    chartData.push(new RaceData(requestedRaces[i].name, requestedRaces[i].year, data[i], requestedRaces[i].start));
                }
                updateChartData();
            },
            error: function (e) {
                console.error(e);
                switchUrls(selectedRaces);
            }
        });
    } else {
        updateChartData();
    }
    
    function updateChartData() {
        let options = {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Time relative to start'
                    },
                    type: 'linear',
                    ticks: {
                        min: -timeOffset / 60 / 2,
                        max: timeOffset / 60 + parseTime(undefined) / 60,
                        stepSize: 15
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    title: function(tooltipItem) {
                        let pre = '';
                        if(parseInt(tooltipItem[0].label) >= 0) {
                            pre = '+';
                        }
                        return 'Start ' + pre + Math.round(tooltipItem[0].label)+"min";
                    },
                    label: function(tooltipItem, data) {
                        return data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel + ' users';
                    },
                },
                mode: 'label'
            },
            maintainAspectRatio: false,
            responsive: true,
            annotation: {
                annotations: generateAnnotations()
            }
        };

        function generateAnnotations() {
            let annotations = [{
                    type: 'line',
                    drawTime: 'afterDatasetsDraw',
                    mode: 'vertical',
                    scaleID: 'x-axis-0',
                    value: 0,
                    borderColor: darkModeEnabled()?'#ccc':'#222',
                    borderWidth: 2,
                    label: {
                        enabled: true,
                        position: 'top',
                        content: "Start",
                        yAdjust: 10
                    }
                }];
            for(let i = 0; i < chartData.length; i++) {
                annotations.push({
                    type: 'line',
                    drawTime: 'afterDatasetsDraw',
                    mode: 'vertical',
                    scaleID: 'x-axis-0',
                    value: chartData[i].duration,
                    borderColor: chartColors[i] + 'bb',
                    borderWidth: 2,
                    label: {
                        enabled: true,
                        fontColor: darkModeEnabled()?'#eee':'#444',
                        backgroundColor: chartColors[i] + '77',
                        position: 'top',
                        yAdjust: (i % 2 === 1)? 40 : 10,
                        content: chartData[i].getName() + " finish"
                    }
                });
            }
            return annotations;
        }

        if(lineChart === undefined) {
            let ctx = $('#chart');
            lineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: chartData[0].getName(),
                        data: chartData[0].getF1(),
                        fill: false,
                        borderColor: chartColors[0],
                        backgroundColor: chartColors[0],
                        pointRadius: 1
                    },
                    {
                        label: chartData[1].getName(),
                        data: chartData[1].getF1(),
                        fill: false,
                        borderColor: chartColors[1],
                        backgroundColor: chartColors[1],
                        pointRadius: 1
                    }]
                },
                options: options
            });
        }
        for (let i = 0; i < chartData.length; i++) {
            lineChart.data.datasets[i].label = chartData[i].getName();
            lineChart.data.datasets[i].data = chartData[i].getF1();
            lineChart.options = options;
        }
        //Needs update before setting darkMode to fill in default values
        lineChart.update(0);
        setDarkMode(darkModeEnabled());
        lineChart.update();

        compareBtn.prop('disabled', false);
        loading.animateWidth(0, 0);

        if(exportJsonHandler !== undefined) {
            $('#export-json, #export-json-mobile').off('click');
        }
        exportJsonHandler = $("#export-json, #export-json-mobile").on('click', function () {
            $("<a />", {
                "download": "formula1.json",
                "href": "data:application/json," + encodeURIComponent(JSON.stringify({'r1': chartData[0].getF1(), 'r2': chartData[1].getF1()}))
            }).appendTo("body").on('click', function () {
                $(this).remove();
            })[0].click();
        });

        let exportImg = $('#export-img, #export-img-mobile');
        if(exportImageHandler !== undefined) {
            exportImg.off('click');
        }
        exportImageHandler = exportImg.on('click', function () {
            saveAsImage();
        });

        updateShareUrl(selectedRaces);
    }
}

//Update from and get in the url bar
function updateShareUrl(selectedRaces) {
    let url = new URL(window.location);
    url.search = ""; //remove all previous params
    for(let i = 0; i < selectedRaces.length; i++) {
        url.searchParams.set('r' + i, selectedRaces[i].year + '-' + selectedRaces[i].short);
    }
    $('#shareUrl').attr('value', url.href);
    $('#sharePopover').popover('hide');
}

function getSelectedRaces() {
    let compareSource = $('#compareSource');
    let compareTarget = $('#compareTarget');
    let source = compareSource.val().split('-');
    let sourceYear = source[0];
    let sourceShort = source[1];
    let target = compareTarget.val().split('-');
    let targetYear = target[0];
    let targetShort = target[1];

    let sourceObj = races[sourceYear][sourceShort];
    sourceObj.short = sourceShort;
    sourceObj.year = sourceYear;
    let targetObj = races[targetYear][targetShort];
    targetObj.short = targetShort;
    targetObj.year = targetYear;
    return [sourceObj, targetObj];
}

function fillSelectOptionYears() {
    let compareSource = $('#compareSourceYear');
    let compareTarget = $('#compareTargetYear');

    compareSource.on('change.year', function() {
        fillSelectOptions($(this).val(), $('#compareSource'));
    });
    compareTarget.on('change.year', function() {
        fillSelectOptions($(this).val(), $('#compareTarget'));
    });

    for(let year in races) {
        $('<option>', {
            value: year,
            text: year
        }).appendTo([compareSource, compareTarget]);
    }
    compareSource.val(new Date().getFullYear());
    compareTarget.val(new Date().getFullYear());

    fillSelectOptions(new Date().getFullYear(), $('#compareSource'));
    fillSelectOptions(new Date().getFullYear(), $('#compareTarget'));
}

function fillSelectOptions(year, target) {
    target.find('option').remove();
    let completedRaces = [];

    for (let shorthand in races[year]) {
        let race = races[year][shorthand];
        let name = race.name;
        let start = race.start;
        let disabled = true;

        let now = new Date().getTime();
        let valIndex = year + '-' + shorthand;
        if (now > start) {
            completedRaces.push({index: valIndex, start: start});
            disabled = false;
        }
        let title = '';
        if(disabled) {
            title = 'Race not started'
        }
        $('<option>', {
            disabled: disabled,
            value: valIndex,
            text: name,
            title: title
        }).appendTo(target);
    }

    //sort completed races by start time
    completedRaces.sort(function(a, b) {
        if(a.start > b.start) {
            return 1;
        } else if(b.start > a.start) {
            return -1;
        }
        return 0;
    });
    if(completedRaces.length > 0) {
        target.val(completedRaces[completedRaces.length - 1].index);
    }
}

/**
 * Returns a time string in the format hh:mm:ss in seconds
 * @param time
 * @returns {number}
 */
function parseTime(time) {
    if(time !== undefined) {
        //If time includes millis remove millis as the accuracy is unnecessary
        if(time.indexOf('.') !== -1) {
            time = time.split('.')[0];
        }

        let parts = time.split(':');
        if (parts.length === 3) {
            return (parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]));
        }
    }
    //If race length is not specified return maximum race length of 2h
    return 7200;
}

function getDurationOfRaces() {
    let requestPending = false;
    for(let year in races) {
        for (let short in races[year]) {
            if (races[year][short].start < new Date().getTime() && races[year][short].length === undefined) {
                requestPending = true;
                let raceNum = races[year][short].id;
                let requestUrl = "https://ergast.com/api/f1/" + year + "/" + (raceNum + 1) + "/results.json";
                $.get({
                    url: requestUrl,
                    success: function (data) {
                        try {
                            let time = data['MRData']['RaceTable']['Races'][0]['Results'][0]['Time']['time'];
                            console.log(races[year][short].length);
                            races[year][short].length = time.split('.')[0].toString();
                            console.log(races[year][short].length);
                            this.duration = parseTime(time) / 60;
                        } catch (e) {
                            console.error(e);
                        }
                        $('#compareBtn').prop('disabled', false);
                        requestPending = false;
                    },
                    error: function (err) {
                        console.error("Request to ergast api failed. Assuming race took 2h maximum time.");
                        //Should ergast be not available fill with maximum time a race needs
                        races[year][short].length = '2:00:00';
                        this.duration = 120;
                        $('#compareBtn').prop('disabled', false);
                        requestPending = false;
                    }
                });
            }
        }
    }
    if(!requestPending) {
        $('#compareBtn').prop('disabled', false);
    }
}

$(function() {
    fillSelectOptionYears();
    getDurationOfRaces();
    setDarkMode(darkModeEnabled());
    $('#compareBtn').on('click', function () {
        showTable(getSelectedRaces());
    });
    $('#togglePoints').on('click', function () {
        showPoints($(this).prop('checked'));
    });
    $('#darkModeToggle').on('click', function () {
        setDarkMode(!darkModeEnabled());
    });

    let params = handleGetParameters();
    if(params[0] !== null && params[1] !== null) {
        let p0 = params[0].toString().split('-');
        let p1 = params[1].toString().split('-');
        let r1 = races[p0[0]][p0[1]];
        r1.year = p0[0];
        r1.short = p0[1];
        let r2 = races[p1[0]][p1[1]];
        r2.year = p1[0];
        r2.short = p1[1];
        let selectedRaces = [r1, r2];
        showTable(selectedRaces);
    }

    $('#toggle-toolbar').on('click', function() {
        $('#toolbar').toggleClass('active');
        $('#content').toggleClass('active');
    })
});

function handleGetParameters() {
    let url = new URL(window.location);
    return [url.searchParams.get('r0'), url.searchParams.get('r1')];
}

class RaceData {
    constructor(name, year, data, start) {
        if(data[0].length === 2) {
            data.splice(0, 1);
        }
        this.name = name;
        this.year = year;
        this.timeOffset = timeOffset;
        for(let short in races[year]) {
            if(races[year][short].name === this.name) {
                if(races[year][short].length !== undefined) {
                    this.duration = parseTime(races[year][short].length) / 60;
                } else {
                    this.duration = 120;
                }
            }

        }

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

    getYear() {
        return this.year;
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