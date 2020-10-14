class Error {
  constructor(value, description, row, column) {
    this.value = value;
    this.description = description;
    this.row = row;
    this.column = column;
  }

  /* get value() {
    return this.value;
  }

  get description() {
    return this.description;
  }

  get row() {
    return this.row;
  }

  get column() {
    return this.column;
  } */
}

module.exports = Error;
