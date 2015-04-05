function loadComponent (componentName, ext) {
    var component = require ('./app/js/' + componentName + (typeof ext !== 'undefined' ? '.' + ext : '.js'));
    return component;
}



$(function() {  
    var init = loadComponent('init');
    init();
});