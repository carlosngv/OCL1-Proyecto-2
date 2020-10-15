const { Router } = require("express");
const generateHTML = require('../reports/tokenList');
const Scanner = require("../scanner/scanner");
const scanRouter = Router();
var newScanner = new Scanner();
scanRouter.post("/", (req, res) => {
  var { input } = req.body;
  console.log(input);
  newScanner.scan(input.toString());
  console.log(newScanner.tokenList);
  generateHTML(newScanner.tokenList);
  res.json({
    message: input,
  });
});

module.exports = scanRouter;
