var def = require("./imports").default;
var THREE = def.THREE;
var Edge = def.Edge;
var Node = def.Node;
var OrbitControls = def.OrbitControls;
var d3 = def.d3;
var ee = def.ee;

/**
 * These functions are endpoints revealed to Argo frontend
 */
module.exports = function(self) {
  /**
   * Set frame.mouseMode to the specified mode
   * @param {string} mode name of the mode, currently supports ['select', 'move']
   */
  self.setMouseMode = mode => {
    if (mode === "select") {
      // This is the default mode, where users can select one or multiple nodes
      self.mouseMode = "select";
      self.isMouseModeMove = false;
    } else if (mode === "move") {
      // move mode, where user can drag the screen to achieve panning
      self.mouseMode = "move";
      self.isMouseModeMove = true;
    }
  };

  self.pauseLayout = () => {
    self.paused = true;
  };
  window.pause = self.pauseLayout;

  self.resumeLayout = () => {
    self.paused = false;
  };

  self.mapSelectedNodes = () => {
    self.mapNodeAttributes(["degree", "log", "scalexy"], self.selection);
  };

  self.mapAllNodes = () => {
    self.mapNodeAttributes(["degree", "log", "scalexy"]);
  };

  self.pinSelectedNodes = () => {
    self.mapNodeAttributes([true, "", "pinned"], self.selection);
  };

  self.unpinSelectedNodes = () => {
    self.mapNodeAttributes([false, "", "pinned"], self.selection);
  };

  self.setLabelFontSize = size => {
    self.graph.forEachNode(function(node) {
      self.changeLabelFontSize(node, size, self.relativeFontSize);
    });
  };

  self.setLabelRelativeSize = size => {
    self.relativeFontSize = size;
    self.setLabelFontSize(self.labelSize);
  };

  self.setLabelLength = numChars => {
    self.graph.forEachNode(function(node) {
      self.changeLabelLength(node, numChars);
    });
  };

  self.toggleMiniMap = () => {
    if (self.mapShowing) {
      self.hideMiniMap();
    } else {
      self.showMiniMap();
    }
  };

  self.showMiniMap = () => {
    if (self.mapShowing) {
      return;
    }
    self.mapShowing = true;
    self.element.appendChild(self.minimapRenderer.domElement);
  };

  self.hideMiniMap = () => {
    if (!self.mapShowing) {
      return;
    }
    self.mapShowing = false;
    self.element.removeChild(self.minimapRenderer.domElement);
  };

  // The CSS Renderer for rendering labels is the most expensive
  // renderer. For 300+ nodes it's recommended to turn it off by
  // default and only use it when no node is moving to prevent
  // visible lagging (during layout, dragging etc.)
  self.turnOffLabelCSSRenderer = () => {
    if (self.cssRenderer.isPaused) {
      return;
    }
    self.element.removeChild(self.cssRenderer.domElement);
    self.cssRenderer.isPaused = true;
  };

  // See turnOffLabelCSSRenderer.
  self.turnOnLabelCSSRenderer = () => {
    if (!self.cssRenderer.isPaused) {
      return;
    }
    self.element.appendChild(self.cssRenderer.domElement);
    self.cssRenderer.isPaused = false;
  };

  // Emits id of every node with label being displayed at this moment.
  // Used to keep mobx state in sync since GraphStore and snapshot
  // needs to save what nodes have labels shown and what not.
  // Also turns off label CSSRenderer when no node is showing label.
  self.updateNodesShowingLabels = () => {
    var nodes = [];
    self.graph.forEachNode(n => {
      var node = self.graph.getNode(n.id);
      if (node.renderData.textHolder.children[0].element.override) {
        nodes.push(n.id);
      }
    });

    // Turns off label CSSRenderer when no node is showing label.
    // This is because CSSRenderer is slow.
    if (nodes.length == 0) {
      self.turnOffLabelCSSRenderer();
    } else if (!((self.selection.length > 0) && (self.dragging)) || (appState.graph.frame.paused)) { 
      //Only turns on when no node is moving
      self.turnOnLabelCSSRenderer();
    }

    self.ee.emit("show-node-label", nodes);
  };

  self.toggleSelectedLabels = () => {
    self.toggleLabels(self.selection.map(n => n.id));
  };

  self.showSelectedLabels = () => {
    document.getElementById("showSelected").style.display="none";
    document.getElementById("hideSelected").style.display="inline";
    self.showLabels(self.selection.map(n => n.id));
  };

  self.hideSelectedLabels = () => {
    document.getElementById("hideSelected").style.display="none";
    document.getElementById("showSelected").style.display="inline";
    self.hideLabels(self.selection.map(n => n.id));
  };

  self.toggleLabels = nodeids => {
    self.graph.forEachNode(n => {
      if (nodeids.includes(n.id)) {
        var node = self.graph.getNode(n.id);
        if (
          node.renderData.textHolder.children[0].element.override == undefined
        ) {
          node.renderData.textHolder.children[0].element.override = false;
        }
        node.renderData.textHolder.children[0].element.override = !node
          .renderData.textHolder.children[0].element.override;
      }
    });
    self.updateNodesShowingLabels();
  };

  self.showLabels = nodeids => {
    self.graph.forEachNode(n => {
      if (nodeids.includes(n.id)) {
        var node = self.graph.getNode(n.id);
        node.renderData.textHolder.children[0].element.override = true;
      }
    });
    self.updateNodesShowingLabels();
  };

  self.hideLabels = nodeids => {
    self.graph.forEachNode(n => {
      if (nodeids.includes(n.id)) {
        var node = self.graph.getNode(n.id);
        node.renderData.textHolder.children[0].element.override = false;
      }
    });
    self.updateNodesShowingLabels();
  };

  self.hideAllLabels = () => {
    document.getElementById("hideAll").style.display="none";
    document.getElementById("showAll").style.display="inline";
    self.graph.forEachNode(function(node) {
      var node = self.graph.getNode(node.id);
      node.renderData.textHolder.children[0].element.override = false;
    });
    self.updateNodesShowingLabels();
  };

  self.showAllLabels = () => {
    document.getElementById("showAll").style.display="none";
    document.getElementById("hideAll").style.display="inline";
    self.graph.forEachNode(function(node) {
      var node = self.graph.getNode(node.id);
      node.renderData.textHolder.children[0].element.override = true;
    });
    self.updateNodesShowingLabels();
  };

  self.setCanvasSize = function(size) {
    self.setBoundarySize(size);
  };

  self.setAllNodesShape = function(shape) {
    if (self.selection.length == 0) {
      self.graph.forEachNode(function(node) {
        self.setNodeShape(self.graph.getNode(node.id), shape);
      });
    } else {
      self.selection.forEach(function(node) {
        self.setNodeShape(self.graph.getNode(node.id), shape);
      });
    }
  };

  self.setAllNodesShapeWithOverride = function(shape, overrides) {
    self.graph.forEachNode(function(node) {
      if (overrides.has(node.id) && overrides.get(node.id).has('shape')) {
        self.setNodeShape(self.graph.getNode(node.id), overrides.get(node.id).get('shape'));
      } else {
        self.setNodeShape(self.graph.getNode(node.id), shape);
      }
    });
  }

  self.setNodeShape = function(node, shape) {
    if (shape == "square") {
      node.renderData.shape = shape;
      node.renderData.draw_object.geometry = self.make2x2Rect();
      node.renderData.draw_object.children[0].geometry = self.make2x2Rect();
    } else if (shape == "circle") {
      node.renderData.shape = shape;
      node.renderData.draw_object.geometry = new THREE.CircleGeometry(1, 32);
      node.renderData.draw_object.children[0].geometry = new THREE.CircleGeometry(
        1,
        32
      );
    } else if (shape == "triangle") {
      node.renderData.shape = shape;
      node.renderData.draw_object.geometry = new THREE.CircleGeometry(1, 3);
      node.renderData.draw_object.children[0].geometry = new THREE.CircleGeometry(
        1,
        3
      );
    } else if (shape == "pentagon") {
      node.renderData.shape = shape;
      node.renderData.draw_object.geometry = new THREE.CircleGeometry(1, 5);
      node.renderData.draw_object.children[0].geometry = new THREE.CircleGeometry(
        1,
        5
      );
    } else if (shape == "hexagon") {
      node.renderData.shape = shape;
      node.renderData.draw_object.geometry = new THREE.CircleGeometry(1, 6);
      node.renderData.draw_object.children[0].geometry = new THREE.CircleGeometry(
        1,
        6
      );
    } else if (shape == "octagon") {
      node.renderData.shape = shape;
      node.renderData.draw_object.geometry = new THREE.CircleGeometry(1, 8);
      node.renderData.draw_object.children[0].geometry = new THREE.CircleGeometry(
        1,
        8
      );
    }
  };

  self.getNumSelected = function() {
    if (self.selection.length == self.graph.getNodesCount()) {
      return 0;
    }
    return self.selection.length;
  };

  self.toggleDark = function() {
    self.darkMode = !self.darkMode;
    self.updateViewPortEdgeColor();
  };

  self.updateViewPortEdgeColor = function() {
    self.viewPort.material.color = new THREE.Color( self.darkMode? 0xffffff : 0x000000 );       
  }

  self.getGraph = function() {
    return self.graph;
  };

  self.getNodeList = function() {
    var nodes = [];
    self.graph.forEachNode(function(node) {
      nodes.push(node);
    });
    return nodes;
  };

  self.getPositions = function() {
    var poses = {};
    self.graph.forEachNode(function(node) {
      poses[node.id] = [node.x, node.y];
    });
    return poses;
  };

  self.getPinPositions = function() {
    var poses = {};
    self.graph.forEachNode(function(node) {
      poses[node.id] = [node.fx, node.fy];
    });
    return poses;
  };

  var alias = false;
  self.toggleAlias = () => {
    // TODO: recreate renderer with new antialias
    // self.init(alias);
    // self.display();
    alias = !alias;
  };

  self.setLastNode = id => {
    self.lastNode = self.graph.getNode(id);
  };

  self.dragLastNode = () => {
    self.selectNode(self.lastNode);
  };

  var x = 1.0;
  self.lowerRes = () => {
    x -= 0.1;
    self.renderer.setPixelRatio(x);
    self.onWindowResize();
  };

  self.toggleNeighborHighlight = function() {
    self.doHighlightNeighbors = !self.doHighlightNeighbors;
  };

  self.highlightNodeIds = function(nodeids, toggle) {
    if (nodeids.length > 0 && Array.isArray(nodeids[0])) {
      nodeids = nodeids[0];
    }
    if (self.prevHighlights) {
      for (var i = 0; i < self.prevHighlights.length; i++) {
        self.highlightNode(
          self.prevHighlights[i],
          !toggle,
          def.SEARCH_HIGHLIGHT
        );
      }
    }
    self.prevHighlights = [];
    self.graph.forEachNode(function(node) {
      if (nodeids.indexOf(node.id) != -1) {
        self.highlightNode(node, toggle, def.SEARCH_HIGHLIGHT);
        self.prevHighlights.push(node);
      }
    });
  };

  self.removeSelected = function() {
    for (var i = 0; i < self.selection.length; i++) {
      self.removeNode(self.selection[i]);
    }
    self.selection = [];
  };

  self.removeNodesByIds = function(nodeids) {
    for (var i = 0; i < nodeids.length; i++) {
      const node = self.graph.getNode(nodeids[i]);
      if (node) {
        self.removeNode(node);
      }
    }
    self.selection = [];
  };

  self.getSelected = function() {
    return self.selection;
  };

  self.getSelectedIds = function() {
    return self.selection.map(n => n.id);
  };
};
