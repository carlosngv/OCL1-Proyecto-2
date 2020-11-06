class Tree {
  constructor() {
    this.auxNumber = 1;
    this.auxString = "digraph G{\n ";
  } 
  graph(node) {
    if (node.nodeNumber == 0) {
      node.nodeNumber = this.auxNumber;
      this.auxNumber++;
    }
    node.value = node.value.toString();
    node.value = node.value.replace('"','');
    node.value = node.value.replace('"','');
    this.auxString += node.nodeNumber + '[label = "' + node.value + '"];\n';
    node.childList.forEach((child) => {
      this.auxString += node.nodeNumber + "->" + this.auxNumber + ";\n";
      this.graph(child);
    });
    this.auxString = this.auxString.replace("undefined", "");
    return this.auxString;
  }

  trasverse(node) {
    node.childList.forEach((child) => {
      this.trasverse(child);
    });
  }
}

module.exports = Tree;
