//Checks if darkmode local storage is set
function darkModeEnabled() {
    if(localStorage.getItem('darkMode') !== null) {
        return JSON.parse(localStorage.getItem('darkMode'));
    }
    return true;
}

//Enable or disable dark mode
let moonIcon = $('.moon');
let sunIcon = $('.sun');
function setDarkMode(active) {
    if(active) {
        sunIcon.each(function() {
            $(this).addClass('active');
        });
        moonIcon.each(function() {
            $(this).removeClass('active');
        });
        //moonIcon.addClass('active');
        //sunIcon.removeClass('active');
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
        moonIcon.each(function() {
            $(this).addClass('active');
        });
        sunIcon.each(function() {
            $(this).removeClass('active');
        });
        //sunIcon.addClass('active');
        //moonIcon.removeClass('active');
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
    if(dataUrl === mainDataUrls[0] && tries === 0) {
        dataUrl = mainDataUrls[1];
    } else if(dataUrl === mainDataUrls[1] && tries === 0) {
        dataUrl = mainDataUrls[0];
    } else {
        if (dataUrl === mainDataUrls[0] || dataUrl === mainDataUrls[1]) {
            dataUrl = backupDataUrl;
        } else {
            dataUrl = mainDataUrls[Math.floor(Math.random() * mainDataUrls.length)];
        }
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
    $("<a />", {
        "download": "formula1.png",
        "href": base64
    }).appendTo("body").on('click', function () {
        $(this).remove();
    })[0].click();
}