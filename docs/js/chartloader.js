let mainDataUrls = ['https://f1stats.4lima.de/getData.php', 'https://f1stats.4lima.de/getData.php?from=$from&to=$to'];
let backupDataUrls = ['https://lshallo.eu/f1stats/getData.php', 'https://lshallo.eu/f1stats/getData.php?from=$from&to=$to'];
let dataUrls = [mainDataUrls[0], mainDataUrls[1]];
let lineChart = undefined;
let filterButton = $('#apply-filter-button');

function showTable(from, to) {
    if(from === undefined || to === undefined) {
        $.get({
            url: dataUrls[0],
            success: function(data) {
                chartCallback($.parseJSON(data));
            },
            error: function(error) {
                switchUrls();
            }
        });
    } else {
        $.get({
            url: dataUrls[1].replace('$from', from).replace('$to', to),
            success: function(data) {
                chartCallback($.parseJSON(data));
            },
            error: function(error) {
                switchUrls(from, to);
            }
        });
    }

    function chartCallback(chartData) {
        let dataListF1 = [];
        let dataListF1_5 = [];
        let dataListF1Feeder = [];
        for (let d of chartData) {
            let date = new Date(d[0] * 1000);
            dataListF1.push(
                {
                    x: date,
                    y: parseInt(d[1])
                }
            );
            dataListF1_5.push(
                {
                    x: date,
                    y: parseInt(d[2])
                }
            );
            dataListF1Feeder.push(
                {
                    x: date,
                    y: parseInt(d[3])
                }
            );
        }

        let ctx = $('#chart');
        let options = {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }],
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: {
                            month: 'DD/MM/YY',
                            day: 'DD/MM/YY HH:mm',
                            hour: 'DD/MM/YY HH:mm',
                            minute: 'DD/MM/YY HH:mm',
                        },
                    },
                    distribution: 'linear'
                }]
            },
            maintainAspectRatio: false,
            responsive: true,
        };
        if(lineChart !== undefined) {
            lineChart.data =  {
                datasets: [{
                    label: 'r/formula1',
                    data: dataListF1,
                    borderColor: "rgb(235, 55, 55)",
                    backgroundColor: "rgb(235, 55, 55)",
                    fill: false,
                    hidden: !lineChart.isDatasetVisible(0),
                },
                {
                    label: 'r/formula1point5',
                    data: dataListF1_5,
                    borderColor: "rgb(235,63,199)",
                    backgroundColor: "rgb(235,63,199)",
                    fill: false,
                    hidden: !lineChart.isDatasetVisible(1),
                },
                {
                    label: 'r/f1feederseries',
                    data: dataListF1Feeder,
                    borderColor: "rgb(235,129,0)",
                    backgroundColor: "rgb(235,129,0)",
                    fill: false,
                    hidden: !lineChart.isDatasetVisible(2),
                }]
            };
            showPoints($('#togglePoints').prop('checked'));
            lineChart.update();
        } else {
            lineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'r/formula1',
                        data: dataListF1,
                        borderColor: "rgb(235, 55, 55)",
                        backgroundColor: "rgb(235, 55, 55)",
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'r/formula1point5',
                        data: dataListF1_5,
                        borderColor: "rgb(235,63,199)",
                        backgroundColor: "rgb(235,63,199)",
                        fill: false,
                        hidden: true,
                        pointRadius: 0
                    },
                    {
                        label: 'r/f1feederseries',
                        data: dataListF1Feeder,
                        borderColor: "rgb(235,129,0)",
                        backgroundColor: "rgb(235,129,0)",
                        fill: false,
                        hidden: true,
                        pointRadius: 0
                    }]
                },
                options: options
            });

            $('.datepicker').flatpickr({
                minDate: new Date(Math.min(findMinimum(dataListF1), findMinimum(dataListF1_5), findMinimum(dataListF1Feeder))),
                maxDate: new Date(Math.max(findMaximum(dataListF1), findMaximum(dataListF1_5), findMaximum(dataListF1Feeder)) + 86400000),
                enableTime: true,
                dateFormat: "d/m/Y H:i",
                time_24hr: true
            });
        }

        /*$('.datepicker').datepicker({
            format: "dd/mm/yyyy",
            startDate: new Date(Math.min(findMinimum(dataListF1), findMinimum(dataListF1_5), findMinimum(dataListF1Feeder))),
            endDate: new Date(Math.max(findMaximum(dataListF1), findMaximum(dataListF1_5), findMaximum(dataListF1Feeder)) + 86400000),
        });*/

        filterButton.prop('disabled', false);
    }
}

const maxTries = 5;
let tries = 0;
function switchUrls(from, to) {
    if(dataUrls[0] === mainDataUrls[0] && dataUrls[1] === mainDataUrls[1]) {
        dataUrls[0] = backupDataUrls[0];
        dataUrls[1] = backupDataUrls[1];
    } else {
        dataUrls[0] = mainDataUrls[0];
        dataUrls[1] = mainDataUrls[1];
    }
    if(tries++ < maxTries) {
        if (to === undefined || from === undefined) {
            showTable()
        } else {
            showTable(from, to)
        }
    }
}

function findMinimum(list) {
    let min = Infinity;
    for(let elem of list) {
        if(elem['x'].getTime() < min) {
            min = elem["x"].getTime();
        }
    }
    return min;
}

function findMaximum(list) {
    let max = 0;
    for(let elem of list) {
        if(elem['x'].getTime() > max) {
            max = elem["x"].getTime();
        }
    }
    return max;
}

function showPoints(show) {
    if(lineChart !== undefined) {
        let datasets = lineChart.data.datasets;

        if(show) {
            for(let i = 0; i < datasets.length; i++) {
                datasets[i].pointRadius = 3;
            }
        } else {
            for(let i = 0; i < datasets.length; i++) {
                datasets[i].pointRadius = 0;
            }
        }
        lineChart.update();
    }
}

$(function() {
    let today = new Date();
    let lastWeek = new Date(new Date().setDate(new Date().getDate() - 7));
    $('#datepicker-from').attr('placeholder', lastWeek.toLocaleDateString());
    $('#datepicker-to').attr('placeholder', today.toLocaleDateString());

    $('#togglePoints').click(function () {
        showPoints(this.checked);
    });

    filterButton.click(function() {
        filterButton.prop('disabled', true);
        try {
            let from = moment($('#datepicker-from').val(), "DD/MM/YYYY HH:mm").toDate();
            let to = moment($('#datepicker-to').val(), "DD/MM/YYYY HH:mm").toDate();
            if(from < to) {
                showTable(from / 1000, to / 1000);
            } else {
                throw new Error("from date greater than to date");
            }
        } catch (e) {
            alert("Please check your date input!");
            filterButton.prop('disabled', false);
            console.error(e);
        }
    });

    showTable(Math.round(lastWeek.getTime()/1000), Math.round(today.getTime()/1000));
});