const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
var Scanner = require("./scanner/scanner");
const fs = require("fs");
const generateHTML = require('./reports/tokenList');

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), () => {
  console.log("Server listening on port", app.get("port"));
});

const newScanner = new Scanner();

fs.readFile("./example.java", (err, data) => {
  if (err) throw err;
  data = data.toString();
  newScanner.scan(data);
  fs.writeFile("./TokensList.html", generateHTML(newScanner.tokenList), (error) => {
    console.log(error);
  });
});
