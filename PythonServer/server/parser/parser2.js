var Error = require("./error");
const fs = require("fs");
const { graphviz } = require("node-graphviz");

class Parser {
  constructor(tokenList) {
    this.tokenList = tokenList;
    this.preAnalysis = tokenList[0];
    this.numPreAnalysis = 0;
    this.errorList = [];
    this.stringTraduccion = "";
    this.defFound = false;
    this.contTab = 0;
    this.elifFound = false;
    this.mainFound = false;
    this.auxMain = "";
    this.llamadaMetodo = false;
    this.forFound = false;
    this.forValue1 = "";
    this.forValue2 = "";
    this.errorFound = false;
    this.doWhileFound = false;
    this.doWhileContent = "";
    this.whileOfDo = false;

    // AST
    this.astString = "digraph G {\n";
    this.nodeCont = 2;
    this.inicioGraphed = false;
    this.primeraSentenciaClase = false;
    this.primeraSentenciaInterfaz = false;
    this.primeraListaClases = false;
    this.padreListaClases = "";
    this.primeraDeclaracionMetodosFunciones = false;
    this.padreDeclaracionMetodosFunciones = "";
    this.padreDeclaracionFunciones = '';
    this.primeraDeclaracionFunciones = false;
  }

  parse() {
    this.Inicio();
  }

  Inicio() {
    if (!this.inicioGraphed) {
      this.astString += "n0" + '[label="INICIO"];\n';
    }
    if (this.preAnalysis.type == "RESERVED_PUBLIC") {
      if (!this.inicioGraphed) {
        this.astString += "n1" + '[label="public"];\n';
        this.inicioGraphed = true;
        this.astString += "n0 -> n1;\n";
      }
      this.match("RESERVED_PUBLIC");
      if (this.preAnalysis.type == "RESERVED_CLASS") {
        this.SentenciaClase();
        this.ListaClases();
        this.Inicio();
        //this.match("LAST");
      } else if (this.preAnalysis.type == "RESERVED_INTERFACE") {
        this.SentenciaInterfaz();
        this.ListaInterfaces();
        this.Inicio();
        //this.match("LAST");
      }
    } else {
      this.match("LAST");
      this.astString += "}";
      console.log(this.astString);
      graphviz.circo(this.astString, "svg").then((pdf) => {
        fs.writeFileSync("ast.svg", pdf);
      });
    }
  }

  SentenciaClase() {
    // public class { LISTA_DECLARACION_METODOS_FUNCIONES }
    if(!this.primeraSentenciaClase){
      this.astString += "n" + this.nodeCont + '[label="public"];\n';
      this.nodeCont++;
    } 
    this.astString += "n" + this.nodeCont + '[label="SENTENCIA_CLASE"];\n';
    let father = "n" + this.nodeCont;
    if (!this.primeraSentenciaClase) {
      this.astString += "n0->n" + (this.nodeCont - 1) + ";\n";
      this.astString += "n0->n" + this.nodeCont + ";\n";
      this.primeraSentenciaClase = true;
    } else {
      this.astString += this.padreListaClases + "->n" + this.nodeCont + ";\n";
    }
    this.nodeCont++;
    this.stringTraduccion += this.preAnalysis.value + " ";
    this.astString += "n" + this.nodeCont + '[label="class"];\n';
    this.nodeCont++;
    this.astString +=
      "n" + (this.nodeCont - 2) + "-> n" + (this.nodeCont - 1) + ";\n";
    this.match("RESERVED_CLASS");
    this.stringTraduccion += this.preAnalysis.value;
    this.astString +=
      "n" + this.nodeCont + '[label="' + this.preAnalysis.value + '"];\n';
    this.astString += father + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("ID");
    this.stringTraduccion += ":\n";
    this.astString += "n" + this.nodeCont + '[label="{"];\n';
    this.astString += father + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("LEFT_BRACE");
    this.contTab++; // Indenta contenido dentro de la clase
    this.astString += "n" + this.nodeCont + '[label="LISTA_DECLARACION_METODOS_FUNC"];\n';
    this.astString += father + "->n" + this.nodeCont + ";\n";
    this.padreDeclaracionMetodosFunciones = 'n' + this.nodeCont
    this.nodeCont++;
    this.ListaDeclaracionMetodosFunciones();
    this.padreDeclaracionMetodosFunciones = '';
    this.stringTraduccion += "\n";
    this.astString += "n" + this.nodeCont + '[label="}"];\n';
    this.astString += father + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RIGHT_BRACE");
    this.contTab--; // Indenta contenido para manterner clases aisladas
  }

  ListaClases() {
    this.Comentario();
    // SENTENCIA_CLASE LISTA_CLASES
    if (
      this.preAnalysis.type == "RESERVED_PUBLIC" &&
      this.tokenList[this.numPreAnalysis + 1].type == "RESERVED_CLASS"
    ) {
      if (!this.primeraListaClases) {
        this.astString += "n" + this.nodeCont + '[label="LISTA_CLASES"];\n';
        this.astString += "n0->n" + this.nodeCont + ";\n";
        this.padreListaClases = "n" + this.nodeCont;
        this.nodeCont++;
        this.primeraListaClases = true;
      }
      this.tabular();
      this.match("RESERVED_PUBLIC");
      this.astString += "n" + this.nodeCont + '[label="public"];\n';
      this.astString += this.padreListaClases + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.SentenciaClase();
      this.ListaClases();
    }
  }

  SentenciaInterfaz() {
    this.astString += "n" + this.nodeCont + '[label="SENTENCIA_INTERFAZ"];\n';
    let father = "n" + this.nodeCont;
    if (!this.primeraSentenciaClase) {
      this.astString += "n0->n" + this.nodeCont + ";\n";
    } else {
      this.astString +=
        "n" + (this.nodeCont - 2) + "->n" + this.nodeCont + ";\n";
    }
    this.nodeCont++;
    this.stringTraduccion += "class ";
    this.astString += "n" + this.nodeCont + '[label="interface"];\n';
    this.astString += father + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_INTERFACE");
    this.stringTraduccion += this.preAnalysis.value;
    this.astString +=
      "n" + this.nodeCont + '[label="' + this.preAnalysis.value + '"];\n';
    this.astString += father + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("ID");
    this.stringTraduccion += ":\n";
    this.astString += "n" + this.nodeCont + '[label="{"];\n';
    this.astString += father + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("LEFT_BRACE");
    this.contTab++; // Indenta contenido dentro de la clase
    this.ListaDeclaracionFunciones();
    this.padreDeclaracionFunciones = '';
    this.astString += "n" + this.nodeCont + '[label="}"];\n';
    this.astString += father + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RIGHT_BRACE");
    this.contTab--; // Indenta contenido para manterner clases aisladas
  }

  ListaInterfaces() {
    this.Comentario();
    if (this.preAnalysis.type == "RESERVED_INTERFACE") {
      this.tabular();
      this.SentenciaInterfaz();
      this.ListaInterfaces();
    }
  }

  ListaDeclaracionMetodosFunciones() {
    this.Comentario();
    if (this.preAnalysis.type == "RESERVED_PUBLIC") {
      this.astString += "n" + this.nodeCont + '[label="DECLARACION_METODOS_FUNCIONES"];\n';
      this.astString += this.padreDeclaracionMetodosFunciones + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.DeclaracionMetodosFunciones();
      this.ListaDeclaracionMetodosFunciones();
    } else if (
      (this.preAnalysis.type == "SEMICOLON" ||
        this.preAnalysis.type == "RIGHT_BRACE") &&
      this.errorFound == true
    ) {
      this.errorFound = false;
      let newError = new Error(
        "Se recuperó del error en la fila " + this.preAnalysis.row
      );
      this.errorList.push(newError);
      this.numPreAnalysis++;
      this.preAnalysis = this.tokenList[this.numPreAnalysis];
      this.DeclaracionMetodosFunciones();
      this.ListaDeclaracionMetodosFunciones();
    }
  }

  ListaDeclaracionFunciones() {
    this.Comentario();
    if (this.preAnalysis.type == "RESERVED_PUBLIC") {
      this.DeclaracionFunciones();
      this.ListaDeclaracionFunciones();
    } else if (
      (this.preAnalysis.type == "SEMICOLON" ||
        this.preAnalysis.type == "RIGHT_BRACE") &&
      this.errorFound == true
    ) {
      this.errorFound = false;
      let newError = new Error(
        "Se recuperó del error en la fila " + this.preAnalysis.row
      );
      this.errorList.push(newError);
      this.numPreAnalysis++;
      this.preAnalysis = this.tokenList[this.numPreAnalysis];
      this.DeclaracionFunciones();
      this.ListaDeclaracionFunciones();
    }
  }

  DeclaracionMetodosFunciones() {
    this.Comentario();
    this.tabular(); // ESTE ES FIJO
    this.match("RESERVED_PUBLIC");
    if (this.preAnalysis.type == "RESERVED_VOID") {
      this.stringTraduccion += "def ";
      this.defFound = true;
      this.match("RESERVED_VOID");
    } else if (this.preAnalysis.type == "RESERVED_STATIC") {
      this.match("RESERVED_STATIC");
      this.mainFound = true;
      this.SentenciaMain();
      return;
    } else if (
      this.preAnalysis.type != "RESERVED_VOID" &&
      this.preAnalysis.type != "RESERVED_STATIC"
    ) {
      this.defFound = true;
      this.stringTraduccion += "def ";
      this.Tipo();
      this.defFound = false;
    }
    this.stringTraduccion += this.preAnalysis.value;
    this.match("ID");
    this.stringTraduccion += this.preAnalysis.value;
    this.match("LEFT_PARENT");
    this.DeclaracionParametros();
  }

  DeclaracionFunciones() {
    this.Comentario();
    this.tabular(); // ESTE ES FIJO
    this.match("RESERVED_PUBLIC");
    this.stringTraduccion += "self ";
    this.Tipo();
    this.stringTraduccion += this.preAnalysis.value;
    this.match("ID");
    this.stringTraduccion += this.preAnalysis.value;
    this.match("LEFT_PARENT");
    this.DeclaracionParametrosInterfaz();
  }

  DeclaracionParametrosInterfaz() {
    if (this.preAnalysis == "RIGHT PARENT") {
      this.stringTraduccion += this.preAnalysis.value;
      this.match("RIGHT_PARENT");
      this.stringTraduccion = this.preAnalysis.value + "\n";
      this.match("SEMICOLON");
    } else {
      this.Tipo();
      this.stringTraduccion += this.preAnalysis.value;
      this.match("ID");
      this.ListaParametros();
      this.stringTraduccion += this.preAnalysis.value;
      this.match("RIGHT_PARENT");
      this.stringTraduccion += this.preAnalysis.value + "\n";
      this.match("SEMICOLON");
    }
  }

  DeclaracionParametros() {
    if (
      this.preAnalysis.type == "RIGHT_PARENT" &&
      this.llamadaMetodo == false
    ) {
      this.stringTraduccion += this.preAnalysis.value + ":\n";
      this.match("RIGHT_PARENT");
      this.ListaInstrLlaves();
    } else if (
      this.llamadaMetodo == false &&
      this.preAnalysis.type != "RIGHT_PARENT"
    ) {
      this.Tipo();
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value;
      } else {
        this.stringTraduccion += this.preAnalysis.value;
      }
      this.match("ID");
      this.ListaParametros();
      this.stringTraduccion += this.preAnalysis.value + ":\n";
      this.match("RIGHT_PARENT");
      this.ListaInstrLlaves();
    } else if (
      this.llamadaMetodo == true &&
      this.preAnalysis.type == "RIGHT_PARENT"
    ) {
      this.stringTraduccion += this.preAnalysis.value + "\n";
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + "\n";
      } else {
        this.stringTraduccion += this.preAnalysis.value + "\n";
      }
      this.match("RIGHT_PARENT");
      this.llamadaMetodo = false;
    } else if (
      this.llamadaMetodo == true &&
      this.preAnalysis.type != "RIGHT_PARENT"
    ) {
      this.Tipo();
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value;
      } else {
        this.stringTraduccion += this.preAnalysis.value;
      }
      this.match("ID");
      this.ListaParametros();
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + "\n";
      } else {
        this.stringTraduccion += this.preAnalysis.value + "\n";
      }
      this.match("RIGHT_PARENT");
      this.llamadaMetodo = false;
    }
  }

  ListaParametros() {
    if (this.preAnalysis.type == "COMMA") {
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + " ";
      } else {
        this.stringTraduccion += this.preAnalysis.value + " ";
      }
      this.match("COMMA");
      this.Tipo();
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value;
      } else {
        this.stringTraduccion += this.preAnalysis.value;
      }
      this.match("ID");
      this.ListaParametros();
    }
  }

  Tipo() {
    if (this.preAnalysis.type == "RESERVED_INT") {
      if (this.forFound != true && this.defFound != true) {
        this.stringTraduccion += "";
      }
      this.match("RESERVED_INT");
    } else if (this.preAnalysis.type == "RESERVED_BOOLEAN") {
      if (this.forFound != true || this.defFound != true) {
        this.stringTraduccion += "";
      }
      this.match("RESERVED_BOOLEAN");
    } else if (this.preAnalysis.type == "RESERVED_DOUBLE") {
      if (this.forFound != true || this.defFound != true) {
        this.stringTraduccion += "";
      }
      this.match("RESERVED_DOUBLE");
    } else if (this.preAnalysis.type == "RESERVED_STRING") {
      if (this.forFound != true || this.defFound != true) {
        this.stringTraduccion += "";
      }
      this.match("RESERVED_STRING");
    } else if (this.preAnalysis.type == "RESERVED_CHAR") {
      if (this.forFound != true || this.defFound != true) {
        this.stringTraduccion += "";
      }
      this.match("RESERVED_CHAR");
    } else if (this.preAnalysis.type == "RESERVED_VOID") {
      if (this.forFound != true || this.defFound != true) {
        this.stringTraduccion += "";
      }
      this.match("RESERVED_VOID");
    }
  }

  Instruccion() {
    this.Comentario();
    if (this.preAnalysis.type == "RESERVED_IF") {
      this.tabular();
      this.SentenciaIf();
    } else if (this.preAnalysis.type == "RESERVED_WHILE") {
      if (this.whileOfDo != true) {
        this.tabular();
        this.SentenciaWhile();
      }
    } else if (this.preAnalysis.type == "RESERVED_DO") {
      this.tabular();
      this.SentenciaDoWhile();
    } else if (this.preAnalysis.type == "RESERVED_FOR") {
      this.tabular();
      this.SentenciaFor();
    } else if (this.preAnalysis.type == "RESERVED_SYSTEM") {
      this.tabular();
      this.SentenciaPrint();
    } else if (this.preAnalysis.type == "RESERVED_CONTINUE") {
      this.tabular();
      this.SentenciaContinue();
    } else if (this.preAnalysis.type == "RESERVED_BREAK") {
      this.tabular();
      this.SentenciaBreak();
    } else if (
      this.preAnalysis.type == "RESERVED_PUBLIC" &&
      this.tokenList[this.numPreAnalysis + 1].type == "RESERVED_STATIC"
    ) {
      this.tabular();
      this.SentenciaMain();
    } else if (
      this.preAnalysis.type == "RESERVED_RETURN" &&
      this.tokenList[this.numPreAnalysis + 1].type == "SEMICOLON"
    ) {
      this.tabular();
      this.SentenciaReturnMetodos();
    } else if (
      this.preAnalysis.type == "RESERVED_RETURN" &&
      this.tokenList[this.numPreAnalysis + 1].type != "SEMICOLON"
    ) {
      this.tabular();
      this.SentenciaReturnFunciones();
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "LEFT_PARENT"
    ) {
      this.tabular();
      this.LlamadaMetodo();
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "EQUALS_SIGN"
    ) {
      this.tabular();
      this.AsignacionSimple();
    } else if (
      this.preAnalysis.type == "RESERVED_INT" ||
      this.preAnalysis.type == "RESERVED_CHAR" ||
      this.preAnalysis.type == "RESERVED_BOOLEAN" ||
      this.preAnalysis.type == "RESERVED_STRING" ||
      this.preAnalysis.type == "RESERVED_DOUBLE"
    ) {
      this.tabular();
      this.DeclaracionVariable();
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "INCREMENT_OPT"
    ) {
      this.tabular();
      this.Incrementable();
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "DECRE_OPT"
    ) {
      this.tabular();
      this.Decrementable();
    }
  }

  ListaInstrucciones() {
    this.Instruccion();
    this.ListaInstruccionesP();
  }

  ListaInstruccionesP() {
    this.Comentario();
    if (this.preAnalysis.type == "RESERVED_IF") {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (this.preAnalysis.type == "RESERVED_WHILE") {
      if (this.whileOfDo != true) {
        this.Instruccion();
        this.ListaInstruccionesP();
      }
    } else if (this.preAnalysis.type == "RESERVED_FOR") {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (this.preAnalysis.type == "RESERVED_DO") {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (this.preAnalysis.type == "RESERVED_SYSTEM") {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (this.preAnalysis.type == "RESERVED_BREAK") {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (this.preAnalysis.type == "RESERVED_CONTINUE") {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "RESERVED_PUBLIC" &&
      this.tokenList[this.numPreAnalysis + 1].type == "RESERVED_STATIC"
    ) {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "RESERVED_RETURN" &&
      this.tokenList[this.numPreAnalysis + 1].type == "SEMICOLON"
    ) {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "RESERVED_RETURN" &&
      this.tokenList[this.numPreAnalysis + 1].type != "SEMICOLON"
    ) {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "LEFT_PARENT"
    ) {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "EQUALS_SIGN"
    ) {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "RESERVED_INT" ||
      this.preAnalysis.type == "RESERVED_CHAR" ||
      this.preAnalysis.type == "RESERVED_BOOLEAN" ||
      this.preAnalysis.type == "RESERVED_STRING" ||
      this.preAnalysis.type == "RESERVED_DOUBLE"
    ) {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (
      (this.preAnalysis.type == "SEMICOLON" ||
        this.preAnalysis.type == "RIGHT_BRACE") &&
      this.errorFound == true
    ) {
      this.errorFound = false;
      let newError = new Error(
        "Se recuperó del error en la fila " + this.preAnalysis.row
      );
      this.errorList.push(newError);
      this.numPreAnalysis++;
      this.preAnalysis = this.tokenList[this.numPreAnalysis];
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "INCREMENT_OPT"
    ) {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "DECRE_OPT"
    ) {
      this.Instruccion();
      this.ListaInstruccionesP();
    }
  }

  ListaInstrLlaves() {
    this.match("LEFT_BRACE");
    this.contTab++;
    this.ListaInstrucciones();
    if (this.doWhileFound == true) {
      this.doWhileContent += "\n";
    } else {
      this.stringTraduccion += "\n";
    }
    this.match("RIGHT_BRACE");
    this.contTab--;
  }

  Incrementable() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " += 1";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " += 1";
    }
    this.match("ID");
    this.match("INCREMENT_OPT");
    this.match("SEMICOLON");
  }

  Decrementable() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " -= 1";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " -= 1";
    }
    this.match("ID");
    this.match("DECREM_OPT");
    thismatch("SEMICOLON");
  }

  SentenciaReturnMetodos() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value;
    } else {
      this.stringTraduccion += this.preAnalysis.value;
    }
    this.match("RESERVED_RETURN");
    this.E(); // Podría omitirse
    this.match("SEMICOLON");
  }

  SentenciaReturnFunciones() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " ";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " ";
    }
    this.match("RESERVED_RETURN");
    this.E();
    this.match("SEMICOLON");
  }

  AsignacionSimple() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " ";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " ";
    }
    this.match("ID");
    this.AsignacionSimpleP();
  }

  AsignacionSimpleP() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " ";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " ";
    }
    this.match("EQUALS_SIGN");
    this.E();
    if (this.doWhileFound) {
      this.doWhileContent += "\n";
    } else {
      this.stringTraduccion += "\n";
    }
    this.match("SEMICOLON");
  }

  Asignacion() {
    this.Comentario();
    if (this.preAnalysis.type == "EQUALS_SIGN") {
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + " ";
      } else {
        this.stringTraduccion += this.preAnalysis.value + " ";
      }
      this.match("EQUALS_SIGN");
      this.E();
      if (this.doWhileFound) {
        this.doWhileContent += "\n";
      } else {
        this.stringTraduccion += "\n";
      }
      this.match("SEMICOLON");
    }
  }

  DeclaracionVariable() {
    this.Comentario();
    this.Tipo();
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " ";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " ";
    }
    this.match("ID");
    this.DeclaracionVariableP();
  }

  DeclaracionVariableP() {
    this.ListaID();
    this.Asignacion();
  }

  ListaID() {
    if (this.preAnalysis.type == "COMMA") {
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + " ";
      } else {
        this.stringTraduccion += this.preAnalysis.value + " ";
      }
      this.match("COMMA");
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + " ";
      } else {
        this.stringTraduccion += this.preAnalysis.value;
      }
      this.match("ID");
      this.ListaID();
    }
  }

  LlamadaMetodo() {
    this.llamadaMetodo = true;
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value;
    } else {
      this.stringTraduccion += this.preAnalysis.value;
    }
    this.match("ID");
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value;
    } else {
      this.stringTraduccion += this.preAnalysis.value;
    }
    this.match("LEFT_PARENT");
    this.DeclaracionParametros();
    this.match("SEMICOLON");
  }

  SentenciaMain() {
    this.match("RESERVED_VOID");
    this.match("RESERVED_MAIN");
    this.match("LEFT_PARENT");
    this.match("RESERVED_STRING");
    this.match("LEFT_BRACKET");
    this.match("RIGHT_BRACKET");
    this.match("RESERVED_ARGS");
    this.match("RIGHT_PARENT");
    this.stringTraduccion += "def main():\n";
    this.auxMain = "\tif __name__ = “__main__”:\n \t\tmain()\n";
    this.ListaInstrLlaves();
    this.stringTraduccion += this.auxMain;
    this.auxMain = "";
  }

  SentenciaContinue() {
    this.stringTraduccion += "continue";
    if (this.doWhileFound) {
      this.doWhileContent += "continue";
    }
    this.match("RESERVED_CONTINUE");
    this.match("SEMICOLON");
  }

  SentenciaBreak() {
    this.stringTraduccion += "break";
    if (this.doWhileFound) {
      this.doWhileContent += "break";
    }
    this.match("RESERVED_BREAK");
    this.match("SEMICOLON");
  }

  Comentario() {
    while (
      this.preAnalysis.type == "MULTILINE_COMMENT" ||
      this.preAnalysis.type == "COMMENT"
    ) {
      if (this.preAnalysis.type == "MULTILINE_COMMENT") {
        this.preAnalysis.value = this.preAnalysis.value.replace("/*", "# ");
        this.preAnalysis.value = this.preAnalysis.value.replace("*/", "");
        this.preAnalysis.value = this.preAnalysis.value.replace("*", "");
        this.preAnalysis.value = this.preAnalysis.value.replace("*", "");
        this.tabular();
        this.stringTraduccion += this.preAnalysis.value + "\n";
      } else if (this.preAnalysis.type == "COMMENT") {
        this.preAnalysis.value = this.preAnalysis.value.replace("//", "# ");
        this.tabular();
        this.stringTraduccion += this.preAnalysis.value + "\n";
      }
      this.numPreAnalysis++;
      this.preAnalysis = this.tokenList[this.numPreAnalysis];
    }
  }

  SentenciaPrint() {
    this.match("RESERVED_SYSTEM");
    this.match("DOT");
    this.match("RESERVED_OUT");
    this.match("DOT");

    if (this.doWhileFound) {
      this.doWhileContent += "print";
    } else {
      this.stringTraduccion += "print";
    }
    this.match("RESERVED_PRINTLN");
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value;
    } else {
      this.stringTraduccion += this.preAnalysis.value;
    }
    this.match("LEFT_PARENT");
    /* if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value;
    } else {
      this.stringTraduccion += this.preAnalysis.value;
    } */
    this.E();
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + "\n";
    } else {
      this.stringTraduccion += this.preAnalysis.value + "\n";
    }
    this.match("RIGHT_PARENT");
    this.match("SEMICOLON");
  }

  SentenciaWhile() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " ";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " ";
    }
    this.match("RESERVED_WHILE");
    this.match("LEFT_PARENT");
    this.Expresion();
    if (this.doWhileFound) {
      this.doWhileContent += ":\n";
    } else {
      this.stringTraduccion += ":\n";
    }
    this.match("RIGHT_PARENT");
    this.ListaInstrLlaves();
  }

  SentenciaIf() {
    if (this.elifFound != true) {
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + " ";
      } else {
        this.stringTraduccion += this.preAnalysis.value + " ";
      }
    }
    this.match("RESERVED_IF");
    this.match("LEFT_PARENT");
    this.Expresion();
    if (this.doWhileFound) {
      this.doWhileContent += ":\n";
    } else {
      this.stringTraduccion += ":\n";
    }
    this.match("RIGHT_PARENT");
    this.ListaInstrLlaves();
    this.OpcionElse();
  }

  OpcionElse() {
    if (this.preAnalysis.type == "RESERVED_ELSE") {
      this.match("RESERVED_ELSE");
      this.ListaIf();
    }
  }

  ListaIf() {
    if (this.preAnalysis.type == "LEFT_BRACE") {
      this.tabular();
      if (this.doWhileFound) {
        this.doWhileContent += "else:\n";
      } else {
        this.stringTraduccion += "else:\n";
      }
      this.ListaInstrLlaves();
    }
    if (this.preAnalysis.type == "RESERVED_IF") {
      this.tabular();
      if (this.doWhileFound) {
        this.doWhileContent += "elif ";
      } else {
        this.stringTraduccion += "elif ";
      }
      this.elifFound = true;
      this.SentenciaIf();
    }
  }

  SentenciaDoWhile() {
    this.doWhileFound = true;
    this.match("RESERVED_DO");
    this.whileOfDo = true;
    this.ListaInstrLlaves();
    this.doWhileFound = false;
    this.match("RESERVED_WHILE");
    this.match("LEFT_PARENT");
    this.stringTraduccion += "while ";
    this.Expresion();
    this.match("RIGHT_PARENT");
    this.match("SEMICOLON");
    this.stringTraduccion += ":\n";
    this.stringTraduccion += this.doWhileContent;
    this.doWhileContent = "";
    this.whileOfDo = false;
  }

  SentenciaFor() {
    this.forFound = true;
    if (this.doWhileFound) {
      this.doWhileContent += "for ";
    } else {
      this.stringTraduccion += "for ";
    }
    this.match("RESERVED_FOR");
    this.match("LEFT_PARENT");
    this.DeclaracionFor();
    if (this.doWhileFound) {
      this.doWhileContent += "in range(" + this.forValue1 + ",";
    } else {
      this.stringTraduccion += "in range(" + this.forValue1 + ",";
    }
    this.match("SEMICOLON");
    this.Expresion();
    if (this.doWhileFound) {
      this.doWhileContent += this.forValue2 + "):\n";
    } else {
      this.stringTraduccion += this.forValue2 + "):\n";
    }
    this.match("SEMICOLON");
    this.match("ID");
    this.IncrementoDecremento();
    this.match("RIGHT_PARENT");
    this.forValue1 = "";
    this.forValue2 = "";
    this.forFound = false;
    this.ListaInstrLlaves();
  }

  DeclaracionFor() {
    if (this.preAnalysis.type == "ID") {
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + " ";
      } else {
        this.stringTraduccion += this.preAnalysis.value + " ";
      }
      this.match("ID");
      this.match("EQUALS_SIGN");
      this.E();
    } else {
      this.Tipo();
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + " ";
      } else {
        this.stringTraduccion += this.preAnalysis.value + " ";
      }
      this.match("ID");
      this.match("EQUALS_SIGN");
      this.E();
    }
  }

  IncrementoDecremento() {
    if (this.preAnalysis.type == "INCREMENT_OPT") {
      this.match("INCREMENT_OPT");
    } else {
      this.match("DECREMENT_OPT");
    }
  }

  Expresion() {
    this.OperadorNot();
    this.E();
    this.Condicion();
    this.CondicionLogica();
  }

  OperadorNot() {
    if (this.preAnalysis.type == "NOT_OPT") {
      if (this.doWhileFound) {
        this.doWhileContent += "not ";
      } else {
        this.stringTraduccion += "not ";
      }
      this.match("NOT_OPT");
    }
  }

  Condicion() {
    if (this.preAnalysis.type == "AND_OPT") {
      if (this.doWhileFound) {
        this.doWhileContent += "and ";
      } else {
        this.stringTraduccion += "and ";
      }
      this.match("AND_OPT");
      this.Expresion();
    }
    if (this.preAnalysis.type == "OR_OPT") {
      if (this.doWhileFound) {
        this.doWhileContent += "or ";
      } else {
        this.stringTraduccion += "or ";
      }
      this.match("OR_OPT");
      this.Expresion();
    }
    if (this.preAnalysis.type == "XOR_OPT") {
      if (this.doWhileFound) {
        this.doWhileContent += "xor ";
      } else {
        this.stringTraduccion += "xor ";
      }
      this.match("XOR_OPT");
      this.Expresion();
    }
  }

  CondicionLogica() {
    if (this.preAnalysis.type == "GREATER_EQL") {
      if (this.forFound != true) {
        if (this.doWhileFound) {
          this.doWhileContent += ">= ";
        } else {
          this.stringTraduccion += ">= ";
        }
      }
      this.match("GREATER_EQL");
      this.E();
    } else if (this.preAnalysis.type == "LESS_EQL") {
      if (this.forFound != true) {
        if (this.doWhileFound) {
          this.doWhileContent += "<= ";
        } else {
          this.stringTraduccion += "<= ";
        }
      }
      this.match("LESS_EQL");
      this.E();
    } else if (this.preAnalysis.type == "LESS_THAN") {
      if (this.forFound != true) {
        if (this.doWhileFound) {
          this.doWhileContent += "< ";
        } else {
          this.stringTraduccion += "< ";
        }
      }

      this.match("LESS_THAN");
      this.E();
    } else if (this.preAnalysis.type == "GREATER_THAN") {
      if (this.forFound != true) {
        if (this.doWhileFound) {
          this.doWhileContent += "> ";
        } else {
          this.stringTraduccion += "> ";
        }
      }

      this.match("GREATER_THAN");
      this.E();
    } else if (this.preAnalysis.type == "INEQUALITY") {
      if (this.forFound != true) {
        if (this.doWhileFound) {
          this.doWhileContent += "!= ";
        } else {
          this.stringTraduccion += "!= ";
        }
      }

      this.match("INEQUALITY");
      this.E();
    } else if (this.preAnalysis.type == "EQUALS_SIGN") {
      if (this.forFound != true) {
        if (this.doWhileFound) {
          this.doWhileContent += "== ";
        } else {
          this.stringTraduccion += "== ";
        }
      }
      this.match("EQUALS_SIGN");
      this.E();
    }
  }

  E() {
    this.T();
    this.EP();
  }

  EP() {
    if (this.preAnalysis.type == "PLUS_SIGN") {
      if (this.doWhileFound) {
        this.doWhileContent += "+ ";
      } else {
        this.stringTraduccion += "+ ";
      }
      this.match("PLUS_SIGN");
      this.T();
      this.EP();
    }
    if (this.preAnalysis.type == "SUBS_SIGN") {
      if (this.doWhileFound) {
        this.doWhileContent += "- ";
      } else {
        this.stringTraduccion += "- ";
      }
      this.match("SUBS_SIGN");
      this.T();
      this.EP();
    }
  }

  T() {
    this.F();
    this.TP();
  }

  TP() {
    if (this.preAnalysis.type == "MULT_SIGN") {
      if (this.doWhileFound) {
        this.doWhileContent += "* ";
      } else {
        this.stringTraduccion += "* ";
      }
      this.match("MULT_SIGN");
      this.F();
      this.TP();
    }
    if (this.preAnalysis.type == "DIV_SIGN") {
      if (this.doWhileFound) {
        this.doWhileContent += "/ ";
      } else {
        this.stringTraduccion += "/";
      }
      this.match("DIV_SIGN");
      this.F();
      this.TP();
    }
  }

  F() {
    if (this.preAnalysis.type == "NUMBER") {
      if (this.forFound != true) {
        if (this.doWhileFound) {
          this.doWhileContent += this.preAnalysis.value + " ";
        } else {
          this.stringTraduccion += this.preAnalysis.value + " ";
        }
      } else if (this.forFound == true && this.forValue1 == "") {
        this.forValue1 = this.preAnalysis.value;
      } else if (
        this.forFound == true &&
        this.forValue2 == "" &&
        this.forValue1 != ""
      ) {
        this.forValue2 = this.preAnalysis.value;
      }
      this.match("NUMBER");
    } else if (this.preAnalysis.type == "ID") {
      if (this.forFound != true) {
        if (this.doWhileFound) {
          this.doWhileContent += this.preAnalysis.value + "";
        } else {
          this.stringTraduccion += this.preAnalysis.value + "";
        }
      } else if (this.forFound == true && this.forValue1 == "") {
        this.forValue1 = this.preAnalysis.value;
      } else if (
        this.forFound == true &&
        this.forValue2 == "" &&
        this.forValue1 == ""
      ) {
        this.forValue2 = this.preAnalysis.value;
      }
      this.match("ID");
    } else if (this.preAnalysis.type == "DECIMAL") {
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + " ";
      }
      this.match("DECIMAL");
    } else if (this.preAnalysis.type == "RESERVED_TRUE") {
      if (this.doWhileFound) {
        this.doWhileContent += "True ";
      } else {
        this.stringTraduccion += "True";
      }
      this.match("RESERVED_TRUE");
    } else if (this.preAnalysis.type == "RESERVED_FALSE") {
      if (this.doWhileFound) {
        this.doWhileContent += "False ";
      } else {
        this.stringTraduccion += "False";
      }
      this.match("RESERVED_FALSE");
    } else if (this.preAnalysis.type == "LEFT_PARENT") {
      this.match("LEFT_PARENT");
      this.E();
      this.match("RIGHT_PARENT");
    } else if (this.preAnalysis.type == "STRING") {
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value;
      } else {
        this.stringTraduccion += this.preAnalysis.value;
      }
      this.match("STRING");
    }
  }

  /* match(type) {
    this.Comentario();
    if (this.errorFound) {
      if (this.numPreAnalysis < this.tokenList.length - 1) {
        this.numPreAnalysis++;
        this.preAnalysis = this.tokenList[this.numPreAnalysis];
        if (
          this.preAnalysis.type == "SEMICOLON" ||
          this.preAnalysis.type == "RIGHT_BRACE"
        ) {
          this.errorFound = false;
          let newError = new Error(
            "Se recuperó del error en la fila " + this.preAnalysis.row
          );
          this.errorList.push(newError);
        }
      }
    } else {
      if (this.preAnalysis.type != type) {
        if (this.errorFound == false) {
          console.log("Se esperaba", type);
          let newError = new Error("Error encontrado, se esperaba " + type);
          this.errorList.push(newError);
          this.errorFound = true;
        }
      }
      if (this.preAnalysis.type != "LAST") {
        if (this.preAnalysis.type != type) {
          this.errorFound = true;
        }
        this.numPreAnalysis++;
        this.preAnalysis = this.tokenList[this.numPreAnalysis];
      }
    }
  } */

  match(type) {
    this.Comentario();
    if (this.errorFound) {
      while(this.errorFound && this.numPreAnalysis < (this.tokenList.length - 1)) {
        this.numPreAnalysis++;
        this.preAnalysis = this.tokenList[this.numPreAnalysis];
        if(this.preAnalysis.type == 'SEMICOLON' || this.preAnalysis.type == 'RIGHT_BRACE') {
          this.errorFound = false;
          let newError = new Error('Se recuperó del error en la fila ' + this.preAnalysis.row)
          this.errorList.push(newError);
        }
      }
    } else {
      if (this.preAnalysis.type != type) {
        if (this.errorFound == false) {
          console.log("Se esperaba", type);
          let newError = new Error("Error encontrado, se esperaba " + type);
          this.errorList.push(newError);
          this.errorFound = true;
        }
      }
      if (this.preAnalysis.type != "LAST") {
        if (this.preAnalysis.type != type) {
          this.errorFound = true;
        }
        this.numPreAnalysis++;
        this.preAnalysis = this.tokenList[this.numPreAnalysis];
      }
    }
  }

  // Demás funciones
  tabular() {
    for (var i = 0; i < this.contTab; i++) {
      if (this.doWhileFound == true) {
        this.doWhileContent += "\t";
      } else {
        this.stringTraduccion += "\t";
      }
    }
  }
}

module.exports = Parser;
