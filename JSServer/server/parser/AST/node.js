class Node {
    constructor(value, type) {
        this.value = value;
        this.type = type;
        this.childList = [];
        this.traduction = "";
        this.nodeList = [];
    }

    setChild(child) {
        this.childList.push(child);
    }

}

module.exports = Node;