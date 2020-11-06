class Token {
    constructor(token, value, row, column) {
        this.token = token;
        this.value = value;
        this.row = row;
        this.column = column;
    }
}

module.exports = Token;