const { Router } = require("express");
const generateHTML = require('../reports/tokenList');
const Scanner = require("../scanner/scanner");
const Parser = require("../parser/parser");
const scanRouter = Router();
var newScanner = new Scanner();
scanRouter.post("/", (req, res) => {
  var { input } = req.body;
  newScanner.scan(input.toString());
  generateHTML(newScanner.tokenList);
  var newParser = new Parser(newScanner.tokenList);
  newParser.parse()
  res.json({
    message: input,
  });
});

module.exports = scanRouter;
