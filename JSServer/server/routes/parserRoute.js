const { Router } = require("express");
const fs = require("fs");
const parser = require("../parser/grammar");
const parserRouter = Router();
const generateHTMLErrors = require("../reports/errorList");
const generateHTMLTokens = require("../reports/tokenList");

const Tree = require("../parser/AST/graphAST");
const { exec } = require("child_process");
var beautify = require("js-beautify").js;
const { graphviz } = require("node-graphviz");

parserRouter.post("/", async (req, res) => {
  let newTree = new Tree();
  let { input } = req.body;
  let parserExt = parser.parse(input.toString())
  let errorList = parserExt.errorList;
  let traduction = parserExt.traduction;
  let tokenList = parserExt.tokenList;
  var traductionFormatted = beautify(traduction, {
    indent_size: 4,
    space_in_empty_paren: true,
    space_after_anon_function: true,
    brace_style: "collapse",
  });
  traduction = traductionFormatted;
  console.log("TRADUCCIÓN:\n ", traduction);
  let root = parser.parse(input.toString());
  console.log("NUM. ERRORES:", errorList.length);
  
  generateHTMLErrors(errorList);
  generateHTMLTokens(tokenList);
  fs.writeFile("public/traduccion.js", traduction, (error) => {
    if (error) {
      console.log(error);
    }
  });

  if (errorList.length <= 0) {
    let dot = newTree.graph(root);
    dot += "\n}";
    await graphviz.dot(dot, "svg").then((svg) => {
      // Write the SVG to file
      fs.writeFileSync("public/ast.svg", svg);
    });
    await generateAST(dot);
  }
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
   exec("dot -Tsvg ast.dot -o public/ast.svg", (error, stdout, stderr) => {
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
  res.download("public/ast.svg", "ast.svg");
});

module.exports = parserRouter;
