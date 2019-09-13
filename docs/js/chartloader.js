let mainDataUrls = ['https://f1stats.4lima.de/getData.php', 'https://f1status.000webhostapp.com/getData.php'];
let backupDataUrl = 'https://lshallo.eu/f1stats/getData.php';
let dataUrl = mainDataUrls[Math.floor(Math.random() * mainDataUrls.length)];
let lineChart = undefined;
let filterButton = $('#apply-filter-button');

//JSON export
let datasets = {};
let exportJsonHandler = undefined;

//Excel export
let xlsData = [];
let exportXlsHandler = undefined;

function showTable(from, to) {
    if(from === undefined || to === undefined) {
        $.get({
            url: dataUrl,
            data: {'type': 'data'},
            success: function(data) {
                chartCallback(JSON.parse(data));
            },
            error: function(error) {
                switchUrls();
            }
        });
    } else {
        $.get({
            url: dataUrl,
            data: {'type': 'data', 'to': to, 'from': from},
            success: function(data) {
                chartCallback(JSON.parse(data));
            },
            error: function(error) {
                switchUrls(from, to);
            }
        });
    }

    function chartCallback(chartData) {
        xlsData = chartData;
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
        datasets = {'r/formula1': dataListF1, 'r/formula1point5': dataListF1_5, 'r/f1feederseries': dataListF1Feeder};

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

            if(exportJsonHandler !== undefined) {
                $('#export-json').off('click', '#export-json', exportJsonHandler);
            }
            exportJsonHandler = $("#export-json").on('click',function() {
                $("<a />", {
                    "download": "data.json",
                    "href" : "data:application/json," + encodeURIComponent(JSON.stringify(datasets))
                }).appendTo("body").on('click', function() {
                    $(this).remove()
                })[0].click();
            });

            if(exportXlsHandler !== undefined) {
                $('#export-xls').off('click', '#export-json', exportXlsHandler);
            }
            exportXlsHandler = $("#export-xls").on('click',function() {
                let pre = new Date();
                for(let i in xlsData) {
                    xlsData[i][0] = new Date(xlsData[i][0] * 1000);
                    xlsData[i][1] = parseInt(xlsData[i][1]);
                    xlsData[i][2] = parseInt(xlsData[i][2]);
                    xlsData[i][3] = parseInt(xlsData[i][3]);
                }
                xlsData.unshift(["date", "formula1", "formula1point5", "f1feederseries"]);
                let workbook = XLSX.utils.book_new();
                let worksheet = XLSX.utils.aoa_to_sheet(xlsData);
                XLSX.utils.book_append_sheet(workbook, worksheet,"formula1 Stats");
                XLSX.writeFile(workbook, "formula1Stats.xlsx", {'cellDates': true});
                console.log("Excel conversion took " + (new Date().getTime() - pre.getTime()) + "ms");
                $('.toast').toast('show');
            });
        }

        filterButton.prop('disabled', false);
    }
}

const maxTries = 5;
let tries = 0;
function switchUrls(from, to) {
    if(dataUrl === mainDataUrls[0] || dataUrl === mainDataUrls[1]) {
        dataUrl = backupDataUrl;
    } else {
        dataUrl = mainDataUrls[Math.floor(Math.random() * mainDataUrls.length)];
    }
    if(tries++ < maxTries) {
        if (to === undefined || from === undefined) {
            showTable()
        } else {
            showTable(from, to)
        }
    }
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
    let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    $('#datepicker-from').val(yesterday.toLocaleDateString() + ' ' + yesterday.toLocaleTimeString());
    $('#datepicker-to').val(today.toLocaleDateString() + ' ' + today.toLocaleTimeString());

    $('#togglePoints').on('click',function () {
        showPoints(this.checked);
    });

    filterButton.on('click', function() {
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

    $.get({
        url: dataUrl,
        data: {'type': 'minmax'}
    }).done(function (data) {
        data = JSON.parse(data);
        $('.datepicker').flatpickr({
            minDate: data[0] * 1000,
            maxDate: data[1] * 1000,
            enableTime: true,
            dateFormat: "d/m/Y H:i",
            time_24hr: true
        });
    });

    showTable(Math.round(yesterday.getTime()/1000), Math.round(today.getTime()/1000));
});