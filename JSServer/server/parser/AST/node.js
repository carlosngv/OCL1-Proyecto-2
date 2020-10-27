class Node {
    constructor(value, type) {
        this.value = value;
        this.type = type;
        this.childList = [];
        this.traduction = "";
        this.nodeList = [];
        this.nodeNumber = 0;
        this.errorList = [];
    }

    setChild(child) {
        this.childList.push(child);
    }

}

module.exports = Node;