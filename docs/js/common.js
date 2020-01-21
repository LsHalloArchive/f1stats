//Checks if darkmode local storage is set
function darkModeEnabled() {
    if(localStorage.getItem('darkMode') !== null) {
        return JSON.parse(localStorage.getItem('darkMode'));
    }
    return true;
}

//Enable or disable dark mode
function setDarkMode(active) {
    let moonIcon = $('.moon');
    let sunIcon = $('.sun');
    if(active) {
        moonIcon.removeClass('active');
        sunIcon.addClass('active');
        $('body').addClass('dark');
        if(typeof lineChart === 'object') {
            lineChart.options.scales.xAxes[0].ticks.major.fontColor = '#eee';
            lineChart.options.scales.xAxes[0].ticks.minor.fontColor = '#eee';
            lineChart.options.scales.xAxes[0].gridLines.color = 'rgba(255, 255, 255, 0.15)';
            lineChart.options.scales.yAxes[0].ticks.major.fontColor = '#eee';
            lineChart.options.scales.yAxes[0].ticks.minor.fontColor = '#eee';
            lineChart.options.scales.yAxes[0].gridLines.color = 'rgba(255, 255, 255, 0.15)';
            lineChart.options.legend.labels.fontColor = '#eee';
            lineChart.update();
        }

        localStorage.setItem('darkMode', true.toString());
    } else {
        sunIcon.removeClass('active');
        moonIcon.addClass('active');
        $('body').removeClass('dark');
        if(typeof lineChart === 'object') {
            lineChart.options.scales.xAxes[0].ticks.major.fontColor = '#666';
            lineChart.options.scales.xAxes[0].ticks.minor.fontColor = '#666';
            lineChart.options.scales.xAxes[0].gridLines.color = 'rgba(0, 0, 0, 0.1)';
            lineChart.options.scales.yAxes[0].ticks.major.fontColor = '#666';
            lineChart.options.scales.yAxes[0].ticks.minor.fontColor = '#666';
            lineChart.options.scales.yAxes[0].gridLines.color = 'rgba(0, 0, 0, 0.1)';
            lineChart.options.legend.labels.fontColor = '#666';
            lineChart.update();
        }

        localStorage.setItem('darkMode', false.toString());
    }
}

const maxTries = 5;
let tries = 0;
/**
 * Switches the current present data url with either the other main data url or if that also failed with the backup data urö
 * @param from
 * @param to
 */
function switchUrls(from = undefined, to = undefined) {
    if(dataUrl === mainDataUrls[0]) {
        dataUrl = mainDataUrls[1];
    } else if(dataUrl === mainDataUrls[1]) {
        dataUrl = mainDataUrls[0];
    }
    if(tries++ < maxTries) {
        if(from !== undefined && to === undefined) {
            showTable(from);
        }
        if (to === undefined || from === undefined) {
            showTable();
        } else {
            showTable(from, to);
        }
    }
}

/**
 * Save the chart in the variable lineChart as png image named formula1.png
 */
function saveAsImage() {
    let base64 = lineChart.toBase64Image();
    $("<a/>", {
        "download": "formula1.png",
        "href": base64
    }).appendTo("body").on('click', function () {
        $(this).remove();
    })[0].click();
}

/**
 * Sets the pointRadius on the datasets to 1 or 3 depending if *show* is true or false
 * @param show {boolean} radius 1 if false; radius 3 if true
 */
function showPoints(show) {
    if(lineChart !== undefined) {
        let datasets = lineChart.data.datasets;

        if(show) {
            for(let i = 0; i < datasets.length; i++) {
                datasets[i].pointRadius = 3;
            }
        } else {
            for(let i = 0; i < datasets.length; i++) {
                datasets[i].pointRadius = 1;
            }
        }
        lineChart.update(0);
    }
}

$(function () {
   $('[data-toggle="tooltip"]').tooltip();

    //Custom popover content
    $('[data-toggle="popover"]').popover({
        html : true,
        sanitize: false,
        content: function() {
            let content = $(this).attr("data-popover-content");
            return $(content).children(".popover-body").html();
        },
        title: function() {
            let title = $(this).attr("data-popover-content");
            return $(title).children(".popover-heading").html();
        }
    });
    $(document).on('shown.bs.popover', function() {
        $("input.select-focus").on("click", function () {
            $(this).trigger("select");
            document.execCommand('copy');
        });
    });

    //Dynamically bind event to new tooltips in popover
    let body = $('body');
    body.tooltip({
        selector: '[data-toggle=tooltip-click]',
        trigger: 'click',
        delay: {show: 200, hide: 400}
    });
    //Hide popover tooltip after 2s as it does not close automatically
    $(document).on('shown.bs.tooltip', function(e) {
        if($(e.target).hasClass('autohide')) {
            setTimeout(function() {
                $(e.target).tooltip('hide');
            }, 2000);

        }
    });

    //Add custom beforeDraw to chart so the background on exported image is colored
    Chart.plugins.register({
        beforeDraw: function(c) {
            let ctx = c.chart.ctx;
            ctx.fillStyle = $('body').css('background-color');
            ctx.fillRect(0, 0, c.chart.width, c.chart.height);
        }
    });

    //Add smooth transition to color effect after page has loaded to avoid distracting color fade
    body.css('transition', 'background-color .4s');
    $('.datepicker, .input-group-text, .form-control, .custom-control-label, h2').css('transition', 'background-color .4s, border-color .4s');
});

//Extend jQuery with custom function
$.fn.animateWidth = function (width, height, opacity) {
    this.animate({
        'width': width,
        'height': height,
        'opacity': opacity,
    }, 350);
};