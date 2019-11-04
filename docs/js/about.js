setDarkMode(darkModeEnabled());

function setDarkMode(active) {
    if(active) {
        document.getElementsByTagName('body')[0].className = "dark";
    } else {
        document.getElementsByTagName('body')[0].className = "";
    }
}

function darkModeEnabled() {
    if(localStorage.getItem('darkMode') !== null) {
        return JSON.parse(localStorage.getItem('darkMode'));
    }
    return true;
}