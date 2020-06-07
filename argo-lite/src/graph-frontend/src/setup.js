var def = require("./imports").default;
var THREE = def.THREE;
var Edge = def.Edge;
var Node = def.Node;
var OrbitControls = def.OrbitControls;
var d3 = def.d3;
var ee = def.ee;

module.exports = function(self) {
  /**
   * Creates or converts ngraph or d3 graph
   */
  self.setupGraph = function() {
    var createNGraph = require("ngraph.graph");
    self.graph = createNGraph();
    if (self.inGraph) {
      self.updateGraph(self.inGraph);
    }
  };

  /**
   *  Create layout using d3
   */
  self.setupLayout = function() {
    if (self.options.layout == "ngraph") {
      self.setupNgraphLayout();
    } else if (self.options.layout == "d3") {
      self.setupD3Layout();
    }
  };

  /**
   * Set graph layout to ngraph
   */
  self.setupNgraphLayout = function() {
    self.force = require("ngraph.forcelayout")(self.graph);
  };

  /**
   * Set graph layout to D3 Force Directed and set decay parameters
   */
  self.setupD3Layout = function() {
    self.force = d3
      .forceSimulation()
      .force("charge", d3.forceManyBody().strength(-1))
      .force("link", d3.forceLink())
      .force("y", d3.forceY(0).strength(0.001))
      .force("x", d3.forceX(0).strength(0.001))
      .stop();

    // set alpha decay to be lower than the default 0.0228
    // so force layout does not prematurely stop
    self.force.alphaDecay(0.005);

    // set velocity decay to be lower than the default 0.4
    // so nodes move to their final locations
    self.force.velocityDecay(0.1);
  };

  self.setDisplayParams = function() {
    self.element = document.getElementById("graph-container");
    self.clientRect = self.element.getBoundingClientRect();
    self.width = self.clientRect.width;
    self.height = self.clientRect.height;
    self.aspect = self.width / self.height;
    self.resolution = new THREE.Vector2(self.width, self.height);
  };

  self.setRendererParams = function() {
    self.renderer.setSize(self.width, self.height);
    self.cssRenderer = new THREE.CSS3DRenderer();
    self.cssRenderer.setSize(self.width, self.height);
    self.cssRenderer.domElement.style.position = "absolute";
    self.cssRenderer.domElement.style.top = 0;
    self.minimapRenderer.domElement.style.position = "absolute";
    self.minimapRenderer.domElement.style.bottom = 0;
    self.minimapRenderer.domElement.style.left = 0;
    self.minimapRenderer.setSize(0.2 * self.height, 0.2 * self.height);
    self.minimapRenderer.zIndex = 1000;
    self.renderer.setPixelRatio(window.devicePixelRatio);
  };

  /**
   *  Create initial camera and parameters
   */
  self.setupCamera = function() {
    self.ccamera = new THREE.PerspectiveCamera(
      self.fov,
      self.width / self.height,
      self.near,
      self.far
    );
    self.ccamera.position.z = 200;
    var controls = new OrbitControls(self.ccamera, self.element);
    controls.spacePan = true; // Space bar panning
    controls.bothPan = true; // Space bar and right click panning
    controls.minDistance = 10;
    controls.maxDistance = self.renderWidth * 2;
    controls.target.set(0, 0, 0);
    controls.enableRotate = false;
    self.controls = controls;
  };

  /**
   *  Create minimap
   */
  self.setupMinimap = function() {
    self.minimap = {};
    self.minimap.camera = new THREE.PerspectiveCamera(
      self.fov,
      1,
      self.near,
      self.far
    );
    self.minimap.camera.position.z = self.renderWidth * 2;

    (self.oldCoords = {
      x: null,
      y: null,
      z: null
    }),
      /**
       * Pan the ccamera according to mouse position on screen (should be called only when mouse is on minimap)
       * @param coordX mouse position on screen returned by relMouseCoords
       * @param coordY mouse position on screen returned by relMouseCoords
       */
      (self.minimap.panToMousePosition = function(coordX, coordY) {
        // ensures that the camera position is updated from the last pan.
        if (
          self.ccamera.position.x == self.oldCoords.x &&
          self.ccamera.position.y == self.oldCoords.y &&
          self.ccamera.position.z == self.oldCoords.z
        ) {
          return;
        }

        self.oldCoords.x = self.ccamera.position.x;
        self.oldCoords.y = self.ccamera.position.y;
        self.oldCoords.z = self.ccamera.position.z;

        // 850 is an approximation
        const coefficient = (self.height - 200) / self.ccamera.position.z;

        self.controls.pan(
          ((coordX / self.minimap.width) * 4000 -
            2000 -
            self.ccamera.position.x) *
            -coefficient,
          (((self.height - coordY) / self.minimap.height) * 4000 -
            2000 -
            self.ccamera.position.y) *
            coefficient
        );
      });
  };

  /**
   *  Create initial scene geometry and attributes
   */
  self.setupGeometry = function() {
    self.scene = new THREE.Scene();

    self.points = new THREE.BufferGeometry();
    self.nodes = new THREE.Group();
    self.scene.add(self.nodes);

    if (def.LINES == "fancy") {
      self.setupFancyEdges();
    } else {
      self.setUpSimpleEdges();
    }

    var rect = self.make1x1Rect();

    self.setupSelectionBox(rect);
    self.setupBoundaries(rect);
    self.setupViewPort(rect);
  };

  /**
   * Setup data structures for fancy edges
   */
  self.setupFancyEdges = function() {
    self.edges = [];
    self.edgeCount = 0;
  };

  /**
   * Sets up data structures for simple edges
   */
  self.setUpSimpleEdges = function() {
    self.edges = new THREE.BufferGeometry();
    var material = new THREE.LineBasicMaterial({
      linewidth: 2,
      color: 0xffffff,
      vertexColors: THREE.VertexColors,
      shading: THREE.FlatShading
    });
    self.line = new THREE.LineSegments(self.edges, material);
    self.line.frustumCulled = false;
    self.scene.add(self.line);

    var positions = new THREE.BufferAttribute(
      new Float32Array(self.MAX_LINES * 3),
      3
    );
    var colors = new THREE.BufferAttribute(
      new Float32Array(self.MAX_LINES * 3),
      3
    );

    self.edges.addAttribute("position", positions);
    self.edges.addAttribute("color", colors);
    self.drawCount = 0;
  };

  /**
   * Adds box to screen that is displayed when selecting groups of nodes
   */
  self.setupSelectionBox = function(rect) {
    self.selectBox = new THREE.Line(
      rect,
      new THREE.LineBasicMaterial({ linewidth: 3, color: 0x3399aa })
    );
    self.selectBox.visible = false;
    self.scene.add(self.selectBox);
  };

  /**
   * Sets boundaries for max edges of graph
   */
  self.setupBoundaries = function(rect) {
    self.boundaries = new THREE.Line(
      rect,
      new THREE.LineBasicMaterial({ linewidth: 3, color: 0x999999 })
    ); 
    self.scene.add(self.boundaries);
    self.setBoundarySize(self.renderWidth * 2);
  };

  /**
   * Sets viewport to match size of display
   */
  self.setupViewPort = function(rect) {
    self.viewPort = new THREE.Line(
      rect,
      new THREE.LineBasicMaterial({ linewidth: 3, color: self.darkMode? 0xffffff : 0x000000})
    );
    self.scene.add(self.viewPort);
    self.setViewPortSize(self.ccamera);
  };

  /**
   *  Creates listeners and events for selecting nodes
   */
  self.setupSelect = function() {
    self.points.addAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(20 * 3), 3)
    );
    self.points.computeBoundingSphere();
    self.nodeCount = 0;
    var mouseHandler = function(callback) {
      return function(event) {
        event.preventDefault();
        let pageX, pageY;
        if (event.touches && event.touches.length > 0) {
          // for touch events
          pageX = event.touches.item(0).pageX;
          pageY = event.touches.item(0).pageY;
        } else {
          pageX = event.pageX;
          pageY = event.pageY;
        }
        
        var coords = self.relMouseCoords(pageX, pageY, this);
        var mouseX = (coords.x / self.width) * 2 - 1;
        var mouseY = 1 - (coords.y / self.height) * 2;
        var mousePosition = new THREE.Vector3(mouseX, mouseY, 1);
        mousePosition.unproject(self.ccamera);
        var dir = mousePosition.sub(self.ccamera.position).clone();
        mousePosition.normalize();
        // Determine whether mouse is on minimap
        self.isMouseCoordinatesOnMinimap =
          coords.x <= self.minimap.width &&
          self.height - coords.y <= self.minimap.height;
        if (self.isMouseCoordinatesOnMinimap) {
          self.minimap.mouseX = coords.x;
          self.minimap.mouseY = coords.y;
        }

        // Determine intersects
        var raycaster = new THREE.Raycaster(
          self.ccamera.position,
          mousePosition
        );

        // Find real location of mouse
        var distance = -self.ccamera.position.z / dir.z;
        var pos = self.ccamera.position
          .clone()
          .add(dir.multiplyScalar(distance));

        if (callback == self.onRightClick && event.which != 3) {
          return;
        }

        if (
          callback == self.onRightClick &&
          event.target.getAttribute("contenteditable")
        ) {
          event.target.focus();
        } else {
          event.preventDefault();
          if (callback == self.onRightClick) {
            self.onRightClickCoords(event);
          }
          self.callMouseHandler(event, raycaster, pos, callback);
        }
      };
    };

    //Add listeners to web page
    self.setupMouseHandlers(mouseHandler);
  };

  /**
   * Checks if a node has been clicked, and calls the appropriate mouse handler function
   */
  self.callMouseHandler = function(event, raycaster, pos, callback) {
    var intersects = raycaster.intersectObjects(self.nodes.children);
    if (intersects.length) {
      // If a node has been clicked
      var nodeIndex = intersects[0].object.index;
      self.oldIntersect = nodeIndex;
      callback(
        self.graph.getNode(nodeIndex),
        pos.x,
        pos.y,
        event.button,
        event.ctrlKey
      );
    } else {
      callback(null, pos.x, pos.y, event.button, event.ctrlKey);
    }
  };

  /**
   * Add Mouse Event Listeners to page
   */
  self.setupMouseHandlers = function(mouseHandler) {
    self.element.addEventListener(
      "mousemove",
      mouseHandler(self.onMouseMove),
      false
    );
    self.element.addEventListener(
      "mousedown",
      mouseHandler(self.onMouseDown),
      false
    );
    self.element.addEventListener(
      "mouseup",
      mouseHandler(self.onMouseUp),
      false
    );
    self.element.addEventListener(
      "mouseup",
      mouseHandler(self.onRightClick),
      false
    );
    self.element.addEventListener(
      "touchstart",
      mouseHandler(self.onMouseDown),
      false
    );
    self.element.addEventListener(
      "touchmove",
      mouseHandler(self.onMouseMove),
      false
    );
    self.element.addEventListener(
      "touchend",
      mouseHandler(self.onMouseUp),
      false
    );
    self.element.addEventListener(
      "touchcancel",
      mouseHandler(self.onMouseUp),
      false
    );
  };
};
