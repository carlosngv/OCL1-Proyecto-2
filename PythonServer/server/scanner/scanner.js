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
  }
  scan(input) {
    this.reservedList = [
      "public",
      "class",
      "interface",
      "void",
      "int",
      "boolean",
      "double",
      "char",
      "string",
      "for",
      "while",
      "do",
      "System",
      "println",
      "out",
      "true",
      "false",
      "if",
      "else",
      "break",
      "continu",
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
              this.setToken("LEFT_PARENT", char);
            } else if (char == ")") {
              this.setToken("RIGHT_PARENT", char);
            } else if (char == "{") {
              this.setToken("LEFT_BRACE", char);
            } else if (char == "}") {
              this.setToken("RIGHT_BRACE", char);
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
              this.aux += char;
            } else if (char == ">") {
              this.aux += char;
            } else if (char == "=") {
              this.aux += char;
            } else if (char == "!") {
              this.aux += char;
            } else if (char.match(/[a-zA-Z]/i)) {
              this.aux += char;
              this.state = 5;
            } else {
              this.setError(char, "ERROR");
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
              } else if (char == "}") {
                this.setToken("LEFT_BRACE", char);
              } else if (char == "{") {
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
              this.setToken("COMMNENT", this.aux);
            } else {
              this.state = 6;
              this.aux += char;
            }
            break;
        }
      });

      this.row += 1;
      this.column = 0;
    }
  }

  setToken(type, value) {
    this.state = 0;
    this.aux = "";
    this.column = this.column + 1;
    let newToken = new Token(type, value, this.row, this.column);
    this.tokenList.push(newToken);
  }

  setError(value, description) {
    this.state = 0;
    this.aux = "";
    this.column = this.column + 1;
    let newError = new Error(value, description, this.row, this.column);
    this.errorList.push(newError);
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
