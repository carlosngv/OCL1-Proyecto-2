"use strict";

/*(function() {
    let dest = location.hash.slice(1);
    if (dest) {
        let tab = document.getElementById(dest);
        if(tab) {
            tab.click();
        }
    }
})();*/
var tabsArray = Array.prototype.slice.apply(document.querySelectorAll(".tabs_item")); // converting into array
var panelsArray = Array.prototype.slice.apply(document.querySelectorAll(".panels_item"));

var fragment = document.createDocumentFragment();
console.log(fragment);

var open = document.getElementById("open").addEventListener("click", () => {
    console.log("HOLA");
});
var cont = 1;
var newTab = document.getElementById("new").addEventListener("click", () => {
    cont = cont + 1
    let tabs = document.getElementById("tabs"); // Tab container
    let panels = document.getElementById("panels"); // Panel conatainer 

    // New tab
    let fragment = document.createDocumentFragment();
    let newTab = document.createElement("li");
    newTab.setAttribute('class', 'tabs_item');
    newTab.textContent = 'Tab ' + String(cont);
    fragment.appendChild(newTab);
    tabs.appendChild(fragment);

    // New panel
    fragment = document.createDocumentFragment();
    let newPanelContainer = document.createElement('div');
    newPanelContainer.setAttribute('class', 'panels_item');
    let panelContent = document.createElement("p");
    panelContent.textContent= "HOLA";
    newPanelContainer.appendChild(panelContent);
    fragment.appendChild(newPanelContainer);
    panels.appendChild(fragment);

    // updates the tabs and panels array
    tabsArray = Array.prototype.slice.apply(document.querySelectorAll(".tabs_item"));
    panelsArray = Array.prototype.slice.apply(document.querySelectorAll(".panels_item"));

});
(function (d) {
  
  d.getElementById("tabs").addEventListener("click", (e) => {
    if (e.target.classList.contains("tabs_item")) {
      let i = tabsArray.indexOf(e.target);
      tabsArray.map((tab) => {
        tab.classList.remove("active_tab");
      });
      tabsArray[i].classList.add("active_tab");
      panelsArray.map((panel) => {
        panel.classList.remove("active_pan");
      });
      panelsArray[i].classList.add("active_pan");
    }
  });
})(document);
