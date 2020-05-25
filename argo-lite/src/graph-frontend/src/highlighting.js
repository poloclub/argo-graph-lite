var def = require("./imports").default;
var THREE = def.THREE;
var Edge = def.Edge;
var Node = def.Node;
var d3 = def.d3;
var ee = def.ee;

module.exports = function(self) {
  /**
   *  Change color of node edges
   */
  self.highlightNode = function(node, toggle, color = def.NODE_HIGHLIGHT) {
    if (toggle) {
      node.renderData.draw_object.children[0].material.color.setHex(color);
      node.renderData.draw_object.children[0].visible = true;
    } else {
      node.renderData.draw_object.children[0].material.color.set(
        node.renderData.hcolor
      );
      node.renderData.draw_object.children[0].visible = false;
    }
  };

  /**
   *  Highlight edges from and to a node and hide others
   */
  self.highlightEdges = function(node, toggle) {
    const froms = [];
    const tos = [];
    for (var i = 0; i < self.selection.length; i++) {
      for (var j = 0; j < self.selection[i].links.length; j++) {
        froms.push(self.selection[i].links[j].fromId);
        tos.push(self.selection[i].links[j].toId);
      }
    }
    if (toggle) {
      for (var i = 0; i < node.links.length; i++) {
        froms.push(node.links[i].fromId);
        tos.push(node.links[i].toId);
      }
      self.highlightNeighbors(node, froms, tos);
    } else {
      self.highlightNeighbors(node, froms, tos);
    }
  };

  /**
   * Highlight adjacent nodes
   * 
   * Also highlights edges.
   */
  self.highlightNeighbors = function(node, froms, tos) {
    self.graph.forEachNode(n => {
      if (self.selection.indexOf(n) != -1 || n == node) {
        // If the node is selected or the node is the node to be highlighted
        self.colorNodeOpacity(n, 1);
        self.colorNodeEdge(n, 0.5, 0.5);
        for (var i = 0; n.linkObjs && i < n.linkObjs.length; i++) {
          n.linkObjs[i].linecolor = n.renderData.linecolor;
        }
      } else if (
        self.doHighlightNeighbors &&
        (froms.indexOf(n.id) != -1 || tos.indexOf(n.id) != -1)
      ) {
        // If the node is not selected or highlighted and
        // if the node is present in either froms or tos arrays
        self.colorNodeOpacity(n, 1);
        self.colorNodeEdge(n, 0.3, 0.9);
      } else if (
        !self.prevHighlights ||
        self.prevHighlights.indexOf(n.id) == -1
      ) {
        self.colorNodeOpacity(n, 0.5);
        self.colorNodeEdge(n, 0.3, 0.9);
        self.highlightNode(n, false, def.ADJACENT_HIGHLIGHT);
      }
    });
  };

  /**
   *  Change color of node edges
   */
  self.colorNodeEdge = function(node, dc, c) {
    node.renderData.linecolor.r = self.darkMode ? dc : c;
    node.renderData.linecolor.g = self.darkMode ? dc : c;
    node.renderData.linecolor.b = self.darkMode ? dc : c;
  };

  /**
   *  Change node opacity
   */
  self.colorNodeOpacity = function(node, op) {
    node.renderData.draw_object.material.opacity = op;
  };
};
