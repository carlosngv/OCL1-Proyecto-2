import CodeMirror from "../codemirror/src/codemirror.js";

var tabsArray = Array.prototype.slice.apply(
  document.querySelectorAll(".tabs_item")
); // converting into array
var panelsArray = Array.prototype.slice.apply(
  document.querySelectorAll(".panels_item")
);

// Open file
const fileAux = document.getElementById("myFile");
fileAux.addEventListener("change", (e) => {
  tabsArray = Array.prototype.slice.apply(
    document.querySelectorAll(".tabs_item")
  ); // converting into array
  panelsArray = Array.prototype.slice.apply(
    document.querySelectorAll(".panels_item")
  );
  console.log(fileAux.files);
  let file = fileAux.files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    cont = cont + 1;
    let tabs = document.getElementById("tabs"); // Tab container
    let panels = document.getElementById("panels"); // Panel conatainer

    // New tab
    let fragment = document.createDocumentFragment();
    let newTab = document.createElement("li");
    newTab.setAttribute("class", "tabs_item");
    newTab.textContent = file.name;
    fragment.appendChild(newTab);
    tabs.appendChild(fragment);

    // New panel
    fragment = document.createDocumentFragment();
    let newPanelContainer = document.createElement("div");
    newPanelContainer.setAttribute("class", "panels_item");
    let panelContent = document.createElement("textarea");
    panelContent.setAttribute("id", "editor");
    panelContent.setAttribute("class", "editor");

    var contents = e.target.result;
    panelContent.value = contents;

    newPanelContainer.appendChild(panelContent);
    fragment.appendChild(newPanelContainer);
    panels.appendChild(fragment);

    // updates the tabs and panels array
    tabsArray = Array.prototype.slice.apply(
      document.querySelectorAll(".tabs_item")
    );
    panelsArray = Array.prototype.slice.apply(
      document.querySelectorAll(".panels_item")
    );
    console.log(tabsArray);

    newEditor(cont);
  };
  console.log(file);
  reader.readAsText(file);
});

var fragment = document.createDocumentFragment();
console.log(fragment);

var cont = 1;

document.getElementById("new").addEventListener("click", () => {
  cont = cont + 1;
  let tabs = document.getElementById("tabs"); // Tab container
  let panels = document.getElementById("panels"); // Panel conatainer

  // New tab
  let fragment = document.createDocumentFragment();
  let newTab = document.createElement("li");
  newTab.setAttribute("class", "tabs_item");
  newTab.textContent = "Tab " + String(cont);
  fragment.appendChild(newTab);
  tabs.appendChild(fragment);

  // New panel
  fragment = document.createDocumentFragment();
  let newPanelContainer = document.createElement("div");
  newPanelContainer.setAttribute("class", "panels_item");
  let panelContent = document.createElement("textarea");
  panelContent.setAttribute("id", "editor");
  panelContent.setAttribute("class", "editor");

  newPanelContainer.appendChild(panelContent);
  fragment.appendChild(newPanelContainer);
  panels.appendChild(fragment);

  // updates the tabs and panels array
  tabsArray = Array.prototype.slice.apply(
    document.querySelectorAll(".tabs_item")
  );
  panelsArray = Array.prototype.slice.apply(
    document.querySelectorAll(".panels_item")
  );

  newEditor(cont);
});

(function (d) {
  d.getElementById("tabs").addEventListener("click", (e) => {
    tabsArray = Array.prototype.slice.apply(
      document.querySelectorAll(".tabs_item")
    ); // converting into array
    panelsArray = Array.prototype.slice.apply(
      document.querySelectorAll(".panels_item")
    );

    console.log(tabsArray);
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

function newEditor(index) {
  index = index - 1;
  let editors = Array.prototype.slice.apply(
    document.querySelectorAll(".editor")
  );
  console.log(editors);
  var editor = CodeMirror.fromTextArea(editors[index], {
    lineNumbers: true,
    mode: "text/x-java",
    theme: 'dracula',
    matchBrackets: true,
    autoCloseBrackets: true,
  });
  editor.setSize("470", "450");
}
