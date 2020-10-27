const { Router } = require("express");
const fs = require("fs");
const parser = require('../parser/grammar');
const parserRouter = Router();
const generateHTMLErrors = require('../reports/errorList');
const Tree = require('../parser/AST/graphAST');
const exec = require('child_process').exec

parserRouter.post('/', async (req, res) => {
    let newTree = new Tree();
    let {input} = req.body
    let errorList = parser.parse(input.toString()).errorList;
    let traduction = parser.parse(input.toString()).traduction;
    let root = parser.parse(input.toString());
    let dot = newTree.graph(root);
    dot += '\n}';

    fs.writeFile('ast.dot', dot, (error) => {
        if(error){
          console.log(error)
        } else {
            exec("dot -Tpdf ast.dot -o ast.pdf", (error, data, getter) => {
                if(error){
                  console.log("error",error.message);
                  return;
                }
                if(getter){
                  console.log("data",data);
                  return;
                }
                console.log("data",data);
              
              });
        }
      });
    generateHTMLErrors(errorList);

    fs.writeFile('public/traduccion.js', traduction, (error) => {
        if(error){
          console.log(error)
        } 
      });
      
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200;
      res.json({
        errors: errorList,
      });
});

parserRouter.get('/downloadTranslation', (req, res) => {
    res.download('public/traduccion.js', 'traduccion.js')
  });

module.exports = parserRouter;