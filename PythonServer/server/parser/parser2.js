var Error = require("./error");
const fs = require("fs");
const { graphviz } = require("node-graphviz");
const {exec} = require('child_process')

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
    // Class
    this.primeraSentenciaClase = false;
    this.primeraListaClases = false;
    this.padreListaClases = "";
    this.primeraDeclaracionMetodosFunciones = false;
    this.padreDeclaracionMetodosFunciones = "";
    this.padreListaDeclaracionMetodosFunciones = '';
    // Interface
    this.primeraSentenciaInterfaz = false;
    this.padreDeclaracionFunciones = '';
    this.primeraDeclaracionFunciones = false;
    this.padreListaDeclaracionFunciones = '';
    this.primeraListaDeclaracionFunciones = false;
    // Tipo
    this.padreTipo = '';
    // Declaracion Parametros
    this.padreDeclaracionParametros = '';
    this.padreDeclaracionParametrosInterfaz = '';
    // Lista de Parametros
    this.padreListaParametros = '';
    // Lista de instrucciones entre llaves
    this.padreListaInstruccionesLlaves = '';
    // Lista instrucciones
    this.padreListaInstrucciones = '';
    this.padreListaInstruccionesP = '';
    // Instruccion
    this.padreSentenciaMain = '';
    this.padreInstruccion = '';
    this.padreSentenciaIf = '';
    this.padreSentenciaWhile = '';
    this.padreSentenciaDoWhile = '';
    this.padreSentenciaBreak = '';
    this.padreAsignacionSimple = '';
    this.padreDeclaracionVariable = '';
    this.padreIncrementable = '';
    this.padreDecrementable = '';
    this.padreSentenciaContinue = '';
    this.padreLlamadaMetodo = '';
    this.padreSentenciaFor = '';
    this.padreSentenciaReturnFunciones = ''
    this.padreSentenciaReturnMetodos = ''
    this.padreSentenciaPrint = ''

    // E
    this.padreE = '';
    this.padreEP = '';
    this.padreT = '';
    this.padreTP = '';
    this.padreF = '';

    // for
    this.padreDeclaracionFor = '';
    this.padreIncrementoDecremento = '';

    // Expresion
    this.padreExpresion = '';
    this.padreOperadorNot = '';
    this.padreCondicion = ''
    this.padreCondicionLogica = ''
    this.padreListaExpresiones = '';

    // IF ELSE
    this.padreOpcionElse = '';
    this.padreListaIf = '';

    // Asignacion
    this.padreAsignacionSimpleP = '';
    this.padreAsignacion = '';
    this.padreListaID = '';
    this.padreDeclaracionVariableP = '';

    // Llamada Metodo
    this.padreParametrosLlamada = '';


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
      fs.writeFile('ast.dot', this.astString, (error) => {
        if(error){
          console.log(error)
        } 
      });
      graphviz.dot(this.astString, 'svg').then((svg) => {
        // Write the SVG to file
        fs.writeFileSync('public/ast.svg', svg);
      });
      exec("dot -Tpdf ast.dot -o public/ast.pdf", (error, data, getter) => {
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
    this.padreListaDeclaracionMetodosFunciones = 'n' + this.nodeCont;
    this.nodeCont++;
    this.ListaDeclaracionMetodosFunciones();
    this.padreListaDeclaracionMetodosFunciones = '';
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
    this.astString += "n" + this.nodeCont + '[label="LISTA_DECLARACION_FUNCIONES"];\n';
    this.astString += father + "->n" + this.nodeCont + ";\n";
    this.padreListaDeclaracionFunciones = 'n' + this.nodeCont;
    this.nodeCont++;
    this.ListaDeclaracionFunciones();
    this.padreListaDeclaracionFunciones = '';
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
      this.astString += this.padreListaDeclaracionMetodosFunciones + "->n" + this.nodeCont + ";\n";
      this.padreDeclaracionMetodosFunciones = 'n' + this.nodeCont;
      this.nodeCont++;
      this.DeclaracionMetodosFunciones();
      this.padreDeclaracionMetodosFunciones = '';
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
      this.astString += "n" + this.nodeCont + '[label="DECLARACION_METODOS_FUNCIONES"];\n';
      this.astString += this.padreListaDeclaracionMetodosFunciones + "->n" + this.nodeCont + ";\n";
      this.padreDeclaracionMetodosFunciones = 'n' + this.nodeCont;
      this.nodeCont++;
      this.DeclaracionMetodosFunciones();
      this.padreDeclaracionMetodosFunciones = '';
      this.ListaDeclaracionMetodosFunciones();
    }
  }

  ListaDeclaracionFunciones() {
    this.Comentario();
    if (this.preAnalysis.type == "RESERVED_PUBLIC") {
      this.astString += "n" + this.nodeCont + '[label="DECLARACION_FUNCIONES"];\n';
      this.astString += this.padreListaDeclaracionFunciones + "->n" + this.nodeCont + ";\n";
      this.padreDeclaracionFunciones = 'n' + this.nodeCont;
      this.nodeCont++;
      this.DeclaracionFunciones();
      this.padreDeclaracionFunciones = '';
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
      this.astString += "n" + this.nodeCont + '[label="DECLARACION_FUNCIONES"];\n';
      this.astString += this.padreListaDeclaracionFunciones + "->n" + this.nodeCont + ";\n";
      this.padreDeclaracionFunciones = 'n' + this.nodeCont;
      this.nodeCont++;
      this.DeclaracionFunciones();
      this.padreDeclaracionFunciones = '';
      this.ListaDeclaracionFunciones();
    }
  }

  DeclaracionMetodosFunciones() {
    this.Comentario();
    this.tabular(); // ESTE ES FIJO
    this.match("RESERVED_PUBLIC");
    this.astString += "n" + this.nodeCont + '[label="public"];\n';
    this.astString += this.padreDeclaracionMetodosFunciones + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    if (this.preAnalysis.type == "RESERVED_VOID") {
      this.stringTraduccion += "def ";
      this.defFound = true;
      this.match("RESERVED_VOID");
      this.astString += "n" + this.nodeCont + '[label="void"];\n';
      this.astString += this.padreDeclaracionMetodosFunciones + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
    } else if (this.preAnalysis.type == "RESERVED_STATIC") {
      this.match("RESERVED_STATIC");
      this.astString += "n" + this.nodeCont + '[label="static"];\n';
      this.astString += this.padreDeclaracionMetodosFunciones + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.mainFound = true;
      this.astString += "n" + this.nodeCont + '[label="SENTENCIA_MAIN"];\n';
      this.astString += this.padreDeclaracionMetodosFunciones + "->n" + this.nodeCont + ";\n";
      this.padreSentenciaMain = 'n' + this.nodeCont;
      this.nodeCont++;
      this.SentenciaMain();
      this.padreSentenciaMain = '';
      return;
    } else if (
      this.preAnalysis.type != "RESERVED_VOID" &&
      this.preAnalysis.type != "RESERVED_STATIC"
    ) {
      this.defFound = true;
      this.stringTraduccion += "def ";
      this.astString += "n" + this.nodeCont + '[label="TIPO"];\n';
      this.astString += this.padreDeclaracionMetodosFunciones + "->n" + this.nodeCont + ";\n";
      this.padreTipo = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Tipo();
      this.padreTipo = '';
      this.defFound = false;
    }
    this.stringTraduccion += this.preAnalysis.value;
    this.astString += "n" + this.nodeCont + '[label="ID"];\n';
    this.astString += this.padreDeclaracionMetodosFunciones + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.astString += "n" + this.nodeCont + '[label="'+ this.preAnalysis.value  +'"];\n';
    this.astString += 'n' + (this.nodeCont - 1) + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("ID");
    this.stringTraduccion += this.preAnalysis.value;
    this.astString += "n" + this.nodeCont + '[label="("];\n';
    this.astString += this.padreDeclaracionMetodosFunciones + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("LEFT_PARENT");
    this.astString += "n" + this.nodeCont + '[label="DECLARACION_PARAMETROS"];\n';
    this.astString += this.padreDeclaracionMetodosFunciones + "->n" + this.nodeCont + ";\n";
    this.padreDeclaracionParametros = 'n' + this.nodeCont;
    this.nodeCont++;
    this.DeclaracionParametros();
    this.padreDeclaracionParametros = '';
  }

  DeclaracionFunciones() {
    this.Comentario();
    this.tabular(); // ESTE ES FIJO
    this.match("RESERVED_PUBLIC");
    this.astString += "n" + this.nodeCont + '[label="public"];\n';
    this.astString += this.padreDeclaracionFunciones + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.stringTraduccion += "self ";
    
    this.astString += "n" + this.nodeCont + '[label="TIPO"];\n';
    this.astString += this.padreDeclaracionFunciones + "->n" + this.nodeCont + ";\n";
    this.padreTipo = 'n' + this.nodeCont;
    this.nodeCont++;
    this.Tipo();
    this.padreTipo = '';

    this.stringTraduccion += this.preAnalysis.value;
    this.astString += "n" + this.nodeCont + '[label="ID"];\n';
    this.astString += this.padreDeclaracionFunciones + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.astString += "n" + this.nodeCont + '[label="'+ this.preAnalysis.value  +'"];\n';
    this.astString += 'n' + (this.nodeCont - 1) + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("ID");
    this.stringTraduccion += this.preAnalysis.value;
    this.astString += "n" + this.nodeCont + '[label="("];\n';
    this.astString += this.padreDeclaracionFunciones + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("LEFT_PARENT");
    this.stringTraduccion += this.preAnalysis.value;
    this.astString += "n" + this.nodeCont + '[label="DECLARACION_PARAMETROS_INTERFAZ"];\n';
    this.astString += this.padreDeclaracionFunciones + "->n" + this.nodeCont + ";\n";
    this.padreDeclaracionParametrosInterfaz = 'n' + this.nodeCont;
    this.nodeCont++;
    this.DeclaracionParametrosInterfaz();
    this.padreDeclaracionParametrosInterfaz = '';
  }

  DeclaracionParametrosInterfaz() {
    if (this.preAnalysis == "RIGHT PARENT") {
      this.stringTraduccion += this.preAnalysis.value;
      this.astString += "n" + this.nodeCont + '[label=")"];\n';
      this.astString += this.padreDeclaracionParametrosInterfaz + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RIGHT_PARENT");
      this.stringTraduccion = this.preAnalysis.value + "\n";
      this.astString += "n" + this.nodeCont + '[label=";"];\n';
      this.astString += this.padreDeclaracionParametrosInterfaz + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("SEMICOLON");
    } else {
      this.astString += "n" + this.nodeCont + '[label="TIPO"];\n';
      this.astString += this.padreDeclaracionParametrosInterfaz + "->n" + this.nodeCont + ";\n";
      this.padreTipo = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Tipo();
      this.padreTipo = '';
      this.stringTraduccion += this.preAnalysis.value;
      this.match("ID");
      this.astString += "n" + this.nodeCont + '[label="LISTA_PARAMETROS"];\n';
      this.astString += this.padreDeclaracionParametrosInterfaz + "->n" + this.nodeCont + ";\n";
      this.padreListaParametros = 'n' + this.nodeCont;
      this.nodeCont++;
      this.ListaParametros();
      this.padreListaParametros = '';
      this.stringTraduccion += this.preAnalysis.value;
      this.astString += "n" + this.nodeCont + '[label=")"];\n';
      this.astString += this.padreDeclaracionParametrosInterfaz + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RIGHT_PARENT");
      this.stringTraduccion += this.preAnalysis.value + "\n";
      this.astString += "n" + this.nodeCont + '[label=";"];\n';
      this.astString += this.padreDeclaracionParametrosInterfaz + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("SEMICOLON");
    }
  }

  DeclaracionParametros() {
    if (
      this.preAnalysis.type == "RIGHT_PARENT" &&
      this.llamadaMetodo == false
    ) {
      this.stringTraduccion += this.preAnalysis.value + ":\n";
      this.astString += "n" + this.nodeCont + '[label=")"];\n';
      this.astString += this.padreDeclaracionParametros + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RIGHT_PARENT");
      this.astString += "n" + this.nodeCont + '[label="LISTA_INSTRUCCION_LLAVES"];\n';
      this.astString += this.padreDeclaracionParametros + "->n" + this.nodeCont + ";\n";
      this.padreListaInstruccionesLlaves = 'n' + this.nodeCont;
      this.nodeCont++;
      this.ListaInstrLlaves();
      this.padreListaInstruccionesLlaves = '';
    } else if (
      this.llamadaMetodo == false &&
      this.preAnalysis.type != "RIGHT_PARENT"
    ) {
      this.astString += "n" + this.nodeCont + '[label="TIPO"];\n';
      this.astString += this.padreDeclaracionParametros + "->n" + this.nodeCont + ";\n";
      this.padreTipo = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Tipo();
      this.padreTipo = '';

      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value;
      } else {
        this.stringTraduccion += this.preAnalysis.value;
      }
      this.astString += "n" + this.nodeCont + '[label="ID"];\n';
      this.astString += this.padreDeclaracionParametros + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      if(this.preAnalysis.type =="STRING") {
        this.astString += "n" + this.nodeCont + '[label='+ this.preAnalysis.value  +'];\n';
      } else {
        this.astString += "n" + this.nodeCont + '[label="'+ this.preAnalysis.value  +'"];\n';
      }
      this.astString += 'n'+(this.nodeCont - 1) + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("ID");

      this.astString += "n" + this.nodeCont + '[label="LISTA_PARAMETROS"];\n';
      this.astString += this.padreDeclaracionParametros + "->n" + this.nodeCont + ";\n";
      this.padreListaParametros = 'n' + this.nodeCont;
      this.nodeCont++;
      this.ListaParametros();
      this.padreListaParametros = '';

      this.stringTraduccion += this.preAnalysis.value + ":\n";
      this.astString += "n" + this.nodeCont + '[label=")"];\n';
      this.astString += this.padreDeclaracionParametros + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RIGHT_PARENT");
      this.astString += "n" + this.nodeCont + '[label="LISTA_INSTRUCCION_LLAVES"];\n';
      this.astString += this.padreDeclaracionParametros + "->n" + this.nodeCont + ";\n";
      this.padreListaInstruccionesLlaves = 'n' + this.nodeCont;
      this.nodeCont++;
      this.ListaInstrLlaves();
      this.padreListaInstruccionesLlaves = '';
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
      this.astString += "n" + this.nodeCont + '[label=")"];\n';
      this.astString += this.padreDeclaracionParametros + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RIGHT_PARENT");
      this.llamadaMetodo = false;
    } else if (
      this.llamadaMetodo == true &&
      this.preAnalysis.type != "RIGHT_PARENT"
    ) {
      
      this.astString += "n" + this.nodeCont + '[label="TIPO"];\n';
      this.astString += this.padreDeclaracionParametros + "->n" + this.nodeCont + ";\n";
      this.padreTipo = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Tipo();
      this.padreTipo = '';

      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value;
      } else {
        this.stringTraduccion += this.preAnalysis.value;
      }
      this.astString += "n" + this.nodeCont + '[label="ID"];\n';
      this.astString += this.padreDeclaracionParametros + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      if(this.preAnalysis.type =="STRING") {
        this.astString += "n" + this.nodeCont + '[label='+ this.preAnalysis.value  +'];\n';
      } else {
        this.astString += "n" + this.nodeCont + '[label="'+ this.preAnalysis.value  +'"];\n';
      }
      
      this.astString += 'n'+(this.nodeCont - 1) + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("ID");

      this.astString += "n" + this.nodeCont + '[label="LISTA_PARAMETROS"];\n';
      this.astString += this.padreDeclaracionParametros + "->n" + this.nodeCont + ";\n";
      this.padreListaParametros = 'n' + this.nodeCont;
      this.nodeCont++;
      this.ListaParametros();
      this.padreListaParametros = '';
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + "\n";
      } else {
        this.stringTraduccion += this.preAnalysis.value + "\n";
      }
      this.astString += "n" + this.nodeCont + '[label=")"];\n';
      this.astString += this.padreDeclaracionParametros + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
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
      this.astString += "n" + this.nodeCont + '[label=","];\n';
      this.astString += this.padreListaParametros + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("COMMA");
      this.astString += "n" + this.nodeCont + '[label="TIPO"];\n';
      this.astString += this.padreListaParametros + "->n" + this.nodeCont + ";\n";
      this.padreTipo = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Tipo();
      this.padreTipo = '';
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value;
      } else {
        this.stringTraduccion += this.preAnalysis.value;
      }

      this.astString += "n" + this.nodeCont + '[label="ID"];\n';
      this.astString += this.padreListaParametros + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.astString += "n" + this.nodeCont + '[label="'+ this.preAnalysis.value  +'"];\n';
      this.astString += 'n'+(this.nodeCont - 1) + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("ID");
      this.ListaParametros();
    }
  }

  Tipo() {
    if (this.preAnalysis.type == "RESERVED_INT") {
      if (this.forFound != true && this.defFound != true) {
        this.stringTraduccion += "";
      }
      this.astString += "n" + this.nodeCont + '[label="int"];\n';
      this.astString += this.padreTipo + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RESERVED_INT");
    } else if (this.preAnalysis.type == "RESERVED_BOOLEAN") {
      if (this.forFound != true || this.defFound != true) {
        this.stringTraduccion += "";
      }
      this.astString += "n" + this.nodeCont + '[label="boolean"];\n';
      this.astString += this.padreTipo + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RESERVED_BOOLEAN");
    } else if (this.preAnalysis.type == "RESERVED_DOUBLE") {
      if (this.forFound != true || this.defFound != true) {
        this.stringTraduccion += "";
      }
      this.astString += "n" + this.nodeCont + '[label="double"];\n';
      this.astString += this.padreTipo + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RESERVED_DOUBLE");
    } else if (this.preAnalysis.type == "RESERVED_STRING") {
      if (this.forFound != true || this.defFound != true) {
        this.stringTraduccion += "";
      }
      this.astString += "n" + this.nodeCont + '[label="string"];\n';
      this.astString += this.padreTipo + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RESERVED_STRING");
    } else if (this.preAnalysis.type == "RESERVED_CHAR") {
      if (this.forFound != true || this.defFound != true) {
        this.stringTraduccion += "";
      }
      this.astString += "n" + this.nodeCont + '[label="char"];\n';
      this.astString += this.padreTipo + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RESERVED_CHAR");
    } else if (this.preAnalysis.type == "RESERVED_VOID") {
      if (this.forFound != true || this.defFound != true) {
        this.stringTraduccion += "";
      }
      this.astString += "n" + this.nodeCont + '[label="void"];\n';
      this.astString += this.padreTipo + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RESERVED_VOID");
    }
  }

  Instruccion() {
    this.Comentario();
    if (this.preAnalysis.type == "RESERVED_IF") {
      this.tabular();
      this.astString += "n" + this.nodeCont + '[label="SENTENCIA_IF"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreSentenciaIf = 'n' + this.nodeCont;
      this.nodeCont++;
      this.SentenciaIf();
      this.padreSentenciaIf = '';
    } else if (this.preAnalysis.type == "RESERVED_WHILE") {
      if (this.whileOfDo != true) {
        this.tabular();
        this.astString += "n" + this.nodeCont + '[label="SENTENCIA_WHILE"];\n';
        this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
        this.padreSentenciaWhile = 'n' + this.nodeCont;
        this.nodeCont++;
        this.SentenciaWhile();
        this.padreSentenciaWhile = '';
      }
    } else if (this.preAnalysis.type == "RESERVED_DO") {
      this.tabular();
      this.astString += "n" + this.nodeCont + '[label="SENTENCIA_DO_WHILE"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreSentenciaDoWhile = 'n' + this.nodeCont;
      this.nodeCont++;
      this.SentenciaDoWhile();
      this.padreSentenciaDoWhile = '';

    } else if (this.preAnalysis.type == "RESERVED_FOR") {
      this.tabular();
      this.astString += "n" + this.nodeCont + '[label="SENTENCIA_FOR"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreSentenciaFor = 'n' + this.nodeCont;
      this.nodeCont++;
      this.SentenciaFor();
      this.padreSentenciaFor = '';
    } else if (this.preAnalysis.type == "RESERVED_SYSTEM") {
      this.tabular();
      this.astString += "n" + this.nodeCont + '[label="SENTENCIA_PRINT"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreSentenciaPrint = 'n' + this.nodeCont;
      this.nodeCont++;
      this.SentenciaPrint();
      this.padreSentenciaPrint = '';
    } else if (this.preAnalysis.type == "RESERVED_CONTINUE") {
      this.tabular();
      this.astString += "n" + this.nodeCont + '[label="SENTENCIA_CONTINUE"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreSentenciaContinue = 'n' + this.nodeCont;
      this.nodeCont++;
      this.SentenciaContinue();
      this.padreSentenciaContinue = '';
    } else if (this.preAnalysis.type == "RESERVED_BREAK") {
      this.tabular();
      this.astString += "n" + this.nodeCont + '[label="SENTENCIA_BREAK"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreSentenciaBreak = 'n' + this.nodeCont;
      this.nodeCont++;
      this.SentenciaBreak();
      this.padreSentenciaBreak = '';
    } else if (
      this.preAnalysis.type == "RESERVED_PUBLIC" &&
      this.tokenList[this.numPreAnalysis + 1].type == "RESERVED_STATIC"
    ) {
      this.tabular();
      this.astString += "n" + this.nodeCont + '[label="SENTENCIA_MAIN"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreSentenciaMain = 'n' + this.nodeCont;
      this.nodeCont++;
      this.SentenciaMain();
      this.padreSentenciaMain = '';
    } else if (
      this.preAnalysis.type == "RESERVED_RETURN" &&
      this.tokenList[this.numPreAnalysis + 1].type == "SEMICOLON"
    ) {
      this.tabular();
      this.astString += "n" + this.nodeCont + '[label="SENTENCIA_RETURN_METODOS"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreSentenciaReturnMetodos = 'n' + this.nodeCont;
      this.nodeCont++;
      this.SentenciaReturnMetodos();
      this.padreSentenciaReturnMetodos = '';
    } else if (
      this.preAnalysis.type == "RESERVED_RETURN" &&
      this.tokenList[this.numPreAnalysis + 1].type != "SEMICOLON"
    ) {
      this.tabular();
      this.astString += "n" + this.nodeCont + '[label="SENTENCIA_RETURN_FUNCIONES"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreSentenciaReturnFunciones= 'n' + this.nodeCont;
      this.nodeCont++;
      this.SentenciaReturnFunciones();
      this.padreSentenciaReturnFunciones= '';
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "LEFT_PARENT"
    ) {
      this.tabular();
      this.astString += "n" + this.nodeCont + '[label="LLAMADA_METODO"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreLlamadaMetodo = 'n' + this.nodeCont;
      this.nodeCont++;
      this.LlamadaMetodo();
      this.padreLlamadaMetodo = '';
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "EQUALS_SIGN"
    ) {
      this.tabular();
      this.astString += "n" + this.nodeCont + '[label="ASIGNACION_SIMPLE"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreAsignacionSimple = 'n' + this.nodeCont;
      this.nodeCont++;
      this.AsignacionSimple();
      this.padreAsignacionSimple = '';
    } else if (
      this.preAnalysis.type == "RESERVED_INT" ||
      this.preAnalysis.type == "RESERVED_CHAR" ||
      this.preAnalysis.type == "RESERVED_BOOLEAN" ||
      this.preAnalysis.type == "RESERVED_STRING" ||
      this.preAnalysis.type == "RESERVED_DOUBLE"
    ) {
      this.tabular();
      this.astString += "n" + this.nodeCont + '[label="DECLARACION_VARIABLE"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreDeclaracionVariable = 'n' + this.nodeCont;
      this.nodeCont++;
      this.DeclaracionVariable();
      this.padreDeclaracionVariable = '';
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "INCREMENT_OPT"
    ) {
      this.tabular();
      this.astString += "n" + this.nodeCont + '[label="INCREMENTABLE"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreIncrementable = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Incrementable();
      this.padreIncrementable = '';
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "DECRE_OPT"
    ) {
      this.astString += "n" + this.nodeCont + '[label="DECREMENTABLE"];\n';
      this.astString += this.padreInstruccion + "->n" + this.nodeCont + ";\n";
      this.padreDecrementable = 'n' + this.nodeCont;
      this.nodeCont++;
      this.tabular();
      this.Decrementable();
      this.padreDecrementable = '';
    }
  }

  ListaInstrucciones() {
    this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
    this.astString += this.padreListaInstrucciones + "->n" + this.nodeCont + ";\n";
    this.padreInstruccion = 'n' + this.nodeCont;
    this.nodeCont++;
    this.Instruccion();
    this.padreInstruccion = '';
    
      this.astString += "n" + this.nodeCont + '[label="LISTA_INSTRUCCIONESP"];\n';
      this.astString += this.padreListaInstrucciones + "->n" + this.nodeCont + ";\n";
      this.padreListaInstruccionesP = 'n' + this.nodeCont;
      this.nodeCont++;
      this.ListaInstruccionesP();
      //this.padreListaInstruccionesP = '';
  }

  ListaInstruccionesP() {
    this.Comentario();
    if (this.preAnalysis.type == "RESERVED_IF") {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    } else if (this.preAnalysis.type == "RESERVED_WHILE") {
      if (this.whileOfDo != true) {
        this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
        this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
        this.padreInstruccion = 'n' + this.nodeCont;
        this.nodeCont++;
        this.Instruccion();
        this.padreInstruccion = '';
        this.ListaInstruccionesP();
      }
    } else if (this.preAnalysis.type == "RESERVED_FOR") {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    } else if (this.preAnalysis.type == "RESERVED_DO") {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    } else if (this.preAnalysis.type == "RESERVED_SYSTEM") {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    } else if (this.preAnalysis.type == "RESERVED_BREAK") {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    } else if (this.preAnalysis.type == "RESERVED_CONTINUE") {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "RESERVED_PUBLIC" &&
      this.tokenList[this.numPreAnalysis + 1].type == "RESERVED_STATIC"
    ) {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "RESERVED_RETURN" &&
      this.tokenList[this.numPreAnalysis + 1].type == "SEMICOLON"
    ) {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "RESERVED_RETURN" &&
      this.tokenList[this.numPreAnalysis + 1].type != "SEMICOLON"
    ) {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "LEFT_PARENT"
    ) {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "EQUALS_SIGN"
    ) {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "RESERVED_INT" ||
      this.preAnalysis.type == "RESERVED_CHAR" ||
      this.preAnalysis.type == "RESERVED_BOOLEAN" ||
      this.preAnalysis.type == "RESERVED_STRING" ||
      this.preAnalysis.type == "RESERVED_DOUBLE"
    ) {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
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
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "INCREMENT_OPT"
    ) {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "ID" &&
      this.tokenList[this.numPreAnalysis + 1].type == "DECRE_OPT"
    ) {
      this.astString += "n" + this.nodeCont + '[label="INSTRUCCION"];\n';
      this.astString += this.padreListaInstruccionesP + "->n" + this.nodeCont + ";\n";
      this.padreInstruccion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Instruccion();
      this.padreInstruccion = '';
      this.ListaInstruccionesP();
    }
  }

  ListaInstrLlaves() {
    this.astString += "n" + this.nodeCont + '[label="{"];\n';
    this.astString += this.padreListaInstruccionesLlaves + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("LEFT_BRACE");
    this.contTab++;
    this.astString += "n" + this.nodeCont + '[label="LISTA_INSTRUCCIONES"];\n';
    this.astString += this.padreListaInstruccionesLlaves + "->n" + this.nodeCont + ";\n";
    this.padreListaInstrucciones = 'n' + this.nodeCont;
    this.nodeCont++;
    this.ListaInstrucciones();
   //this.padreListaInstrucciones = ''; SE DEBE DE OMITIR (O NO?)

    if (this.doWhileFound == true) {
      this.doWhileContent += "\n";
    } else {
      this.stringTraduccion += "\n";
    }
    if(this.padreListaInstruccionesLlaves != ''){
      this.astString += "n" + this.nodeCont + '[label="}"];\n';
      this.astString += this.padreListaInstruccionesLlaves + "->n" + this.nodeCont + ";\n";
    }
    this.nodeCont++;
    this.match("RIGHT_BRACE");
    this.contTab--;
  }

  Incrementable() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " += 1";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " += 1";
    }
    this.astString += "n" + this.nodeCont + '[label="ID"];\n';
    this.astString += this.padreIncrementable + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.astString += "n" + this.nodeCont + '[label="'+ this.preAnalysis.value  +'"];\n';
    this.astString += 'n'+(this.nodeCont - 1) + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("ID");
    this.astString += "n" + this.nodeCont + '[label="++"];\n';
    this.astString += this.padreIncrementable + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("INCREMENT_OPT");
    this.astString += "n" + this.nodeCont + '[label=";"];\n';
    this.astString += this.padreIncrementable + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("SEMICOLON");
  }

  Decrementable() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " -= 1";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " -= 1";
    }

    this.astString += "n" + this.nodeCont + '[label="ID"];\n';
    this.astString += this.padreDecrementable + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.astString += "n" + this.nodeCont + '[label="'+ this.preAnalysis.value  +'"];\n';
    this.astString += 'n'+(this.nodeCont - 1) + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("ID");
    this.astString += "n" + this.nodeCont + '[label="++"];\n';
    this.astString += this.padreDecrementable + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("DECREM_OPT");
    this.astString += "n" + this.nodeCont + '[label=";"];\n';
    this.astString += this.padreDecrementable + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    thismatch("SEMICOLON");
  }

  SentenciaReturnMetodos() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value;
    } else {
      this.stringTraduccion += this.preAnalysis.value;
    }
    this.astString += "n" + this.nodeCont + '[label="return"];\n';
    this.astString += this.padreSentenciaReturnMetodos + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_RETURN");
    this.E(); // Podría omitirse
    this.astString += "n" + this.nodeCont + '[label=";"];\n';
    this.astString += this.padreSentenciaReturnMetodos + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    if (this.doWhileFound) {
      this.doWhileContent +='\n';
    } else {
      this.stringTraduccion += '\n';
    }
    this.match("SEMICOLON");
  }

  SentenciaReturnFunciones() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " ";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " ";
    }
    this.astString += "n" + this.nodeCont + '[label="return"];\n';
    this.astString += this.padreSentenciaReturnFunciones + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_RETURN");
    this.astString += "n" + this.nodeCont + '[label="E"];\n';
    this.astString += this.padreSentenciaReturnFunciones + "->n" + this.nodeCont + ";\n";
    this.padreE = 'n' + this.nodeCont
    this.nodeCont++;
    this.E();
    this.padreE = '';

    this.astString += "n" + this.nodeCont + '[label=";"];\n';
    this.astString += this.padreSentenciaReturnFunciones + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    if (this.doWhileFound) {
      this.doWhileContent +='\n';
    } else {
      this.stringTraduccion += '\n';
    }
    this.match("SEMICOLON");
  }

  AsignacionSimple() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " ";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " ";
    }
    this.astString += "n" + this.nodeCont + '[label="ID"];\n';
    this.astString += this.padreAsignacionSimple + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.astString += "n" + this.nodeCont + '[label="'+ this.preAnalysis.value  +'"];\n';
    this.astString += 'n'+(this.nodeCont - 1) + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("ID");
    this.astString += "n" + this.nodeCont + '[label="ASIGNACION_SIMPLEP"];\n';
    this.astString += this.padreAsignacionSimple + "->n" + this.nodeCont + ";\n";
    this.padreAsignacionSimpleP = 'n' + this.nodeCont;
    this.nodeCont++;
    this.AsignacionSimpleP();
    this.padreAsignacionSimpleP = '';
  }

  AsignacionSimpleP() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " ";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " ";
    }
    this.astString += "n" + this.nodeCont + '[label="="];\n';
    this.astString += this.padreAsignacionSimpleP + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("EQUALS_SIGN");
    this.astString += "n" + this.nodeCont + '[label="E"];\n';
    this.astString += this.padreAsignacionSimpleP + "->n" + this.nodeCont + ";\n";
    this.padreE = 'n' + this.nodeCont;
    this.nodeCont++;
    this.E();
    this.padreE = '';
    if (this.doWhileFound) {
      this.doWhileContent += "\n";
    } else {
      this.stringTraduccion += "\n";
    }
    this.astString += "n" + this.nodeCont + '[label=";"];\n';
    this.astString += this.padreAsignacionSimpleP + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
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
      this.astString += "n" + this.nodeCont + '[label="="];\n';
      this.astString += this.padreAsignacion + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("EQUALS_SIGN");
      this.astString += "n" + this.nodeCont + '[label="="];\n';
      this.astString += this.padreAsignacion + "->n" + this.nodeCont + ";\n";
      this.padreE = 'n' + this.nodeCont;
      this.nodeCont++;
      this.E();
      this.padreE = '';
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
    this.astString += "n" + this.nodeCont + '[label="TIPO"];\n';
    this.astString += this.padreDeclaracionVariable + "->n" + this.nodeCont + ";\n";
    this.padreTipo = 'n' + this.nodeCont
    this.nodeCont++;
    this.Tipo();
    this.padreTipo = '';
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " ";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " ";
    }
    this.astString += "n" + this.nodeCont + '[label="ID"];\n';
    this.astString += this.padreDeclaracionVariable + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.astString += "n" + this.nodeCont + '[label="'+ this.preAnalysis.value  +'"];\n';
    this.astString += 'n'+(this.nodeCont - 1) + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("ID");
    this.astString += "n" + this.nodeCont + '[label="DECLARACION_VARIABLEP"];\n';
    this.astString += this.padreDeclaracionVariable + "->n" + this.nodeCont + ";\n";
    this.padreDeclaracionVariableP = 'n' + this.nodeCont;
    this.nodeCont++;
    this.DeclaracionVariableP();
    this.padreDeclaracionVariableP = '';
  }

  DeclaracionVariableP() {
    this.astString += "n" + this.nodeCont + '[label="LISTA_ID"];\n';
    this.astString += this.padreDeclaracionVariableP + "->n" + this.nodeCont + ";\n";
    this.padreListaID = 'n' + this.nodeCont;
    this.nodeCont++;
    this.ListaID();
    this.padreListaID = '';

    this.astString += "n" + this.nodeCont + '[label="ASIGNACION"];\n';
    this.astString += this.padreDeclaracionVariableP + "->n" + this.nodeCont + ";\n";
    this.padreAsignacion = 'n' + this.nodeCont;
    this.nodeCont++;
    this.Asignacion();
    this.padreAsignacion = '';
  }

  ListaID() {
    if (this.preAnalysis.type == "COMMA") {
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + " ";
      } else {
        this.stringTraduccion += this.preAnalysis.value + " ";
      }
      this.astString += "n" + this.nodeCont + '[label=","];\n';
      this.astString += this.padreListaID + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("COMMA");
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + " ";
      } else {
        this.stringTraduccion += this.preAnalysis.value;
      }
      this.astString += "n" + this.nodeCont + '[label="ID"];\n';
      this.astString += this.padreListaID + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.astString += "n" + this.nodeCont + '[label="'+ this.preAnalysis.value  +'"];\n';
      this.astString += 'n'+(this.nodeCont - 1) + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
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
    
    this.astString += "n" + this.nodeCont + '[label="ID"];\n';
    this.astString += this.padreLlamadaMetodo + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.astString += "n" + this.nodeCont + '[label="'+ this.preAnalysis.value  +'"];\n';
    this.astString += 'n'+(this.nodeCont - 1) + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("ID");
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value;
    } else {
      this.stringTraduccion += this.preAnalysis.value;
    }
    this.astString += "n" + this.nodeCont + '[label="("];\n';
    this.astString += this.padreLlamadaMetodo + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("LEFT_PARENT");
    this.astString += "n" + this.nodeCont + '[label="PARAMETROS_LLAMADA"];\n';
    this.astString += this.padreLlamadaMetodo + "->n" + this.nodeCont + ";\n";
    this.padreParametrosLlamada = 'n' + this.nodeCont;
    this.nodeCont++;
    this.ParametrosLlamada();
    this.padreParametrosLlamada = '';

    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value+ '\n';
    } else {
      this.stringTraduccion += this.preAnalysis.value + '\n';
    }
    this.astString += "n" + this.nodeCont + '[label=")"];\n';
    this.astString += this.padreLlamadaMetodo + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RIGHT_PARENT");
    this.astString += "n" + this.nodeCont + '[label=";"];\n';
    this.astString += this.padreLlamadaMetodo + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("SEMICOLON");
  }

  ParametrosLlamada() {
    
    if(this.preAnalysis.type == 'ID' || this.preAnalysis.type == 'STRING' || this.preAnalysis.type == 'NUMBER' ||
    this.preAnalysis.type == 'RESERVED_TRUE' || this.preAnalysis.type == 'RESERVED_FALSE' || this.preAnalysis.type == 'DECIMAL'  ) {
      this.astString += "n" + this.nodeCont + '[label="EXPRESION"];\n';
      this.astString += this.padreParametrosLlamada + "->n" + this.nodeCont + ";\n";
      this.padreExpresion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Expresion();
      this.padreExpresion = '';
      if(this.preAnalysis.type == 'COMMA') {
        if (this.doWhileFound) {
          this.doWhileContent += this.preAnalysis.value;
        } else {
          this.stringTraduccion += this.preAnalysis.value;
        }
        this.astString += "n" + this.nodeCont + '[label=","];\n';
        this.astString += this.padreLlamadaMetodo + "->n" + this.nodeCont + ";\n";
        this.nodeCont++;
        this.match('COMMA');
      }
      this.ParametrosLlamada()
    }
    
  }

  SentenciaMain() {
    this.astString += "n" + this.nodeCont + '[label="void"];\n';
    this.astString += this.padreSentenciaMain + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_VOID");
    this.astString += "n" + this.nodeCont + '[label="main"];\n';
    this.astString += this.padreSentenciaMain + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_MAIN");
    this.astString += "n" + this.nodeCont + '[label="("];\n';
    this.astString += this.padreSentenciaMain + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("LEFT_PARENT");
    this.astString += "n" + this.nodeCont + '[label="String"];\n';
    this.astString += this.padreSentenciaMain + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_STRING");
    this.astString += "n" + this.nodeCont + '[label="["];\n';
    this.astString += this.padreSentenciaMain + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("LEFT_BRACKET");
    this.astString += "n" + this.nodeCont + '[label="]"];\n';
    this.astString += this.padreSentenciaMain + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RIGHT_BRACKET");
    this.astString += "n" + this.nodeCont + '[label="args"];\n';
    this.astString += this.padreSentenciaMain + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_ARGS");
    this.astString += "n" + this.nodeCont + '[label=")"];\n';
    this.astString += this.padreSentenciaMain + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RIGHT_PARENT");
    this.stringTraduccion += "def main():\n";
    this.auxMain = "\tif __name__ = “__main__”:\n \t\tmain()\n";
    this.astString += "n" + this.nodeCont + '[label="LISTA_INSTRUCCIONES_LLAVES"];\n';
    this.astString += this.padreSentenciaMain + "->n" + this.nodeCont + ";\n";
    this.padreListaInstruccionesLlaves = 'n' + this.nodeCont;
    this.nodeCont++;
    this.ListaInstrLlaves();
    this.padreListaInstruccionesLlaves = '';
    this.stringTraduccion += this.auxMain;
    this.auxMain = "";
  }

  SentenciaContinue() {
    this.stringTraduccion += "continue";
    if (this.doWhileFound) {
      this.doWhileContent += "continue";
    }
    this.astString += "n" + this.nodeCont + '[label="continue"];\n';
    this.astString += this.padreSentenciaContinue + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_CONTINUE");
    this.astString += "n" + this.nodeCont + '[label=";"];\n';
    this.astString += this.padreSentenciaContinue + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("SEMICOLON");
  }

  SentenciaBreak() {
    this.stringTraduccion += "break";
    if (this.doWhileFound) {
      this.doWhileContent += "break";
    }
    this.astString += "n" + this.nodeCont + '[label="break"];\n';
    this.astString += this.padreSentenciaBreak + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_BREAK");
    this.astString += "n" + this.nodeCont + '[label=";"];\n';
    this.astString += this.padreSentenciaBreak + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
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
    this.astString += "n" + this.nodeCont + '[label="System"];\n';
    this.astString += this.padreSentenciaPrint + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_SYSTEM");
    this.astString += "n" + this.nodeCont + '[label="."];\n';
    this.astString += this.padreSentenciaPrint + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("DOT");
    this.astString += "n" + this.nodeCont + '[label="out"];\n';
    this.astString += this.padreSentenciaPrint + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_OUT");
    this.astString += "n" + this.nodeCont + '[label="."];\n';
    this.astString += this.padreSentenciaPrint + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("DOT");

    if (this.doWhileFound) {
      this.doWhileContent += "print";
    } else {
      this.stringTraduccion += "print";
    }
    /* this.astString += "n" + this.nodeCont + '[label="println"];\n';
    this.astString += this.padreSentenciaPrint + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_PRINTLN"); */
    // NUEVO
    this.astString += "n" + this.nodeCont + '[label="OPCION_PRINT"];\n';
    this.astString += this.padreSentenciaPrint + "->n" + this.nodeCont + ";\n";
    this.padreOpcionPrint = 'n' + this.nodeCont;
    this.nodeCont++;
    this.OpcionPrint();
    this.padreOpcionPrint = ''

    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value;
    } else {
      this.stringTraduccion += this.preAnalysis.value;
    }
    this.astString += "n" + this.nodeCont + '[label="("];\n';
    this.astString += this.padreSentenciaPrint + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("LEFT_PARENT");
    this.astString += "n" + this.nodeCont + '[label="E"];\n';
    this.astString += this.padreSentenciaPrint + "->n" + this.nodeCont + ";\n";
    this.padreE = 'n' + this.nodeCont
    this.nodeCont++;
    this.E();
    this.padreE = '';
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + "\n";
    } else {
      this.stringTraduccion += this.preAnalysis.value + "\n";
    }
    this.astString += "n" + this.nodeCont + '[label=")"];\n';
    this.astString += this.padreSentenciaPrint + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RIGHT_PARENT");
    this.astString += "n" + this.nodeCont + '[label=";"];\n';
    this.astString += this.padreSentenciaPrint + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("SEMICOLON");
  }

  OpcionPrint() {
    if(this.preAnalysis.type == "RESERVED_PRINTLN") {
      this.astString += "n" + this.nodeCont + '[label="println"];\n';
      this.astString += this.padreOpcionPrint + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match('RESERVED_PRINTLN');
    } else if(this.preAnalysis.type == "RESERVED_PRINT") {
      this.astString += "n" + this.nodeCont + '[label="print"];\n';
      this.astString += this.padreOpcionPrint + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match('RESERVED_PRINT');
    } 
  }

  SentenciaWhile() {
    if (this.doWhileFound) {
      this.doWhileContent += this.preAnalysis.value + " ";
    } else {
      this.stringTraduccion += this.preAnalysis.value + " ";
    }
    this.astString += "n" + this.nodeCont + '[label="while"];\n';
    this.astString += this.padreSentenciaWhile + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_WHILE");
    this.astString += "n" + this.nodeCont + '[label="("];\n';
    this.astString += this.padreSentenciaWhile + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("LEFT_PARENT");
    this.astString += "n" + this.nodeCont + '[label="EXPRESION"];\n';
    this.astString += this.padreSentenciaWhile + "->n" + this.nodeCont + ";\n";
    this.padreExpresion = 'n' + this.nodeCont;
    this.nodeCont++;
    this.Expresion();
    this.padreExpresion = '';
    if (this.doWhileFound) {
      this.doWhileContent += ":\n";
    } else {
      this.stringTraduccion += ":\n";
    }
    this.astString += "n" + this.nodeCont + '[label=")"];\n';
    this.astString += this.padreSentenciaWhile + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RIGHT_PARENT");
    this.astString += "n" + this.nodeCont + '[label="LISTA_INSTRUCCIONES_LLAVES"];\n';
    this.astString += this.padreSentenciaWhile + "->n" + this.nodeCont + ";\n";
    this.padreListaInstruccionesLlaves = 'n' + this.nodeCont;
    this.nodeCont++;
    this.ListaInstrLlaves();
    this.padreListaInstruccionesLlaves = '';
  }

  SentenciaIf() {
    if (this.elifFound != true) {
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + " ";
      } else {
        this.stringTraduccion += this.preAnalysis.value + " ";
      }
    }
    this.astString += "n" + this.nodeCont + '[label="if"];\n';
    this.astString += this.padreSentenciaIf + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_IF");
    this.astString += "n" + this.nodeCont + '[label="("];\n';
    this.astString += this.padreSentenciaIf + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("LEFT_PARENT");
    this.astString += "n" + this.nodeCont + '[label="EXPRESION"];\n';
    this.astString += this.padreSentenciaIf + "->n" + this.nodeCont + ";\n";
    this.padreExpresion = 'n' + this.nodeCont;
    this.nodeCont++;
    this.Expresion();
    this.padreExpresion = '';
    if (this.doWhileFound) {
      this.doWhileContent += ":\n";
    } else {
      this.stringTraduccion += ":\n";
    }
    this.astString += "n" + this.nodeCont + '[label=")"];\n';
    this.astString += this.padreSentenciaIf + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RIGHT_PARENT");
    this.astString += "n" + this.nodeCont + '[label="LISTA_INSTRUCCIONES_LLAVES"];\n';
    this.astString += this.padreSentenciaIf + "->n" + this.nodeCont + ";\n";
    this.padreListaInstruccionesLlaves = 'n' + this.nodeCont;
    this.nodeCont++;
    this.ListaInstrLlaves();
    this.padreListaInstruccionesLlaves = '';


    this.astString += "n" + this.nodeCont + '[label="OPCION_ELSE"];\n';
    this.astString += this.padreSentenciaIf + "->n" + this.nodeCont + ";\n";
    this.padreOpcionElse = 'n' + this.nodeCont;
    this.nodeCont++;
    this.OpcionElse();
    this.padreOpcionElse = '';
  }

  OpcionElse() {
    if (this.preAnalysis.type == "RESERVED_ELSE") {
      this.astString += "n" + this.nodeCont + '[label="else"];\n';
      this.astString += this.padreOpcionElse + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RESERVED_ELSE");
      this.astString += "n" + this.nodeCont + '[label="LISTA_IF"];\n';
      this.astString += this.padreOpcionElse + "->n" + this.nodeCont + ";\n";
      this.padreListaIf = 'n' + this.nodeCont;
      this.nodeCont++;
      this.ListaIf();
      this.padreListaIf = '';
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
      this.astString += "n" + this.nodeCont + '[label="LISTA_INSTRUCCIONES_LLAVES"];\n';
      this.astString += this.padreListaIf + "->n" + this.nodeCont + ";\n";
      this.padreListaInstruccionesLlaves = 'n' + this.nodeCont;
      this.nodeCont++;
      this.ListaInstrLlaves();
      this.padreListaInstruccionesLlaves = '';
    }
    if (this.preAnalysis.type == "RESERVED_IF") {
      this.tabular();
      if (this.doWhileFound) {
        this.doWhileContent += "elif ";
      } else {
        this.stringTraduccion += "elif ";
      }
      this.elifFound = true;
      this.astString += "n" + this.nodeCont + '[label="SENTENCIA_IF"];\n';
      this.astString += this.padreListaIf + "->n" + this.nodeCont + ";\n";
      this.padreSentenciaIf = 'n' + this.nodeCont;
      this.nodeCont++;
      this.SentenciaIf();
      this.elifFound = false;
      this.padreSentenciaIf = '';
    }
  }

  SentenciaDoWhile() {
    this.doWhileFound = true;
    this.astString += "n" + this.nodeCont + '[label="do"];\n';
    this.astString += this.padreSentenciaDoWhile + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_DO");
    this.whileOfDo = true;
    this.astString += "n" + this.nodeCont + '[label="LISTA_INSTRUCCIONES_LLAVES"];\n';
    this.astString += this.padreSentenciaDoWhile + "->n" + this.nodeCont + ";\n";
    this.padreListaInstruccionesLlaves = 'n' + this.nodeCont;
    this.nodeCont++;
    this.ListaInstrLlaves();
    this.padreListaInstruccionesLlaves = '';
    this.doWhileFound = false;
    this.astString += "n" + this.nodeCont + '[label="while"];\n';
    this.astString += this.padreSentenciaDoWhile + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_WHILE");
    this.astString += "n" + this.nodeCont + '[label="("];\n';
    this.astString += this.padreSentenciaDoWhile + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("LEFT_PARENT");
    this.stringTraduccion += "while ";
    this.astString += "n" + this.nodeCont + '[label="do"];\n';
    this.astString += this.padreSentenciaDoWhile + "->n" + this.nodeCont + ";\n";
    this.padreExpresion = 'n' + this.nodeCont; 
    this.nodeCont++;
    this.Expresion();
    this.padreExpresion = ''; 
    this.astString += "n" + this.nodeCont + '[label=")"];\n';
    this.astString += this.padreSentenciaDoWhile + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RIGHT_PARENT");
    this.astString += "n" + this.nodeCont + '[label=";"];\n';
    this.astString += this.padreSentenciaDoWhile + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
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
    this.astString += "n" + this.nodeCont + '[label="for"];\n';
    this.astString += this.padreSentenciaFor + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RESERVED_FOR");
    this.astString += "n" + this.nodeCont + '[label="("];\n';
    this.astString += this.padreSentenciaFor + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("LEFT_PARENT");
    this.astString += "n" + this.nodeCont + '[label="DECLARACION_FOR"];\n';
    this.astString += this.padreSentenciaFor + "->n" + this.nodeCont + ";\n";
    this.padreDeclaracionFor = 'n' + this.nodeCont;
    this.nodeCont++;
    this.DeclaracionFor();
    this.padreDeclaracionFor = '';
    if (this.doWhileFound) {
      this.doWhileContent += "in range(" + this.forValue1 + ",";
    } else {
      this.stringTraduccion += "in range(" + this.forValue1 + ",";
    }
    this.astString += "n" + this.nodeCont + '[label=";"];\n';
    this.astString += this.padreSentenciaFor + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("SEMICOLON");
    this.astString += "n" + this.nodeCont + '[label="EXPRESION"];\n';
    this.astString += this.padreSentenciaFor + "->n" + this.nodeCont + ";\n";
    this.padreExpresion = 'n' + this.nodeCont;
    this.nodeCont++;
    this.Expresion();
    this.padreExpresion = '';
    if (this.doWhileFound) {
      this.doWhileContent += this.forValue2 + "):\n";
    } else {
      this.stringTraduccion += this.forValue2 + "):\n";
    }
    this.astString += "n" + this.nodeCont + '[label=";"];\n';
    this.astString += this.padreSentenciaFor + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("SEMICOLON");
    this.astString += "n" + this.nodeCont + '[label="ID"];\n';
    this.astString += this.padreSentenciaFor + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.astString += "n" + this.nodeCont + '[label="' + this.preAnalysis.value + '"];\n';
    this.astString += 'n' + (this.nodeCont - 1)  + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("ID");
    this.astString += "n" + this.nodeCont + '[label="INCREMENTO_DECREMENTO"];\n';
    this.astString += this.padreSentenciaFor + "->n" + this.nodeCont + ";\n";
    this.padreIncrementoDecremento = 'n' + this.nodeCont;
    this.nodeCont++;
    this.IncrementoDecremento();
    this.padreIncrementoDecremento = '';
    this.astString += "n" + this.nodeCont + '[label=")"];\n';
    this.astString += this.padreSentenciaFor + "->n" + this.nodeCont + ";\n";
    this.nodeCont++;
    this.match("RIGHT_PARENT");
    this.forValue1 = "";
    this.forValue2 = "";
    this.forFound = false;
    this.astString += "n" + this.nodeCont + '[label="LISTA_INSTRUCCIONES_LLAVES"];\n';
    this.astString += this.padreSentenciaFor + "->n" + this.nodeCont + ";\n";
    this.padreListaInstruccionesLlaves = 'n' + this.nodeCont;
    this.nodeCont++;
    this.ListaInstrLlaves();
    this.padreListaInstruccionesLlaves = '';
  }

  DeclaracionFor() {
    if (this.preAnalysis.type == "ID") {
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + " ";
      } else {
        this.stringTraduccion += this.preAnalysis.value + " ";
      }
      this.astString += "n" + this.nodeCont + '[label="ID"];\n';
      this.astString += this.padreDeclaracionFor + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.astString += "n" + this.nodeCont + '[label="' + this.preAnalysis.value + '"];\n';
      this.astString += 'n' + (this.nodeCont - 1)  + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("ID");
      this.astString += "n" + this.nodeCont + '[label="="];\n';
      this.astString += this.padreDeclaracionFor + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("EQUALS_SIGN");
      this.astString += "n" + this.nodeCont + '[label="E"];\n';
      this.astString += this.padreDeclaracionFor + "->n" + this.nodeCont + ";\n";
      this.padreE = 'n' + this.nodeCont;
      this.nodeCont++;
      this.E();
      this.padreE = '';
    } else {
      this.astString += "n" + this.nodeCont + '[label="TIPO"];\n';
      this.astString += this.padreDeclaracionFor + "->n" + this.nodeCont + ";\n";
      this.padreTipo = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Tipo();
      this.padreTipo = '';
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + " ";
      } else {
        this.stringTraduccion += this.preAnalysis.value + " ";
      }
      this.astString += "n" + this.nodeCont + '[label="ID"];\n';
      this.astString += this.padreDeclaracionFor + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.astString += "n" + this.nodeCont + '[label="' + this.preAnalysis.value + '"];\n';
      this.astString += 'n' + (this.nodeCont - 1)  + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("ID");
      this.astString += "n" + this.nodeCont + '[label="="];\n';
      this.astString += this.padreDeclaracionFor + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("EQUALS_SIGN");
      this.astString += "n" + this.nodeCont + '[label="E"];\n';
      this.astString += this.padreDeclaracionFor + "->n" + this.nodeCont + ";\n";
      this.padreE = 'n' + this.nodeCont;
      this.nodeCont++;
      this.E();
      this.padreE = '';
    }
  }

  IncrementoDecremento() {
    if (this.preAnalysis.type == "INCREMENT_OPT") {
      this.astString += "n" + this.nodeCont + '[label="++"];\n';
      this.astString += this.padreIncrementoDecremento + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("INCREMENT_OPT");
    } else {
      this.astString += "n" + this.nodeCont + '[label="--"];\n';
      this.astString += this.padreIncrementoDecremento + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("DECREMENT_OPT");
    }
  }

  Expresion() {
    this.astString += "n" + this.nodeCont + '[label="OPERADOR_NOT"];\n';
    this.astString += this.padreExpresion + "->n" + this.nodeCont + ";\n";
    this.padreOperadorNot = 'n' + this.nodeCont;
    this.nodeCont++;
    this.OperadorNot();
    this.padreOperadorNot = '';

    this.astString += "n" + this.nodeCont + '[label="E"];\n';
    this.astString += this.padreExpresion + "->n" + this.nodeCont + ";\n";
    this.padreE = 'n' + this.nodeCont;
    this.nodeCont++;
    this.E();
    this.padreE = '';

    this.astString += "n" + this.nodeCont + '[label="CONDICION"];\n';
    this.astString += this.padreExpresion + "->n" + this.nodeCont + ";\n";
    this.padreCondicion = 'n' + this.nodeCont;
    this.nodeCont++;
    this.Condicion();
    this.padreCondicion = '';

    this.astString += "n" + this.nodeCont + '[label="CONDICION_LOGICA"];\n';
    this.astString += this.padreExpresion + "->n" + this.nodeCont + ";\n";
    this.padreCondicionLogica = 'n' + this.nodeCont;
    this.nodeCont++;
    this.CondicionLogica();
    this.padreCondicionLogica = '';

    this.astString += "n" + this.nodeCont + '[label="LISTA_EXPRESIONES"];\n';
    this.astString += this.padreExpresion + "->n" + this.nodeCont + ";\n";
    this.padreListaExpresiones = 'n' + this.nodeCont;
    this.nodeCont++;
    this.ListaExpresiones();
    this.padreListaExpresiones = '';

  }

  ListaExpresiones() {
    if(this.preAnalysis.type  == 'ID' || this.preAnalysis.type  == 'ID' || 
    this.preAnalysis.type  == 'NOT_OPT' || this.preAnalysis.type  == 'AND_OPT'
    || this.preAnalysis.type  == 'OR_OPT' || this.preAnalysis.type  == 'XOR_OPT') {
      this.astString += "n" + this.nodeCont + '[label="EXPRESION"];\n';
      this.astString += this.padreListaExpresiones + "->n" + this.nodeCont + ";\n";
      this.padreExpresion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Expresion();
    }
  }

  OperadorNot() {
    if (this.preAnalysis.type == "NOT_OPT") {
      if (this.doWhileFound) {
        this.doWhileContent += "not ";
      } else {
        this.stringTraduccion += "not ";
      }
      this.astString += "n" + this.nodeCont + '[label="!"];\n';
      this.astString += this.padreOperadorNot + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
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
      this.astString += "n" + this.nodeCont + '[label="&&"];\n';
      this.astString += this.padreCondicion + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("AND_OPT");
      this.astString += "n" + this.nodeCont + '[label="EXPRSION"];\n';
      this.astString += this.padreCondicion + "->n" + this.nodeCont + ";\n";
      this.padreExpresion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Expresion();

    }
    if (this.preAnalysis.type == "OR_OPT") {
      if (this.doWhileFound) {
        this.doWhileContent += "or ";
      } else {
        this.stringTraduccion += "or ";
      }
      this.astString += "n" + this.nodeCont + '[label="||"];\n';
      this.astString += this.padreCondicion + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("OR_OPT");
      this.astString += "n" + this.nodeCont + '[label="EXPRSION"];\n';
      this.astString += this.padreCondicion + "->n" + this.nodeCont + ";\n";
      this.padreExpresion = 'n' + this.nodeCont;
      this.nodeCont++;
      this.Expresion();
    }
    if (this.preAnalysis.type == "XOR_OPT") {
      if (this.doWhileFound) {
        this.doWhileContent += "xor ";
      } else {
        this.stringTraduccion += "xor ";
      }
      this.astString += "n" + this.nodeCont + '[label="^"];\n';
      this.astString += this.padreCondicion + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("XOR_OPT");
      this.astString += "n" + this.nodeCont + '[label="EXPRSION"];\n';
      this.astString += this.padreCondicion + "->n" + this.nodeCont + ";\n";
      this.padreExpresion = 'n' + this.nodeCont;
      this.nodeCont++;
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
      this.astString += "n" + this.nodeCont + '[label=">="];\n';
      this.astString += this.padreCondicionLogica + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("GREATER_EQL");
      this.astString += "n" + this.nodeCont + '[label="E"];\n';
      this.astString += this.padreCondicionLogica + "->n" + this.nodeCont + ";\n";
      this.padreE = 'n' + this.nodeCont;
      this.nodeCont++;
      this.E();
      this.padreE = '';

    } else if (this.preAnalysis.type == "LESS_EQL") {
      if (this.forFound != true) {
        if (this.doWhileFound) {
          this.doWhileContent += "<= ";
        } else {
          this.stringTraduccion += "<= ";
        }
      }
      this.astString += "n" + this.nodeCont + '[label="<="];\n';
      this.astString += this.padreCondicionLogica + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("LESS_EQL");
      this.astString += "n" + this.nodeCont + '[label="E"];\n';
      this.astString += this.padreCondicionLogica + "->n" + this.nodeCont + ";\n";
      this.padreE = 'n' + this.nodeCont;
      this.nodeCont++;
      this.E();
      this.padreE = '';
    } else if (this.preAnalysis.type == "LESS_THAN") {
      if (this.forFound != true) {
        if (this.doWhileFound) {
          this.doWhileContent += "< ";
        } else {
          this.stringTraduccion += "< ";
        }
      }
      this.astString += "n" + this.nodeCont + '[label="<"];\n';
      this.astString += this.padreCondicionLogica + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("LESS_THAN");
      this.astString += "n" + this.nodeCont + '[label="E"];\n';
      this.astString += this.padreCondicionLogica + "->n" + this.nodeCont + ";\n";
      this.padreE = 'n' + this.nodeCont;
      this.nodeCont++;
      this.E();
      this.padreE = '';
    } else if (this.preAnalysis.type == "GREATER_THAN") {
      if (this.forFound != true) {
        if (this.doWhileFound) {
          this.doWhileContent += "> ";
        } else {
          this.stringTraduccion += "> ";
        }
      }
      this.astString += "n" + this.nodeCont + '[label=">"];\n';
      this.astString += this.padreCondicionLogica + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("GREATER_THAN");
      this.astString += "n" + this.nodeCont + '[label="E"];\n';
      this.astString += this.padreCondicionLogica + "->n" + this.nodeCont + ";\n";
      this.padreE = 'n' + this.nodeCont;
      this.nodeCont++;
      this.E();
      this.padreE = '';
    } else if (this.preAnalysis.type == "INEQUALITY") {
      if (this.forFound != true) {
        if (this.doWhileFound) {
          this.doWhileContent += "!= ";
        } else {
          this.stringTraduccion += "!= ";
        }
      }
      this.astString += "n" + this.nodeCont + '[label="!="];\n';
      this.astString += this.padreCondicionLogica + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("INEQUALITY");
      this.astString += "n" + this.nodeCont + '[label="E"];\n';
      this.astString += this.padreCondicionLogica + "->n" + this.nodeCont + ";\n";
      this.padreE = 'n' + this.nodeCont;
      this.nodeCont++;
      this.E();
      this.padreE = '';
    } else if (this.preAnalysis.type == "EQUALS_SIGN") {
      if (this.forFound != true) {
        if (this.doWhileFound) {
          this.doWhileContent += "== ";
        } else {
          this.stringTraduccion += "== ";
        }
      }
      this.astString += "n" + this.nodeCont + '[label="=="];\n';
      this.astString += this.padreCondicionLogica + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("EQUALS_SIGN");
      this.astString += "n" + this.nodeCont + '[label="E"];\n';
      this.astString += this.padreCondicionLogica + "->n" + this.nodeCont + ";\n";
      this.padreE = 'n' + this.nodeCont;
      this.nodeCont++;
      this.E();
      this.padreE = '';
    }
  }

  E() {
    this.astString += "n" + this.nodeCont + '[label="T"];\n';
    this.astString += this.padreE + "->n" + this.nodeCont + ";\n";
    this.padreT = 'n' + this.nodeCont
    this.nodeCont++;
    this.T();
    this.padreT = '';

    this.astString += "n" + this.nodeCont + '[label="EP"];\n';
    this.astString += this.padreE + "->n" + this.nodeCont + ";\n";
    this.padreEP = 'n' + this.nodeCont
    this.nodeCont++;
    this.EP();
    this.padreEP = '';
  }

  EP() {
    if (this.preAnalysis.type == "PLUS_SIGN") {
      if (this.doWhileFound) {
        this.doWhileContent += "+ ";
      } else {
        this.stringTraduccion += "+ ";
      }
      this.astString += "n" + this.nodeCont + '[label="+"];\n';
      this.astString += this.padreEP + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("PLUS_SIGN");
      this.astString += "n" + this.nodeCont + '[label="T"];\n';
      this.astString += this.padreEP + "->n" + this.nodeCont + ";\n";
      this.padreT = 'n' + this.nodeCont
      this.nodeCont++;
      this.T();
      this.padreT = '';
      this.EP();
    }
    if (this.preAnalysis.type == "SUBS_SIGN") {
      if (this.doWhileFound) {
        this.doWhileContent += "- ";
      } else {
        this.stringTraduccion += "- ";
      }
      this.astString += "n" + this.nodeCont + '[label="-"];\n';
      this.astString += this.padreEP + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("SUBS_SIGN");
      this.astString += "n" + this.nodeCont + '[label="T"];\n';
      this.astString += this.padreEP + "->n" + this.nodeCont + ";\n";
      this.padreT = 'n' + this.nodeCont
      this.nodeCont++;
      this.T();
      this.padreT = '';
      this.EP();
    }
  }

  T() {
    this.astString += "n" + this.nodeCont + '[label="F"];\n';
    this.astString += this.padreT + "->n" + this.nodeCont + ";\n";
    this.padreF = 'n' + this.nodeCont
    this.nodeCont++;
    this.F();
    this.padreF = '';

    this.astString += "n" + this.nodeCont + '[label="TP"];\n';
    this.astString += this.padreT + "->n" + this.nodeCont + ";\n";
    this.padreTP = 'n' + this.nodeCont
    this.nodeCont++;
    this.TP();
    this.padreTP = '';
  }

  TP() {
    if (this.preAnalysis.type == "MULT_SIGN") {
      if (this.doWhileFound) {
        this.doWhileContent += "* ";
      } else {
        this.stringTraduccion += "* ";
      }
      this.astString += "n" + this.nodeCont + '[label="*"];\n';
      this.astString += this.padreTP + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("MULT_SIGN");
      this.astString += "n" + this.nodeCont + '[label="F"];\n';
      this.astString += this.padreTP + "->n" + this.nodeCont + ";\n";
      this.padreF = 'n' + this.nodeCont
      this.nodeCont++;
      this.F();
      this.padreF = '';

      this.TP();
    }
    if (this.preAnalysis.type == "DIV_SIGN") {
      if (this.doWhileFound) {
        this.doWhileContent += "/ ";
      } else {
        this.stringTraduccion += "/";
      }
      this.astString += "n" + this.nodeCont + '[label="/"];\n';
      this.astString += this.padreTP + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("DIV_SIGN");
      this.astString += "n" + this.nodeCont + '[label="F"];\n';
      this.astString += this.padreTP + "->n" + this.nodeCont + ";\n";
      this.padreF = 'n' + this.nodeCont
      this.nodeCont++;
      this.F();
      this.padreF = '';
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
      this.astString += "n" + this.nodeCont + '[label="NUMERO"];\n';
      this.astString += this.padreF + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.astString += "n" + this.nodeCont + '[label="' + this.preAnalysis.value + '"];\n';
      this.astString += 'n' + (this.nodeCont - 1)  + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("NUMBER");
    } else if (this.preAnalysis.type == "ID") {
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
        this.forValue1 == ""
      ) {
        this.forValue2 = this.preAnalysis.value ;
      }
      this.astString += "n" + this.nodeCont + '[label="ID"];\n';
      this.astString += this.padreF + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.astString += "n" + this.nodeCont + '[label="' + this.preAnalysis.value + '"];\n';
      this.astString += 'n' + (this.nodeCont - 1)  + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
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
      this.astString += "n" + this.nodeCont + '[label="true"];\n';
      this.astString += this.padreF + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RESERVED_TRUE");
    } else if (this.preAnalysis.type == "RESERVED_FALSE") {
      if (this.doWhileFound) {
        this.doWhileContent += "False ";
      } else {
        this.stringTraduccion += "False";
      }
      this.astString += "n" + this.nodeCont + '[label="false"];\n';
      this.astString += this.padreF + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RESERVED_FALSE");
    } else if (this.preAnalysis.type == "LEFT_PARENT") {
      this.astString += "n" + this.nodeCont + '[label="("];\n';
      this.astString += this.padreF + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("LEFT_PARENT");
      this.astString += "n" + this.nodeCont + '[label="E"];\n';
      this.astString += this.padreF + "->n" + this.nodeCont + ";\n";
      this.padreE = 'n' + this.nodeCont;
      this.nodeCont++;
      this.E();
      this.astString += "n" + this.nodeCont + '[label=")"];\n';
      this.astString += this.padreF + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("RIGHT_PARENT");
    } else if (this.preAnalysis.type == "STRING") {
      if (this.doWhileFound) {
        this.doWhileContent += this.preAnalysis.value + ' ';
      } else {
        this.stringTraduccion += this.preAnalysis.value + ' ';
      }
      this.astString += "n" + this.nodeCont + '[label="STRING"];\n';
      this.astString += this.padreF + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.astString += "n" + this.nodeCont + '[label=' + this.preAnalysis.value + '];\n';
      this.astString += 'n' + (this.nodeCont - 1)  + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.match("STRING");
    }
  }


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
