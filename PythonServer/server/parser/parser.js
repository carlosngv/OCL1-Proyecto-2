var Error = require("./error");

class Parser {
  constructor(tokenList) {
    this.tokenList = tokenList;
    this.preAnalysis = tokenList[0];
    this.numPreAnalysis = 0;
    this.errorList = [];
    this.stringTraduccion = "";
    this.defFound = false;
    this.contTab = 0;
  }

  parse() {
    this.Inicio();
  }

  Inicio() {
    this.match("RESERVED_PUBLIC");
    if (this.preAnalysis.type == "RESERVED_CLASS") {
      // 'public' SENTENCIA_CLASE LISTA_CLASES 'ultimo'
      this.SentenciaClase();
      this.ListaClases();
      this.match("LAST");
    } else if (this.preAnalysis.type == "RESERVED_INTERFACE") {
      // 'public' SENTENCIA_INTERFAZ LISTA_INTERFACES 'ultimo'
      this.SentenciaInterfaz();
      this.ListaInterfaces();
      this.match("LAST");
    }
  }

  SentenciaClase() {
    // public class { LISTA_DECLARACION_METODOS_FUNCIONES }
    this.stringTraduccion += this.preAnalysis.value + ' ';
    this.match("RESERVED_CLASS");
    this.stringTraduccion += this.preAnalysis.value;
    this.match("ID");
    this.stringTraduccion += ':\n'
    this.contTab++;
    this.match("LEFT_BRACE");
    this.ListaDeclaracionMetodosFunciones();
    this.contTab--;
    this.stringTraduccion += '\n'
    this.match("RIGHT_BRACE");
  }

  ListaClases() {
    // SENTENCIA_CLASE LISTA_CLASES
    if (this.preAnalysis.type == "RESERVED_PUBLIC") {
      this.match('RESERVED_PUBLIC')
      this.SentenciaClase();
      this.ListaClases();
    }
  }

  SentenciaInterfaz() {
    // 'interface' id '{' LISTA_DECLARACION_METODOS'}'
    this.match("RESERVED_INTERFACE");
    this.match("ID");
    this.match("LEFT_BRACE");
    this.ListaDeclaracionMetodos();
    this.match("RIGHT_BRACE");
  }

  ListaInterfaces() {
    if (this.preAnalysis.type == "RESERVED_INTERFACE") {
      this.SentenciaInterfaz();
      this.ListaInterfaces();
    }
  }

  ListaDeclaracionMetodosFunciones() {
    if (this.preAnalysis.type == "RESERVED_PUBLIC") {
      this.DeclaracionMetodosFunciones();
      this.ListaDeclaracionMetodosFunciones();
    }
  }

  ListaDeclaracionMetodos() {
    if (this.preAnalysis.type == "RESERVED_PUBLIC") {
      this.DeclaracionMetodos();
      this.ListaDeclaracionMetodos();
    }
  }

  DeclaracionMetodosFunciones() {
    this.match("RESERVED_PUBLIC");
    this.tabular();
    if (this.preAnalysis.type == "RESERVED_VOID") {
      this.stringTraduccion += 'def ';
      this.defFound = true;
      this.match("RESERVED_VOID");
    } else {
      this.stringTraduccion += 'def '
      this.Tipo();
    }
    this.stringTraduccion += this.preAnalysis.value 
    this.match("ID");
    this.stringTraduccion += this.preAnalysis.value 
    this.match("LEFT_PARENT");
    this.DeclaracionParametros();
  }

  DeclaracionMetodos() {
    this.tabular();
    this.match("RESERVED_PUBLIC");
    this.stringTraduccion += 'def '
    this.match("RESERVED_VOID");
    this.stringTraduccion += this.preAnalysis.value 
    this.match("ID");
    this.stringTraduccion += this.preAnalysis.value 
    this.match("LEFT_PARENT");
    this.DeclaracionParametros();
  }

  DeclaracionParametros() {
    if (this.preAnalysis.type == "RIGHT_PARENT") {
      this.contTab++;
      this.stringTraduccion += this.preAnalysis.value + ':\n'
      this.match("RIGHT_PARENT");
      this.ListaInstrLlaves();
    } else {
      this.Tipo();
      this.stringTraduccion += this.preAnalysis.value 
      this.match("ID");
      this.ListaParametros();
      this.stringTraduccion += this.preAnalysis.value + ':\n'
      this.contTab++;
      this.match("RIGHT_PARENT");
      this.ListaInstrLlaves();
    }
  }

  ListaParametros() {
    if (this.preAnalysis.type == "COMMA") {
      this.stringTraduccion += this.preAnalysis.value + ' '
      this.match("COMMA");
      this.Tipo();
      this.stringTraduccion += this.preAnalysis.value
      this.match("ID");
      this.ListaParametros();
    }
  }

  Tipo() {
    if (this.preAnalysis.type == "RESERVED_INT") {
      this.stringTraduccion += 'var ';
      this.match("RESERVED_INT");
    } else if (this.preAnalysis.type == "RESERVED_BOOLEAN") {
      this.stringTraduccion += 'var ';
      this.match("RESERVED_BOOLEAN");
    } else if (this.preAnalysis.type == "RESERVED_DOUBLE") {
      this.stringTraduccion += 'var ';
      this.match("RESERVED_DOUBLE");
    } else if (this.preAnalysis.type == "RESERVED_STRING") {
      this.stringTraduccion += 'var ';
      this.match("RESERVED_STRING");
    } else if (this.preAnalysis.type == "RESERVED_CHAR") {
      this.stringTraduccion += 'var ';
      this.match("RESERVED_CHAR");
    }
  }

  Instruccion() {
    if (this.preAnalysis.type == "RESERVED_IF") {
      this.tabular();
      this.SentenciaIf();
    } else if (this.preAnalysis.type == "RESERVED_WHILE") {
      this.tabular();
      this.SentenciaWhile();
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
    } else if (this.preAnalysis.type == "RESERVED_PUBLIC" && this.tokenList[this.numPreAnalysis + 1].type == 'RESERVED_STATIC') {
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
    } else if( this.preAnalysis.type == "RESERVED_INT" || this.preAnalysis.type == "RESERVED_CHAR" || 
    this.preAnalysis.type == "RESERVED_BOOLEAN" || this.preAnalysis.type == "RESERVED_STRING" || this.preAnalysis.type == "RESERVED_DOUBLE"){
      this.tabular();
      this.DeclaracionVariable();
    }
  }

  ListaInstrucciones() {
    this.Instruccion();
    this.ListaInstruccionesP();
  }

  ListaInstruccionesP() {
    if (this.preAnalysis.type == "RESERVED_IF") {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (this.preAnalysis.type == "RESERVED_WHILE") {
      this.Instruccion();
      this.ListaInstruccionesP();
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
    } else if (this.preAnalysis.type == "RESERVED_PUBLIC" && this.tokenList[this.numPreAnalysis + 1].type == 'RESERVED_STATIC') {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "RESERVED_RETURN" && this.tokenList[this.numPreAnalysis + 1].type == "SEMICOLON") {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if (
      this.preAnalysis.type == "RESERVED_RETURN" && this.tokenList[this.numPreAnalysis + 1].type != "SEMICOLON") {
      this.Instruccion();
      this.ListaInstruccionesP();
    } else if ( this.preAnalysis.type == "ID" && this.tokenList[this.numPreAnalysis + 1].type == "LEFT_PARENT") {
        this.Instruccion();
        this.ListaInstruccionesP();
    } else if (this.preAnalysis.type == "ID" && this.tokenList[this.numPreAnalysis + 1].type == "EQUALS_SIGN") { 
        this.Instruccion();
        this.ListaInstruccionesP();
    } else if( this.preAnalysis.type == "RESERVED_INT" || this.preAnalysis.type == "RESERVED_CHAR" || 
    this.preAnalysis.type == "RESERVED_BOOLEAN" || this.preAnalysis.type == "RESERVED_STRING" || this.preAnalysis.type == "RESERVED_DOUBLE"){
       this.Instruccion();
        this.ListaInstruccionesP();
    }
    
    
  }

  ListaInstrLlaves() {
    this.match("LEFT_BRACE");
    this.ListaInstrucciones();
    this.contTab--;
    this.stringTraduccion += '\n'
    this.match("RIGHT_BRACE");
  }

  SentenciaReturnMetodos() {
    this.stringTraduccion += this.preAnalysis.value;
    this.match("RESERVED_RETURN");
    this.match("SEMICOLON");
  }

  SentenciaReturnFunciones() {
    this.stringTraduccion += this.preAnalysis.value;
    this.match("RESERVED_RETURN");
    this.E();
    this.match("SEMICOLON");
  }

  AsignacionSimple() {
    this.stringTraduccion += this.preAnalysis.value +' '
    this.match("ID");
    this.AsignacionSimpleP();
  }

  AsignacionSimpleP() {
    this.match("EQUALS_SIGN");
    this.E();
    this.match("SEMICOLON");
  }

  Asignacion() {
    if (this.preAnalysis.type == "EQUALS_SIGN") {
      this.stringTraduccion += this.preAnalysis.value +' '
      this.match("EQUALS_SIGN");
      this.E();
      this.stringTraduccion += '\n'
      this.match("SEMICOLON");
    }
  }

  DeclaracionVariable() {
    this.Tipo();
    this.stringTraduccion += this.preAnalysis.value + ' '
    this.match("ID");
    this.DeclaracionVariableP();
  }

  DeclaracionVariableP() {
    this.ListaID();
    this.Asignacion();
  }

  ListaID() {
    if (this.preAnalysis.type == "COMMA") {
      this.stringTraduccion += this.preAnalysis.value + ' '
      this.match("COMMA");
      this.stringTraduccion += this.preAnalysis.value
      this.match("ID");
      this.ListaID();
    }
  }

  LlamadaMetodo() {
    this.match("LEFT_PARENT");
    this.ListaParametros();
    this.match("RIGHT_PARENT");
    this.match("SEMICOLON");
  }

  SentenciaMain() {
    this.match("RESERVED_PUBLIC");
    this.match("RESERVED_STATIC");
    this.match("RESERVED_VOID");
    this.match("RESERVED_MAIN");
    this.match("LEFT_PARENT");
    this.match("RESERVED_STRING");
    this.match("LEFT_BRACKET");
    this.match("RIGHT_BRACKET");
    this.match("RESERVED_ARGS");
    this.match("RIGHT_PARENT");
    this.ListaInstrLlaves();
  }

  SentenciaContinue() {
    this.match("RESERVED_CONTINUE");
    this.match("SEMICOLON");
  }

  SentenciaBreak() {
    this.match("RESERVED_BREAK");
    this.match("SEMICOLON");
  }

  SentenciaPrint() {
    this.match("RESERVED_SYSTEM");
    this.match("DOT");
    this.match("RESERVED_OUT");
    this.match("DOT");
    this.stringTraduccion += 'print'
    this.match("RESERVED_PRINTLN");
    this.stringTraduccion += this.preAnalysis.value
    this.match("LEFT_PARENT");
    this.stringTraduccion += this.preAnalysis.value
    this.match('STRING');
    this.stringTraduccion += this.preAnalysis.value + '\n'
    this.match("RIGHT_PARENT");
    this.match('SEMICOLON');
    
  }

  SentenciaWhile() {
    this.match("RESERVED_WHILE");
    this.match("LEFT_PARENT");
    this.Expresion();
    this.match("RIGHT_PARENT");
    this.ListaInstrLlaves();
  }

  SentenciaIf() {
    this.match("RESERVED_IF");
    this.match("LEFT_PARENT");
    this.Expresion();
    this.match("RIGHT_PARENT");
    this.ListaInstrLlaves();
    this.OpcionElse();
  }

  SentenciaDoWhile() {

  }

  OpcionElse() {
    if (this.preAnalysis.type == "RESERVED_ELSE") {
      this.match("RESERVED_ELSE");
      this.ListaIf();
    }
  }

  ListaIf() {
    if (this.preAnalysis.type == "LEFT_BRACE") {
      this.ListaInstrLlaves();
    }
    if (this.preAnalysis.type == "RESERVED_IF") {
      this.SentenciaIf();
    }
  }

  SentenciaFor() {
    this.match("RESERVED_FOR");
    this.match("LEFT_PARENT");
    this.DeclaracionFor();
    this.match("SEMICOLON");
    this.Expresion();
    this.match("SEMICOLON");
    this.match("ID");
    this.IncrementoDecremento();
    this.match("RIGHT_PARENT");
    this.ListaInstrLlaves();
  }

  DeclaracionFor() {
    if (this.preAnalysis.type == "ID") {
      this.match("ID");
      this.match("EQUALS_SIGN");
      this.E();
    } else {
      this.Tipo();
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
      this.match("NOT_OPT");
    }
  }

  Condicion() {
    if (this.preAnalysis.type == "AND_OPT") {
      this.match("AND_OPT");
      this.Expresion();
    }
    if (this.preAnalysis.type == "OR_OPT") {
      this.match("OR_OPT");
      this.Expresion();
    }
    if (this.preAnalysis.type == "XOR_OPT") {
      this.match("XOR_OPT");
      this.Expresion();
    }
  }

  CondicionLogica() {
    if (this.preAnalysis.type == "GREATER_EQL") {
      this.match("GREATER_EQL");
      this.E();
    } else if (this.preAnalysis.type == "LESS_EQL") {
      this.match("LESS_EQL");
      this.E();
    } else if (this.preAnalysis.type == "LESS_THAN") {
      this.match("LESS_THAN");
      this.E();
    } else if (this.preAnalysis.type == "GREATER_THAN") {
      this.match("GREATER_THAN");
      this.E();
    } else if (this.preAnalysis.type == "INEQUALITY") {
      this.match("INEQUALITY");
      this.E();
    }
  }

  E() {
    this.T();
    this.EP();
  }

  EP() {
    if (this.preAnalysis.type == "PLUS_SIGN") {
      this.match("PLUS_SIGN");
      this.T();
      this.EP();
    }
    if (this.preAnalysis.type == "SUBS_SIGN") {
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
      this.match("MULT_SIGN");
      this.F();
      this.TP();
    }
    if (this.preAnalysis.type == "DIV_SIGN") {
      this.match("DIV_SIGN");
      this.F();
      this.TP();
    }
  }

  F() {
    if (this.preAnalysis.type == "NUMBER") {
      this.stringTraduccion += this.preAnalysis.value +' '
      this.match("NUMBER");
    } else if (this.preAnalysis.type == "ID") {
      this.stringTraduccion += this.preAnalysis.value +' '
      this.match("ID");
    } else if (this.preAnalysis.type == "DECIMAL") {
      this.match("DECIMAL");
    } else if (this.preAnalysis.type == "RESERVED_TRUE") {
      this.stringTraduccion += 'True'
      this.match("RESERVED_TRUE");
    } else if (this.preAnalysis.type == "RESERVED_FALSE") {
      this.stringTraduccion += 'False'
      this.match("RESERVED_FALSE");
    } else if (this.preAnalysis.type == "LEFT_PARENT") {
      this.match("LEFT_PARENT");
      this.E();
      this.match("RIGHT_PARENT");
    } else if (this.preAnalysis.type == "STRING") {
      this.stringTraduccion += this.preAnalysis.value
      this.match("STRING");
    }
  }

  match(type) {
    if (type != this.preAnalysis.type) {
      console.log("Expected", type);
      let newError = new Error("Expected " + type);
      this.errorList.push(newError);
    }
    if (this.preAnalysis.type != "LAST") {
      this.numPreAnalysis += 1;
      this.preAnalysis = this.tokenList[this.numPreAnalysis];
    }
  }

  // Demás funciones
  tabular() {
    for(var i = 0; i < this.contTab; i++){
      this.stringTraduccion += '\t';
    } 
  }
}




module.exports = Parser;