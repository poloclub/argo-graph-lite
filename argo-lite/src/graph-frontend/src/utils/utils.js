var def = require("../imports").default;
var appState = require("../../../stores").default;
var THREE = def.THREE;
var Edge = def.Edge;
var Node = def.Node;
var OrbitControls = def.OrbitControls;
var d3 = def.d3;
var ee = def.ee;

module.exports = function(self) {
  /**
   * Calculates coordinates of mouse on canvas adjusted for padding
   * @param {*} event
   * @param {*} currentElement
   */
  self.relMouseCoords = function(pageX, pageY, currentElement) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;

    do {
      totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
      totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    } while ((currentElement = currentElement.offsetParent));

    canvasX = pageX - totalOffsetX;
    canvasY = pageY - totalOffsetY;

    return { x: canvasX, y: canvasY };
  };

  /**
   * Add metadata to node
   * @param {*} node
   */
  self.prepNode = function(node) {
    let nodeToAdd = node;
    if (!node.data) {
      node.data = {};
    }

    let hexToRGB = (hex) => {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? 
      new THREE.Color(appState.graph.edges.color)
      : null;
  }
    nodeToAdd.renderData = {
      label: node.data.label || "No Label",
      color: node.data.color || def.NODE_COLOR,
      hcolor: node.data.hcolor || def.NODE_HIGHLIGHT,
      shape: node.data.shape || def.NODE_SHAPE,
      linecolor:  hexToRGB(appState.graph.edges.color),
      numYeast: Math.ceil(Math.random() * 8),
      size: node.data.size,
      tsize: node.data.tsize || def.TEXT_SIZE,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0
    };
    return nodeToAdd;
  };

  /**
   * Creates a generic rectangle shape to use for selection and boundaries
   */
  self.make1x1Rect = function() {
    var rectShape = new THREE.Shape();
    rectShape.moveTo(0, 0);
    rectShape.lineTo(0, 1);
    rectShape.lineTo(1, 1);
    rectShape.lineTo(1, 0);
    rectShape.lineTo(0, 0);
    rectShape.lineTo(0, 1);
    return new THREE.ShapeGeometry(rectShape);
  };

  /**
   * Creates a centered 2x2 Rectangle
   */
  self.make2x2Rect = function() {
    var rectShape = new THREE.Shape();
    rectShape.moveTo(-1, -1);
    rectShape.lineTo(-1, 1);
    rectShape.lineTo(1, 1);
    rectShape.lineTo(1, -1);
    rectShape.lineTo(-1, -1);
    return new THREE.ShapeGeometry(rectShape);
  };

  /**
   *  find radius of circle given the volume
   * @param {*} volume
   */
  self.volToRadius = function(volume) {
    return Math.pow((volume / Math.PI) * (3.0 / 4.0), 1.0 / 3.0);
  };
};
