var def = require("./imports").default;
var THREE = def.THREE;
var Edge = def.Edge;
var Node = def.Node;
var OrbitControls = def.OrbitControls;
var d3 = def.d3;
var ee = def.ee;

module.exports = function(self) {
  /**
   * Set all nodes to a size
   */
  self.setUniformNodeSize = function(s) {
    self.graph.forEachNode(function(node) {
      node.renderData.draw_object.scale.set(s, s, 1);
      var hsize = 1 + def.HIGHLIGHT_SIZE / s;
      node.renderData.draw_object.children[0].scale.set(hsize, hsize, 1);
    });
  };

  /**
   * Set all nodes to a size based on a value in the node's data
   */
  self.setNodeDataSize = function(dataValue) {
    self.graph.forEachNode(function(node) {
      dataVal = node.renderData[dataValue];
      if (!dataVal) {
        console.log("Data value does not exist");
      } else {
        dataVal = Math.log(dataVal + 1);
        node.renderData.draw_object.scale.set(dataVal, dataVal, 1);
        var hsize = 1 + def.HIGHLIGHT_SIZE / dataVal;
        node.renderData.draw_object.children[0].scale.set(hsize, hsize, 1);
      }
    });
  };

  /**
   * Set all nodes to a color
   */
  self.setUniformNodeColor = function(hsvDegree) {
    self.graph.forEachNode(function(node) {
      node.renderData.draw_object.material.color.set(
        new THREE.Color("hsl(" + hsvDegree + ", 100%, 43%)")
      );
      if (!def.NODE_NO_HIGHLIGHT) {
        node.renderData.draw_object.children[0].material.color.set(
          new THREE.Color("hsl(" + hsvDegree + ", 100%, 63%)")
        );
      }
    });
  };

  /**
   * Set all nodes to a color based on a value in the node's data
   */
  self.setNodeDataColor = function(dataValue) {
    var i = 0;
    values = [];
    min = null;
    max = null;

    self.graph.forEachNode(function(node) {
      if ((dataVal = node.renderData[dataValue])) {
        if (min == null) min = dataVal;
        if (max == null) max = dataVal;
        if (dataVal < min) min = dataVal;
        else if (dataVal > max) max = dataVal;
        values[i] = dataVal;
        i += 1;
      } else {
        values[i] = -1;
      }
    });

    i = 0;
    self.graph.forEachNode(function(node) {
      var hsvDegree;
      if (values[i] == -1) {
        hsvDegree = 0;
      } else {
        values[i] = (values[i] - min) / (max - min);
        hsvDegree = values[i] * 120;
      }
      node.renderData.draw_object.material.color.set(
        new THREE.Color("hsl(" + hsvDegree + ", 100%, 48%)")
      );
      if (!def.NODE_NO_HIGHLIGHT) {
        node.renderData.draw_object.children[0].material.color.set(
          new THREE.Color("hsl(" + hsvDegree + ", 100%, 63%)")
        );
      }
      i++;
    });
  };

  /**
   * Map a node attribute based on some mapping function
   */
  self.mapNodeAttributes = function(mapping, nodes = null) {
    let val;
    if (mapping[0] == "degree") {
      val = node => (node.links ? node.links.length + 2 : 2);
    } else if (mapping[0] == "scalex") {
      val = node => node.renderData.draw_object.scale.x;
    } else {
      val = node => mapping[0];
    }

    let mod;
    if (mapping[1] == "volume") {
      mod = val => self.volToRadius(val);
    } else if (mapping[1] == "mult") {
      mod = val => val * mapping[3](val);
    } else if (mapping[1] == "add") {
      mod = val => val + mapping[3](val);
    } else if (mapping[1] == "log") {
      mod = val => Math.log(val);
    } else {
      mod = val => val;
    }

    let attr;
    if (mapping[2] == "scalexy") {
      attr = (node, val) => {
        node.renderData.draw_object.scale.set(val, val, 1);
        var hsize = 1 + def.HIGHLIGHT_SIZE / val;
        node.renderData.draw_object.children[0].scale.set(hsize, hsize, 1);
      };
    } else if (mapping[2] == "edgeColorRed") {
      attr = (node, val) => {
        node.renderData.linecolor.r = 1;
        node.renderData.linecolor.b = 1 - val / 5;
        node.renderData.linecolor.g = 1 - val / 5;
      };
    } else if (mapping[2] == "edgeColorBlue") {
      attr = (node, val) => {
        node.renderData.linecolor.b = 1;
        node.renderData.linecolor.r = 1 - val / 5;
        node.renderData.linecolor.g = 1 - val / 5;
      };
    } else if (mapping[2] == "edgeColorGreen") {
      attr = (node, val) => {
        node.renderData.linecolor.g = 1;
        node.renderData.linecolor.b = 1 - val / 5;
        node.renderData.linecolor.r = 1 - val / 5;
      };
    } else if (mapping[2] == "nodeColorBlue") {
      attr = (node, val) => {
        node.renderData.draw_object.material.color.b = 1;
        node.renderData.draw_object.material.color.r = 1 - val / 5;
        node.renderData.draw_object.material.color.g = 1 - val / 5;
      };
    } else if (mapping[2] == "pinned") {
      attr = (node, val) => {
        node.pinnedx = val;
        node.pinnedy = val;
      };
    } else if (mapping[2] == "labelSize") {
      attr = (node, val) => {
        self.changeLabelFontSize(node, val);
      };
    } else if (mapping[2] == "labelLength") {
      attr = (node, val) => {
        self.changeLabelLength(node, val);
      };
    }

    self.changeNodes(val, mod, attr, nodes);
  };

  /**
   *  get attribute from node using function val
   *  modify result with function mode
   *  set node attribute with attr
   */
  self.changeNode = function(val, mod, attr, node) {
    var v = val(node);
    if (v != undefined) {
      var r = mod(v);
      if (r != undefined) {
        attr(node, r);
      }
    }
  };

  /**
   *  perform changeNode on many nodes
   */
  self.changeNodes = function(val, mod, attr, nodes = null) {
    if (nodes == null) {
      self.graph.forEachNode(function(node) {
        self.changeNode(val, mod, attr, node);
      });
    } else {
      for (var i = 0; i < nodes.length; i++) {
        self.changeNode(val, mod, attr, nodes[i]);
      }
    }
  };

  /**
   * Limit label size by (estimated) characters
   * This is only accurate if the label is monospaced
   */
  self.changeLabelLength = function(node, numChars) {
    node.renderData.textHolder.children[0].element.children[0].style.width =
      numChars.toString() + "ch";
  };

  /**
   * Limit label size by (estimated) characters
   * This is only accurate if the label is monospaced
   */
  self.changeLabelFontSize = function(node, size, relativeSize = 1) {
    size = size * relativeSize;
    node.renderData.textHolder.children[0].element.children[0].style.fontSize =
      size.toString() + "rem";
  };

  /**
   * Change boundary size
   */
  self.setBoundarySize = function(size) {
    self.renderWidth = size;
    self.renderHeight = size;
    self.boundaries.scale.set(size * 2, size * 2, 1);
    self.boundaries.position.x = -size;
    self.boundaries.position.y = -size;
    self.controls.maxDistance = size * 2;
  };

  /**
   * Change viewport size
   */
  self.setViewPortSize = function(camera) {
    var distance = self.ccamera.position.z;
    var height =
      Math.tan(((camera.fov * Math.PI) / 180) * 0.5) * distance * 2 + 5;
    var width = height * camera.aspect + 5;
    self.viewPort.scale.set(width, height, 1);
    self.viewPort.position.x = camera.position.x - width / 2;
    self.viewPort.position.y = camera.position.y - height / 2;
  };
};