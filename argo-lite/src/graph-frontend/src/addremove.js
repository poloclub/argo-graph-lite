var def = require("./imports").default;
var THREE = def.THREE;
var Edge = def.Edge;
var Node = def.Node;
var OrbitControls = def.OrbitControls;
var d3 = def.d3;
var ee = def.ee;
var $ = require("jquery");

module.exports = function(self) {
  self.addNode = function(node) {
    self.graph.addNode(node.id, node.data);
    var graphNode = self.graph.getNode(node.id);
    graphNode.x = node.x;
    graphNode.y = node.y;
    graphNode.fx = node.fx;
    graphNode.fy = node.fy;
    graphNode.pinnedx = node.fx != undefined;
    graphNode.pinnedy = node.fy != undefined;
    self.prepNode(graphNode);
    self.drawNode(graphNode);
    graphNode.links = [];
    self.layoutInit = true;
    return graphNode;
  };

  self.removeNode = function(node) {
    if (!node || !node.id) {
      return;
    }
    self.removeGraphEdges(node);
    self.undrawEdges(node);
    self.nodes.remove(node.renderData.draw_object);
    self.graph.removeNode(node.id);
    self.undrawNode(node);
    self.nodeCount -= 1;
  };

  self.removeGraphEdges = function(node) {
    var nodeLinks = self.graph.getLinks(node.id);
    if (nodeLinks) {
      nodeLinks.forEach(function(edge) {
        self.graph.removeLink(edge);
      });
    }
  };

  self.undrawNode = function(node) {
    var nodes = self.force.nodes();
    if (nodes) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].id == node.id) {
          self.scene.remove(nodes[i].renderData.draw_object);
          nodes[i].renderData.textHolder.children[0].element.hidden = true;
          nodes.splice(i, 1);
        }
      }
    }
  };

  self.undrawEdges = function(node) {
    var positions = self.edges.attributes.position.array;
    var colors = self.edges.attributes.color.array;
    var killed = 0;
    for (var i = 0; i - killed < self.lineIndices.length; i++) {
      if (
        self.lineIndices[i - killed].source.id == node.id ||
        self.lineIndices[i - killed].target.id == node.id
      ) {
        for (var j = i - killed; j < self.lineIndices.length; j++) {
          var k = j + 1;
          if (k == self.lineIndices.length) {
            positions[j * 6] = 0;
            positions[j * 6 + 1] = 0;
            positions[j * 6 + 3] = 0;
            positions[j * 6 + 4] = 0;
            colors[j * 6] = 255;
            colors[j * 6 + 1] = 160;
            colors[j * 6 + 2] = 80;
            colors[j * 6 + 3] = 255;
            colors[j * 6 + 4] = 160;
            colors[j * 6 + 5] = 80;
          } else {
            self.lineIndices[j] = self.lineIndices[k];
            self.lineObjects[j * 2] = self.lineObjects[k * 2];
            self.lineObjects[j * 2 + 1] = self.lineObjects[k * 2 + 1];
            positions[j * 6] = positions[k * 6];
            positions[j * 6 + 1] = positions[k * 6 + 1];
            positions[j * 6 + 3] = positions[k * 6 + 3];
            positions[j * 6 + 4] = positions[k * 6 + 4];
            colors[j * 6] = colors[k * 6];
            colors[j * 6 + 1] = colors[k * 6 + 1];
            colors[j * 6 + 2] = colors[k * 6 + 2];
            colors[j * 6 + 3] = colors[k * 6 + 3];
            colors[j * 6 + 4] = colors[k * 6 + 4];
            colors[j * 6 + 5] = colors[k * 6 + 5];
          }
        }
        self.lineIndices.pop();
        self.lineObjects.pop();
        self.lineObjects.pop();
        self.drawCount -= 2;
        killed += 1;
      }
    }
    console.log("Deleted " + killed.toString() + " edges");
  };

  self.getNode = function(node_id) {
    return self.graph.getNode(node_id);
  };

  self.addEdge = function(source, target, visible = true) {
    self.graph.addLink(source.id, target.id);
    self.drawEdge(self.getNode(source.id), self.getNode(target.id), visible);
  };
};
