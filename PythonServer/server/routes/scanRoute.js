const { Router } = require("express");
const Scanner = require("../scanner/scanner");
const scanRouter = Router();
var newScanner = new Scanner();
scanRouter.post("/", (req, res) => {
  var { input } = req.body;
  console.log(input);
  newScanner.scan(input.toString());
  console.log(newScanner.tokenList);
  newScanner.tokenList.forEach((token) => {
    console.log(token);
  });
  res.json({
    message: input,
  });
});

module.exports = scanRouter;
