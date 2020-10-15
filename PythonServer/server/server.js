const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
var Scanner = require("./scanner/scanner");
const fs = require("fs");
const generateHTML = require('./reports/tokenList');
const scanRouter = require('./routes/scanRoute');

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), () => {
  console.log("Server listening on port", app.get("port"));
});

/*  const newScanner = new Scanner();

fs.readFile("./example2.java", (err, data) => {
  if (err) throw err;
  data = data.toString();
  newScanner.scan(data);
  newScanner.tokenList.forEach(token => {
    console.log(token);
  })
  fs.writeFile("./TokensList.html", generateHTML(newScanner.tokenList), (error) => {
    if(error) {
      console.log(error);
    }
  });
}); 
 */

app.use('/scan', scanRouter)


