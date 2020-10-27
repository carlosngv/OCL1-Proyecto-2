const { Router } = require("express");
const fs = require("fs");
const parser = require("../parser/grammar");
const parserRouter = Router();
const generateHTMLErrors = require("../reports/errorList");
const Tree = require("../parser/AST/graphAST");
const { exec } = require("child_process");

parserRouter.post("/", (req, res) => {
  let newTree = new Tree();
  let { input } = req.body;
  let errorList = parser.parse(input.toString()).errorList;
  let traduction = parser.parse(input.toString()).traduction;
  let root = parser.parse(input.toString());
  let dot = newTree.graph(root);
  dot += "\n}";

  generateHTMLErrors(errorList);

  fs.writeFile("public/traduccion.js", traduction, (error) => {
    if (error) {
      console.log(error);
    }
  });
generateAST(dot);
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.json({
    errors: errorList,
  });
});

function generateAST(dot) {
  fs.writeFile("ast.dot", dot, (error) => {
    if (error) {
      console.log(error);
    }
  });
  exec("dot -Tpdf ast.dot -o public/ast.pdf", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

parserRouter.get("/downloadTranslation", (req, res) => {
  res.download("public/traduccion.js", "traduccion.js");
});

parserRouter.get("/downloadAST", (req, res) => {
  res.download("public/ast.pdf", "ast.pdf");
});

module.exports = parserRouter;
