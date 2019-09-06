var $ = require("jquery");
function Edge(source, target) {
  this.source = source;
  this.target = target;
  this.renderData = {};
}

function Node(id, size = 0.5) {
  this.id = id;
  this.index = id;
  this.in = [];
  this.out = [];
  this.size = size;
  this.renderData = {};
  this.domainData = {};
  this.x = 1;
  this.y = 1;
  this.vx = 1;
  this.vy = 1;

  /**
   * Tells if a node is connected to a node of a certain id
   */
  this.connectedTo = function(id) {
    outNodeIds = this.out.map(function(outNode) {
      return outNode.id;
    });
    return $.inArray(id, outNodeIds) >= 0;
  };
}

Node.prototype.connectNode = function(node) {
  if (!this.connectedTo(node.id)) {
    this.out.push(node);
    return true;
  }
  return false;
};

exports.Edge = Edge;
exports.Node = Node;
