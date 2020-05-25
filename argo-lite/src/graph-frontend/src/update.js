var def = require("./imports").default;
var THREE = def.THREE;
var Edge = def.Edge;
var Node = def.Node;
var OrbitControls = def.OrbitControls;
var d3 = def.d3;
var ee = def.ee;

module.exports = function(self) {
  /**
   *  Update the position and color of the edges
   */
  self.updateEdges = function() {
    self.edges.setDrawRange(0, self.drawCount + 6);
    var total = self.drawCount + 6;
    var positions = self.edges.attributes.position.array;
    var colors = self.edges.attributes.color.array;
    for (var i = 0; i < total; i += 2) {
      if (self.lineIndices[i / 2]) {
        if (self.lineIndices[i / 2].hide) {
          var v1pos = self.lineObjects[i].renderData.draw_object.position;
          var v2pos = self.lineObjects[i + 1].renderData.draw_object.position;
          positions[i * 3] = v1pos.x;
          positions[i * 3 + 1] = v1pos.y;
          positions[i * 3 + 3] = v2pos.x;
          positions[i * 3 + 4] = v2pos.y;
          colors[i * 3] = 255;
          colors[i * 3 + 1] = 255;
          colors[i * 3 + 2] = 255;
          colors[i * 3 + 3] = 255;
          colors[i * 3 + 4] = 255;
          colors[i * 3 + 5] = 255;
        } else {
          var v1pos = self.lineObjects[i].renderData.draw_object.position;
          var v2pos = self.lineObjects[i + 1].renderData.draw_object.position;
          var v1color = self.lineIndices[i / 2].linecolor;
          var v2color = self.lineIndices[i / 2].linecolor;
          positions[i * 3] = v1pos.x;
          positions[i * 3 + 1] = v1pos.y;
          positions[i * 3 + 3] = v2pos.x;
          positions[i * 3 + 4] = v2pos.y;
          colors[i * 3] = v1color.r;
          colors[i * 3 + 1] = v1color.g;
          colors[i * 3 + 2] = v1color.b;
          colors[i * 3 + 3] = v2color.r;
          colors[i * 3 + 4] = v2color.g;
          colors[i * 3 + 5] = v2color.b;
        }
      }
    }
    self.edges.attributes.position.needsUpdate = true;
    self.edges.attributes.color.needsUpdate = true;
  };

  /**
   *  Update the position of the labels
   */
  self.updateLabels = function() {
    var nodes = self.force.nodes();
    for (var i = 0; i < nodes.length; i++) {
      let thisNode = self.graph.getNode(nodes[i].id);
      if (thisNode.renderData.textHolder != undefined) {
        if (
          //thisNode.renderData.textHolder.children[0].element.hideme != false &&
          !thisNode.renderData.textHolder.children[0].element.override
        ) {
          thisNode.renderData.textHolder.children[0].element.hidden = true;
        } else {
          thisNode.renderData.textHolder.children[0].element.hidden = false;
        }
      }
      thisNode.renderData.textHolder.position.x =
        thisNode.renderData.size + thisNode.renderData.draw_object.position.x;
      thisNode.renderData.textHolder.position.y =
        thisNode.renderData.draw_object.position.y;
    }
  };

  /**
   *  Update the position and color of the edges
   */
  self.updateNodes = function() {
    if (self.options.layout == "ngraph") {
      self.graph.forEachNode(function(node) {
        if (node.renderData) {
          node.renderData.draw_object.position.x = self.force.getNodePosition(
            node.id
          ).x;
          node.renderData.draw_object.position.y = self.force.getNodePosition(
            node.id
          ).y;
        }
      });
      if (!self.paused) {
        self.force.step();
      }
    } else if (self.options.layout == "d3") {
      var nodes = self.force.nodes();
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].x = Math.max(
          -self.renderWidth,
          Math.min(self.renderWidth, nodes[i].x)
        );
        nodes[i].y = Math.max(
          -self.renderHeight,
          Math.min(self.renderHeight, nodes[i].y)
        );
        let thisNode = self.graph.getNode(nodes[i].id);
        if (thisNode && thisNode.renderData.draw_object) {
          if (!thisNode.pinnedx) {
            thisNode.fx = null;
            thisNode.renderData.draw_object.children[1].visible = false;
          } else {
            thisNode.fx = thisNode.x;
            thisNode.renderData.draw_object.children[1].visible = true;
          }
          if (!thisNode.pinnedy) {
            thisNode.fy = null;
          } else {
            thisNode.fy = thisNode.y;
          }
          thisNode.renderData.draw_object.position.x = nodes[i].x;
          thisNode.renderData.draw_object.position.y = nodes[i].y;
        }
      }

      if (!self.paused) {
        self.force.tick();
      }
    }
  };

  /**
   * Restrict camera translation
   */
  self.updateCamera = function() {
    self.controls.target.x -=
      self.controls.object.position.x -
      Math.max(
        -self.renderWidth,
        Math.min(self.renderWidth, self.controls.object.position.x)
      );
    self.controls.object.position.x -=
      self.controls.object.position.x -
      Math.max(
        -self.renderWidth,
        Math.min(self.renderWidth, self.controls.object.position.x)
      );
    self.controls.target.y -=
      self.controls.object.position.y -
      Math.max(
        -self.renderHeight,
        Math.min(self.renderHeight, self.controls.object.position.y)
      );
    self.controls.object.position.y -=
      self.controls.object.position.y -
      Math.max(
        -self.renderHeight,
        Math.min(self.renderHeight, self.controls.object.position.y)
      );
    self.setViewPortSize(self.ccamera);
  };

  /**
   * Given an ngraph, update the current ngraph and add or remove inconsistent nodes
   */
  self.updateGraph = function(graph) {
    var numNodesAdded = 0;
    graph.forEachNode(function(node) {
      var oldNode = self.graph.getNode(node.id);
      if (!oldNode) {
        if (!self.newNodeIds) {
          self.newNodeIds = [];
        }
        self.newNodeIds.push(node.id);
        self.addNode(node);
        numNodesAdded += 1;
        self.lastNode = self.graph.getNode(node.id);
      } else {
        self.updateNode(oldNode, node);
      }
    });
    graph.forEachLink(function(link) {
      if (!self.graph.getLink(link.fromId, link.toId)) {
        self.addEdge(
          self.graph.getNode(link.fromId),
          self.graph.getNode(link.toId)
        );
      }
    });

    self.graph.forEachNode(function(node) {
      var oldNode = graph.getNode(node.id);
      if (!oldNode) {
        self.removeNode(node);
      }
    });

    self.force.alpha(1);
    self.force.stop();

    if (numNodesAdded > 10) {
      // This seems unnecessary for now
      // self.tickToStatic = true;
      self.tickToStatic = false;
    } else {
      self.tickToStatic = false;
    }

    if (self.newNodeIds) {
      // Highlight every new node.
      self.highlightNodeIds(self.newNodeIds, true);

      // Select every new node if there aren't too many of them.
      if (self.newNodeIds.length < 10) {
        for (let i = 0; i < self.newNodeIds.length; i++) {
          self.selection.push(self.graph.getNode(self.newNodeIds[i]));
        }
        self.ee.emit("select-nodes", self.selection);
      }
    }
  };

  /**
   * update positions in the ngraph given a list of positions
   */
  self.updatePositions = function(positions) {
    self.graph.forEachNode(function(node) {
      var pos = positions[node.id];
      if (pos) {
        node.x = pos[0];
        node.y = pos[1];
        if (node.pinnedx) {
          node.fx = pos[0];
        }
        if (node.pinnedy) {
          node.fy = pos[1];
        }
      }
    });
  };

  /**
   * Update a node given a new node
   */
  self.updateNode = function(node, newNode) {
    if (newNode.data) {
      if (node.data.color && newNode.data.color) {
        node.data.color = newNode.data.color;
        node.renderData.color = node.data.color;
        node.renderData.draw_object.material.color.set(
          new THREE.Color(node.data.color)
        );
      }
      if (newNode.data.size && newNode.data.size > 0) {
        node.data.size = newNode.data.size;
        node.renderData.size = newNode.data.size;
        node.renderData.draw_object.scale.set(
          newNode.data.size,
          newNode.data.size,
          1
        );
        var hsize = 1 + def.HIGHLIGHT_SIZE / newNode.data.size;
        node.renderData.draw_object.children[0].scale.set(hsize, hsize, 1);
      }
      if (newNode.data.label) {
        node.data.label = newNode.data.label;
        node.renderData.label = node.data.label;
        node.renderData.textHolder.children[0].element.childNodes[0].innerText =
          node.data.label;
      }
      if (newNode.data.shape) {
        node.data.shape = newNode.data.shape;
        node.renderData.shape = node.data.shape;
        self.setNodeShape(node, node.data.shape);
      }
    }
  };
};
