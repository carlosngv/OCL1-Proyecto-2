class Token {
  constructor(type, value, row, column) {
    this.type = type;
    this.value = value;
    this.row = row;
    this.column = column;
  }
  /* get type() {
    return this.type;
  }

  get value() {
    return this.value;
  }

  get row() {
    return this.row;
  }

  get column() {
    return this.column;
  } */
}


module.exports = Token;