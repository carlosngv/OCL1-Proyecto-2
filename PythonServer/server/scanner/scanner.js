var Error = require("./error");
var Token = require("./token");

class Scanner {
  constructor() {
    var tokenList;
    var errorList;
    var reservedList;
    var column;
    var row;
    var state;
    var aux;
    this.dataAux = "";
  }
  scan(input) {
    this.dataAux = input;
    this.reservedList = [
      "main",
      "public",
      "args",
      "class",
      "interface",
      "static",
      "void",
      "int",
      "print",
      "boolean",
      "double",
      "continue",
      "char",
      "string",
      "for",
      "while",
      "do",
      "String",
      "System",
      "println",
      "out",
      "true",
      "false",
      "if",
      "else",
      "break",
      "return",
      "package",
      "import",
      "private",
      "protected",
      "BigInteger",
      "valueOf",
      "throws",
      "IOException",
      "FileWriter",
      "write",
      "java",
      "math",
      "io",
      "new",
      "null",
      "default",
      "try",
      "catch",
      "goo",
      "native",
      "extends",
      "finally",
      "super",
      "this",
      "args",
    ];
    this.tokenList = [];
    this.errorList = [];
    this.row = 1;
    this.column = 1;
    this.state = 0;
    this.aux = "";
    let oneComment = false;
    input = input.split("\n"); // Split input by breakline

    for (var i = 0; i < input.length - 1; i++) {
      input[i] = input[i].trim(); // removes \t
      let words = input[i].split("");
      if (oneComment == true) {
        this.setToken("COMMENT", this.aux);
        oneComment = false;
      }
      words.forEach((char) => {
        switch (this.state) {
          case 0:
            if (char == ";") {
              this.setToken("SEMICOLON", char);
            } else if (char == ".") {
              this.setToken("DOT", char);
            } else if (char == ":") {
              this.setToken("COLON", char);
            } else if (char == "(") {
              this.aux += char;
              this.state = 17;
            } else if (char == ")") {
              this.setToken("RIGHT_PARENT", char);
            } else if (char == "{") {
              this.setToken("LEFT_BRACE", char);
            } else if (char == "}") {
              this.setToken("RIGHT_BRACE", char);
            } else if (char == "[") {
              this.setToken("LEFT_BRACKET", char);
            } else if (char == "]") {
              this.setToken("RIGHT_BRACKET", char);
            } else if (char == "*") {
              this.setToken("MULT_SIGN", char);
            } else if (char == "+") {
              this.state = 1;
              this.aux += char;
            } else if (char == "-") {
              this.aux += char;
              this.state = 2;
            } else if (char == "/") {
              this.aux += char;
              this.state = 3;
            } else if (char == "<") {
              this.state = 8;
              this.aux += char;
            } else if (char == ">") {
              this.state = 9;
              this.aux += char;
            } else if (char == "=") {
              this.state = 11;
              this.aux += char;
            } else if (char == "!") {
              this.state = 13;
              this.aux += char;
            } else if (char == '"') {
              this.aux += char;
              this.state = 12;
            } else if (char.match(/[a-zA-Z]/i)) {
              this.aux += char;
              this.state = 5;
            } else if (char.match(/[0-9]/)) {
              this.aux += char;
              this.state = 10;
            } else if (char == "|") {
              this.aux += char;
              this.state = 14;
            } else if (char == "&") {
              this.aux += char;
              this.state = 15;
            } else if (char == "^") {
              this.aux += char;
              this.state = 16;
            } else if (char.match(/^\s*$/g) || char == " " || char == "\t") {
            } else {
              this.setError(char, "Carácter no válido en el lenguaje.");
            }
            break;
          case 1:
            if (char != "+") {
              this.setToken("PLUS_SIGN", this.aux);
              if (char == ";") {
                this.setToken("SEMICOLON", char);
              } else if (char == ":") {
                this.setToken("COLON", char);
              } else if (char == ")") {
                this.setToken("RIGHT_PARENT", char);
              } else if (char == "(") {
                this.setToken("LEFT_PARENT", char);
              } else if (char == "}") {
                this.setToken("LEFT_BRACE", char);
              } else if (char == "{") {
                this.setToken("RIGHT_BRACE", char);
              }
            } else if (char == "+") {
              this.aux += char;
              this.setToken("INCREMENT_OPT", this.aux);
            } else {
              this.state = 0;
            }
            break;
          case 2:
            if (char != "-") {
              this.setToken("MINUS_SIGN", this.aux);
              if (char == ";") {
                this.setToken("SEMICOLON", char);
              } else if (char == ":") {
                this.setToken("COLON", char);
              } else if (char == ")") {
                this.setToken("RIGHT_PARENT", char);
              } else if (char == "(") {
                this.setToken("LEFT_PARENT", char);
              } else if (char == "{") {
                this.setToken("LEFT_BRACE", char);
              } else if (char == "}") {
                this.setToken("RIGHT_BRACE", char);
              }
            } else if (char == "-") {
              this.aux += char;
              this.setToken("DECRE_OPT", this.aux);
            } else {
              this.state = 0;
            }
            break;
          case 3:
            if (char == "*") {
              this.aux += char;
              this.state = 6;
            } else if (char != "/") {
              this.setToken("DIV_SIGN", this.aux);
              this.state = 0;
            } else if (char == "/") {
              this.aux += char;
              oneComment = true;
              this.state = 4;
            }
            break;

          case 4:
            this.aux += char;
            break;
          case 5:
            if (char.match(/[a-zA-Z]/i)) {
              this.state = 5;
              this.aux += char;
            } else {
              this.setToken(this.setReserved(this.aux), this.aux);
              if (char == ";") {
                this.setToken("SEMICOLON", char);
              } else if (char == ".") {
                this.setToken("DOT", char);
              } else if (char == ":") {
                this.setToken("COLON", char);
              } else if (char == "]") {
                this.setToken("RIGH_BRACKET", char);
              } else if (char == "[") {
                this.setToken("LEFT_BRACKET", char);
              } else if (char == "*") {
                this.setToken("MULT_SIGN", char);
              } else if (char == ")") {
                this.setToken("RIGHT_PARENT", char);
              } else if (char == "(") {
                this.aux += char;
                this.state = 17;
              } else if (char == "{") {
                this.setToken("LEFT_BRACE", char);
              } else if (char == "}") {
                this.setToken("RIGHT_BRACE", char);
              } else if (char == ",") {
                this.setToken("COMMA", char);
              } else if (char == "=") {
                this.aux += char;
                this.state = 9;
              } else if (char == "^") {
                this.aux += char;
                this.state = 16;
              } else if (char == "|") {
                this.aux += char;
                this.state = 14;
              } else if (char == "&") {
                this.aux += char;
                this.state = 15;
              } else if (char == "+") {
                this.aux += char;
                this.state = 1;
              } else if (char == "-") {
                this.aux += char;
                this.state = 2;
              } else if (char == "/") {
                this.aux += char;
                this.state = 3;
              } else if (char == ">") {
                this.aux += char;
                this.state = 9;
              } else if (char == "<") {
                this.aux += char;
                this.state = 8;
              } else if (char == "|") {
                this.aux += char;
                this.state = 14;
              } else {
                this.setError(char, "ERROR");
              }
            }
            break;
          case 6:
            if (char == "*") {
              this.aux += char;
              this.state = 7;
            } else {
              this.aux += char;
              this.state = 6;
            }
            break;
          case 7:
            if (char == "/") {
              this.aux += char;
              this.setToken("MULTILINE_COMMENT", this.aux);
            } else {
              this.state = 6;
              this.aux += char;
            }
            break;

          case 8:
            if (char == "=") {
              this.aux += char;
              this.setToken("LESS_EQL", this.aux);
              if (char == ";") {
                this.setToken("SEMICOLON", char);
              } else if (char == ":") {
                this.setToken("COLON", char);
              } else if (char == ")") {
                this.setToken("RIGHT_PARENT", char);
              } else if (char == "(") {
                this.state = 17;
                this.aux += char;
              } else if (char == "{") {
                this.setToken("LEFT_BRACE", char);
              } else if (char == "}") {
                this.setToken("RIGHT_BRACE", char);
              } else if (char == ",") {
                this.setToken("COMMA", char);
              } else if (char == "+") {
                this.aux += char;
                this.state = 1;
              } else if (char == "-") {
                this.aux += char;
                this.state = 2;
              } else if (char == '"') {
                this.aux += char;
                this.state = 12;
              } else if (char == "/") {
                this.aux += char;
                this.state = 3;
              } else if (char.match(/[0-9]/)) {
                this.state = 10;
                this.aux += char;
              }
            } else {
              this.setToken("LESS_THAN", this.aux);
              if (char == ";") {
                this.setToken("SEMICOLON", char);
              } else if (char == ":") {
                this.setToken("COLON", char);
              } else if (char == ")") {
                this.setToken("RIGHT_PARENT", char);
              } else if (char == "(") {
                this.state = 17;
                this.aux += char;
              } else if (char == "{") {
                this.setToken("LEFT_BRACE", char);
              } else if (char == "}") {
                this.setToken("RIGHT_BRACE", char);
              } else if (char == ",") {
                this.setToken("COMMA", char);
              } else if (char == "+") {
                this.aux += char;
                this.state = 1;
              } else if (char == "-") {
                this.aux += char;
                this.state = 2;
              } else if (char == '"') {
                this.aux += char;
                this.state = 12;
              } else if (char == "/") {
                this.aux += char;
                this.state = 3;
              } else if (char.match(/[0-9]/)) {
                this.state = 10;
                this.aux += char;
              }
            }
            break;
          case 9:
            if (char == "=") {
              this.aux += char;
              this.setToken("GREATER_EQL", this.aux);
            } else {
              this.setToken("GREATER_THAN", this.aux);
              if (char == ";") {
                this.setToken("SEMICOLON", char);
              } else if (char == ":") {
                this.setToken("COLON", char);
              } else if (char == "]") {
                this.setToken("RIGH_BRACKET", char);
              } else if (char == "[") {
                this.setToken("LEFT_BRACKET", char);
              } else if (char == ")") {
                this.setToken("RIGHT_PARENT", char);
              } else if (char == "(") {
                this.state = 17;
                this.aux += char;
              } else if (char == "{") {
                this.setToken("LEFT_BRACE", char);
              } else if (char == "}") {
                this.setToken("RIGHT_BRACE", char);
              } else if (char == ",") {
                this.setToken("COMMA", char);
              } else if (char == "+") {
                this.aux += char;
                this.state = 1;
              } else if (char == "-") {
                this.aux += char;
                this.state = 2;
              } else if (char == "/") {
                this.aux += char;
                this.state = 3;
              } else if (char == '"') {
                this.aux += char;
                this.state = 12;
              } else if (char.match(/[0-9]/)) {
                this.state = 10;
                this.aux += char;
              }
            }
            break;
          case 10:
            if (char.match(/[0-9]/)) {
              this.aux += char;
            } else if (char == ".") {
              this.aux += char;
              this.state = 10;
            } else {
              this.setToken("NUMBER", this.aux);
              if (char == ";") {
                this.setToken("SEMICOLON", char);
              } else if (char == ":") {
                this.setToken("COLON", char);
              } else if (char == "]") {
                this.setToken("RIGH_BRACKET", char);
              } else if (char == "*") {
                this.setToken("MULT_SIGN", char);
              } else if (char == "[") {
                this.setToken("LEFT_BRACKET", char);
              } else if (char == ")") {
                this.setToken("RIGHT_PARENT", char);
              } else if (char == "(") {
                this.state = 17;
                this.aux += char;
              } else if (char == "{") {
                this.setToken("LEFT_BRACE", char);
              } else if (char == "}") {
                this.setToken("RIGHT_BRACE", char);
              } else if (char == ",") {
                this.setToken("COMMA", char);
              } else if (char == "|") {
                this.aux += char;
                this.state = 14;
              } else if (char == "&") {
                this.aux += char;
                this.state = 15;
              } else if (char == "^") {
                this.aux += char;
                this.state = 16;
              } else if (char == "=") {
                this.aux += char;
                this.state = 9;
              } else if (char == "+") {
                this.aux += char;
                this.state = 1;
              } else if (char == "-") {
                this.aux += char;
                this.state = 2;
              } else if (char == "/") {
                this.aux += char;
                this.state = 3;
              }
            }
            break;
          case 11:
            if (char == "=") {
              this.aux += char;
              this.setToken("EQUALS_SIGN", this.aux);
            } else {
              this.setToken("EQUALS_SIGN", this.aux);
              if (char.match(/[0-9]/)) {
                this.state = 10;
                this.aux += char;
              } else if (char == '"') {
                this.state = 12;
                this.aux += char;
              }
            }
            break;
          case 12:
            if (char != '"') {
              this.state = 12;
              this.aux += char;
            } else if (char == '"') {
              this.aux += char;
              this.setToken("STRING", this.aux);
            }
            break;
          case 13:
            if (char == "=") {
              this.aux += char;
              this.setToken("INEQUALITY", this.aux);
            } else {
              this.setToken("NOT_OPT", this.aux);
              if (char.match(/[a-zA-Z]/i)) {
                this.aux += char;
                this.state = 5;
              }
            }
          case 14:
            if (char == "|") {
              this.aux += char;
              this.setToken("OR_OPT", this.aux);
            } else {
              if (char.match(/[0-9]/)) {
                this.state = 10;
                this.aux += char;
              } else if (char.match(/[a-zA-Z]/i)) {
                this.state = 5;
                this.aux += char;
              }
            }
            break;
          case 15:
            if (char == "&") {
              this.aux += char;
              this.setToken("AND_OPT", this.aux);
            } else {
              this.setToken("AND_OPT", this.aux);
              if (char.match(/[0-9]/)) {
                this.state = 10;
                this.aux += char;
              } else if (char.match(/[a-zA-Z]/i)) {
                this.state = 5;
                this.aux += char;
              }
            }
            break;
          case 16:
            this.setToken("XOR_OPT", this.aux);
            this.aux += char;
            if (char.match(/[0-9]/)) {
              this.state = 10;
              this.aux += char;
            } else if (char.match(/[a-zA-Z]/i)) {
              this.state = 5;
              this.aux += char;
            }
            break;
          case 17:
            this.setToken("LEFT_PARENT", this.aux);
            if (char == '"') {
              this.state = 12;
              this.aux += char;
            } else if (char.match(/[0-9]/)) {
              this.state = 10;
              this.aux += char;
            } else if (char.match(/[a-zA-Z]/i)) {
              this.state = 5;
              this.aux += char;
            } else if (char == ")") {
              this.setToken("RIGHT_PARENT", char);
            } else if (char == "(") {
              this.setToken("LEFT_PARENT", char);
            } else if (char == "!") {
              this.setToken("NOT_OPT", char);
            }
            break;
          default:
            console.log("error");
        }
      });

      this.row += 1;
      this.column = 0;
    }
    // Pushing LAST token.
    let newToken = new Token("LAST", "LAST", 0, 0);
    this.tokenList.push(newToken);
  }

  setToken(type, value) {
    this.state = 0;
    this.aux = "";
    this.column = this.column + 1;
    let newToken = new Token(type, value, this.row, this.column);
    this.tokenList.push(newToken);
  }

  setError(value, description) {
    if (value.match(/^\s*$/g) || value == " " || value == "\t") {
    } else {
      this.dataAux = this.dataAux.replace(value, "");
      this.state = 0;
      this.aux = "";
      this.column = this.column + 1;
      let newError = new Error(value, description, this.row, this.column);
      this.errorList.push(newError);
    }
  }

  setReserved(value) {
    for (var i = 0; i < this.reservedList.length; i++) {
      if (value == this.reservedList[i]) {
        return "RESERVED_" + this.reservedList[i].toUpperCase();
      }
    }
    return "ID";
  }
}

module.exports = Scanner;
