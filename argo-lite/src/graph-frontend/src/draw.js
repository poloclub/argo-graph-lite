var def = require("./imports").default;
var THREE = def.THREE;
var Edge = def.Edge;
var Node = def.Node;
var OrbitControls = def.OrbitControls;
var d3 = def.d3;
var ee = def.ee;


module.exports = function(self) {
  /**
   *  Create highlight mesh
   */
  self.createHighlightMesh = function(node, texture) {
    var shape =
      node.renderData.hshape || node.renderData.shape || def.NODE_HSHAPE;
    if (shape == "square") {
      var hgeometry = self.make2x2Rect();
    } else {
      var hgeometry = new THREE.CircleGeometry(1, 32);
    }

    return self.createHighlightDrawObject(hgeometry, node, texture);
  };

  /**
   * Sets the material, color, visibility, and size of the highlight drawing for a node.
   */
  self.createHighlightDrawObject = function(hgeometry, node, texture) {
    var size = self.getNodeSize(node);
    var hsize = def.HIGHLIGHT_SIZE;

    texture = def.NODE_NO_HTEX ? null : texture;
    var color = def.NODE_NO_HCOLOR
      ? null
      : parseInt(node.renderData.hcolor || def.NODE_HIGHLIGHT);
    var hmaterial = new THREE.MeshBasicMaterial({ color: color, map: texture });
    hmaterial.transparent = true;
    var highlight = new THREE.Mesh(hgeometry, hmaterial);
    highlight.visible = true;
    highlight.scale.set(1 + hsize / size, 1 + hsize / size, 1);
    highlight.position.z = -0.01;
    return highlight;
  };

  /**
   *  Create node mesh
   */
  self.createNodeMesh = function(node, texture) {
    var shape = node.renderData.shape || def.NODE_SHAPE;
    if (shape == "square") {
      var geometry = self.make2x2Rect();
    } else {
      var geometry = new THREE.CircleGeometry(1, 32);
    }
    return self.createNodeDrawObject(geometry, node, texture);
  };

  /**
   * Create mesh to visual show pinning
   */
  self.createPinMesh = function(size) {
    var geometry = self.make2x2Rect();
    var color = new THREE.Color(def.PIN_COLOR);
    var material = new THREE.MeshBasicMaterial({ color: color });
    var pinMesh = new THREE.Mesh(geometry, material);
    pinMesh.scale.set(0.1, 0.1, 1);
    pinMesh.position.z = 0.01;
    pinMesh.visible = false;
    return pinMesh;
  };

  /**
   * Create the drawing information for a node
   */
  self.createNodeDrawObject = function(geometry, node, texture) {
    var size = self.getNodeSize(node);

    texture = def.NODE_NO_TEX ? null : texture;
    var color = def.NODE_NO_COLOR
      ? null
      : new THREE.Color(node.renderData.color || def.NODE_COLOR);
    var material = new THREE.MeshBasicMaterial({ color: color, map: texture });
    material.transparent = true;
    var draw_object = new THREE.Mesh(geometry, material);
    draw_object.scale.set(size, size, 1);
    return draw_object;
  };

  /**
   * Get the size of a node if it exists, otherwise get it from the render data.
   */
  self.getNodeSize = function(node) {
    var size;
    if (node.renderData.size != undefined) size = node.renderData.size;
    else size = node.renderData["size"];
    return size;
  };

  self.createNodeLabel = function(node) {
    var material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: true,
      wireframeLinewidth: 1,
      side: THREE.DoubleSide
    });
    var geometry = new THREE.PlaneGeometry(1000, 200);
    var textMesh = self.createAndSetupLabelTextMesh(geometry, material);
    var label = self.createAndSetupLabelDiv(node, textMesh);
    var textHolder = self.createAndSetupTextHolder(label, textMesh);
    node.renderData.textHolder = textHolder;
    self.scene.add(textHolder);
  };

  self.createAndSetupLabelTextMesh = function(geometry, material) {
    var textMesh = new THREE.Mesh(geometry, material);
    textMesh.scale.set(def.TEXT_SIZE, def.TEXT_SIZE, 1);
    var bbox = new THREE.Box3().setFromObject(textMesh);
    textMesh.position.x += (bbox.max.x - bbox.min.x) * def.TEXT_X_OFFSET;
    textMesh.position.y -= (bbox.max.y - bbox.min.y) * def.TEXT_Y_OFFSET;
    textMesh.visible = def.TEXT_WIREFRAME;
    return textMesh;
  };

  self.createAndSetupLabelDiv = function(node, textMesh) {
    var label = self.createLabelDiv(node);
    label.element.hidden = true;
    label.position.copy(textMesh.position);
    label.scale.copy(textMesh.scale);
    return label;
  };

  self.createAndSetupTextHolder = function(label, textMesh) {
    var textHolder = new THREE.Object3D();
    textHolder.add(label);
    textHolder.add(textMesh);
    return textHolder;
  };

  /**
   *  Create label div
   */
  self.createLabelDiv = function(node) {
    // Create canvas to draw text label onto sprite image
    var element = self.createLabelDivElement();
    var content = document.createTextNode(node.renderData.label);
    var textElement = self.createLabelTextElement();
    textElement.appendChild(content);
    element.appendChild(textElement);
    var labelObj = new THREE.CSS3DObject(element);
    return labelObj;
  };

  /**
   * Creates the Label Div Element for a node's label
   */
  self.createLabelDivElement = function() {
    var element = document.createElement("div");
    element.style.width = "1000px";
    element.style.height = "200px";
    element.style.backgroundColor = def.TEXT_BACK_COLOR;
    element.style.opacity = def.TEXT_OPACITY;
    return element;
  };

  /**
   * Creates the text element to add to the label div for a node.
   */
  self.createLabelTextElement = function() {
    var textElement = document.createElement("div");
    textElement.style.width = "1000px";
    textElement.style.height = "2ch";
    textElement.style.fontSize = "96px";
    textElement.style.textOverflow = "ellipsis";
    textElement.style.overflow = "hidden";
    textElement.style.userSelect = "all";
    textElement.style.whiteSpace = "nowrap";
    //textElement.setAttribute('contenteditable', 'true');
    return textElement;
  };

  /**
   * Instantiates, sets highlight for, and sets position for the actual THREE
   * drawing of a node
   */
  self.setupNodeDrawObject = function(node, htexture, texture) {
    var draw_object = self.createNodeMesh(node, texture);

    // Create highlight
    if (!def.NODE_NO_HIGHLIGHT) {
      var highlight = self.createHighlightMesh(node, htexture);
      draw_object.add(highlight);
    }

    var pinMesh = self.createPinMesh();
    draw_object.add(pinMesh);

    draw_object.position.x = node.renderData.x;
    draw_object.position.y = node.renderData.y;
    draw_object.index = node.id;
    draw_object.name = node.id;
    node.renderData.draw_object = draw_object;

    return draw_object;
  };

  /**
   *  Create a node object and add it to the scene.
   */
  self.drawNode = function(node) {
    function onHTextureLoad(node, htexture) {
      // Load node texture
      self.textureLoader.load(
        node.renderData.image || def.NODE_TEXTURE,
        onTextureLoad.bind(null, node, htexture)
      );
    }

    function onTextureLoad(node, htexture, texture) {
      // Create mesh for node
      var draw_object = self.setupNodeDrawObject(node, htexture, texture);

      // Create div for label
      self.createNodeLabel(node);

      self.nodeCount += 1;
      self.nodes.add(draw_object);
    }

    if (def.NODE_NO_HTEX && def.NODE_NO_TEX) {
      onTextureLoad(node, null, null);
    } else {
      // Load highlight texture
      self.textureLoader.load(
        node.renderData.himage || def.NODE_HTEXTURE,
        onHTextureLoad.bind(null, node)
      );
    }
  };

  /**
   *  Create an edge and add it to the lineSegments.
   */
  self.drawEdge = function(source, target, visible = true) {
    if (
      source.renderData.draw_object === undefined ||
      target.renderData.draw_object === undefined
    ) {
      setTimeout(self.drawEdge.bind(null, source, target), 50);
      return;
    }
    var index = self.drawCount * 3;
    self.lineObjects[index / 3] = source;
    self.lineObjects[index / 3 + 1] = target;
    if (!source.linkObjs) {
      source.linkObjs = [];
    }
    if (!target.linkObjs) {
      target.linkObjs = [];
    }

    self.lineIndices.push({
      source: source,
      target: target,
      hide: !visible,
      linecolor: source.renderData.linecolor, 
    });

    source.linkObjs.push(self.lineIndices[index / 6]);
    target.linkObjs.push(self.lineIndices[index / 6]);
    self.updateColorsAndPositions(source, target, index);
    self.drawCount += 2;
  };

  /**
   * Update the colors and positions of the edges between source and target
   */
  self.updateColorsAndPositions = function(source, target, index) {
    var positions = self.edges.attributes.position.array;
    var colors = self.edges.attributes.color.array;

    var v1pos = source.renderData.draw_object.position;
    var v2pos = target.renderData.draw_object.position;
    var v1color = self.lineIndices[index / 6].linecolor;
    var v2color = self.lineIndices[index / 6].linecolor;
    colors[index] = v1color.b;
    positions[index++] = v1pos.x;
    colors[index] = v1color.g;
    positions[index++] = v1pos.y;
    colors[index] = v1color.r;
    positions[index++] = v1pos.z - 0.02;
    colors[index] = v2color.b;
    positions[index++] = v2pos.x;
    colors[index] = v2color.g;
    positions[index++] = v2pos.y;
    colors[index] = v2color.r;
    positions[index++] = v2pos.z - 0.02;
  };
};
