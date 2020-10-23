const { Router } = require("express");
const generateHTML = require('../reports/tokenList');
const Scanner = require("../scanner/scanner");
const Parser = require("../parser/parser2");
const scanRouter = Router();
var newScanner = new Scanner();
scanRouter.post("/", (req, res) => {
  var { input } = req.body;
  newScanner.scan(input.toString());
  generateHTML(newScanner.tokenList);
  var newParser = new Parser(newScanner.tokenList);
  newParser.parse()
  /* console.log(newParser.stringTraduccion);
  console.log('---------------------------------------------------------------------------------');
  console.log('ERRORES', newParser.errorList); */
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200;
  res.json({
    errors: newParser.errorList,
  });
});

module.exports = scanRouter;
