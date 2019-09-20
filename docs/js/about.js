setDarkMode(darkModeEnabled());

function setDarkMode(active) {
    if(active) {
        $('body').addClass('dark');
    } else {
        $('body').removeClass('dark');
    }
}

function darkModeEnabled() {
    if(localStorage.getItem('darkMode') !== null) {
        return JSON.parse(localStorage.getItem('darkMode'));
    }
    return true;
}