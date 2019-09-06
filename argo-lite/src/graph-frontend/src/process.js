var def = require("./imports").default;
const spawn = require("threads").spawn;
var THREE = def.THREE;
var Edge = def.Edge;
var Node = def.Node;
var OrbitControls = def.OrbitControls;
var d3 = def.d3;
var ee = def.ee;

var Frame = function(graph, options) {
  // Needed to reference "this" in functions
  var self = this;

  // Options
  this.inGraph = graph;
  this.options = options || {
    layout: def.LAYOUT
  };
  this.layout_options = this.options.graphLayout || {};

  this.lineObjects = [];
  this.lineIndices = [];
  this.MAX_LINES = 100000;
  this.textureLoader = new THREE.TextureLoader();
  this.textureLoader.crossOrigin = true;
  this.oldIntersect = -1;
  this.selection = [];
  this.fov = 60;
  this.near = 1;
  this.far = 5000;
  this.mouseStart = new THREE.Vector3(0, 0, 0);
  this.mouseEnd = new THREE.Vector3(0, 0, 0);
  this.dragging = null;
  this.showBox = false;
  this.renderWidth = 500;
  this.renderHeight = 500;
  this.maxZoom = 1000;
  this.paused = false;
  this.mouseDown = false;
  this.ee = ee({});
  this.layoutInit = true;
  this.labelSize = 6;
  this.relativeFontSize = 1;
  this.mapShowing = def.MAP;
  this.darkMode = false;
  this.lastNode = null;
  this.fakeNodes = [];
  this.rightClickedNode = null;
  this.doHighlightNeighbors = def.NODE_NEIGHBOR_HIGHLIGHT;
  this.prevHighlights = [];
  this.neighborHost = null;
  this.hull = null;

  require("./utils/utils")(this);
  require("./setup")(this);
  require("./addremove")(this);
  require("./highlighting")(this);
  require("./select")(this);
  require("./mouse")(this);
  require("./modify")(this);
  require("./draw")(this);
  require("./api")(this);
  require("./update")(this);

  /**
   *  Starting point, run once to create scene
   */
  this.display = function() {
    this.animate();
  };

  /**
   *  Creates loop called on every animation frame
   */
  let fps = 30;
  let now;
  let then = Date.now();
  let interval = 1000 / fps;
  let delta;
  this.animate = function() {
    requestAnimationFrame(self.animate);

    now = Date.now();
    delta = now - then;
    if (delta > interval) {
      then = now;
      self.controls.update();
      self.render();
    }
  };

  /**
   *  Set initial properties
   */
  this.init = function(aa = true) {
    self.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: aa
    });
    //self.renderer.setPixelRatio(window.devicePixelRatio);
    //self.renderer.setPixelRatio(0.1);
    self.setDisplayParams();
    self.setRendererParams();

    self.setupCamera();
    self.setupMinimap();
    self.setupGeometry();
    self.setupSelect();

    self.element.appendChild(self.renderer.domElement);
    self.element.appendChild(self.cssRenderer.domElement);

    self.canvas = document.querySelector("graph-container");

    self.setupLayout();

    self.setupGraph();

    window.addEventListener(
      "resize",
      function(e) {
        e.preventDefault();
        self.onWindowResize();
      },
      false
    );
  };

  /**
   * Change camera on window resize
   */
  self.onWindowResize = function() {
    self.clientRect = self.element.getBoundingClientRect();
    self.width = self.clientRect.width;
    self.height = self.clientRect.height;
    self.minimap.width = 0.2 * self.height;
    self.minimap.height = 0.2 * self.height;
    self.aspect = self.width / self.height;
    self.ccamera.aspect = self.aspect;
    self.ccamera.updateProjectionMatrix();

    self.renderer.setSize(self.width, self.height);
    self.cssRenderer.setSize(self.width, self.height);
  };

  /**
   *  Draws graphics
   */
  var stage = 0;
  this.render = function() {
    self.updateCamera();
    self.updateNodes();
    if (stage == 1) {
      self.updateLabels();
      self.updateEdges();
      stage = 0;
    }
    stage += 1;
    if (self.options.layout == "d3") {
      if (self.layoutInit == true) {
        var nodes = [];
        self.graph.forEachNode(function(node) {
          nodes.push(node);
        });
        self.force.nodes(nodes);
        self.force.force("link", d3.forceLink(self.lineIndices));
        self.force.restart();
        self.force.stop();
        if (self.tickToStatic) {
          // We don't tick and pause for now
          for (
            var i = 0,
              n = Math.ceil(
                Math.log(self.force.alphaMin()) /
                  Math.log(1 - self.force.alphaDecay())
              );
            i < n;
            ++i
          ) {
            self.force.tick();
          }
          //self.pauseLayout();
        }
        self.layoutInit = false;
      }
    }
    self.renderer.setViewport(0, 0, 1 * self.width, 1 * self.height);
    self.renderer.setScissor(0, 0, 1 * self.width, 1 * self.height);
    self.renderer.setScissorTest(true);
    self.renderer.render(self.scene, self.ccamera);
    self.cssRenderer.render(self.scene, self.ccamera);
    if (self.mapShowing) {
      self.minimap.width = 0.2 * self.height;
      self.minimap.height = 0.2 * self.height;
      self.renderer.setViewport(0, 0, self.minimap.width, self.minimap.height);
      self.renderer.setScissor(0, 0, self.minimap.width, self.minimap.height);
      self.renderer.setScissorTest(true);
      self.renderer.render(self.scene, self.minimap.camera);
    }
  };
};

exports.Frame = Frame;
