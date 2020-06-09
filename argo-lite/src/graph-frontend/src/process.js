var def = require("./imports").default;
const spawn = require("threads").spawn;
var THREE = def.THREE;
var STATS = def.STATS;
var STATS_SHOW = def.STATS_SHOW;
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
  this.renderWidth = 1000;
  this.renderHeight = 1000;
  this.maxZoom = 1000;
  this.paused = false;
  this.mouseDown = false;
  this.ee = ee({});
  this.layoutInit = true;
  this.labelSize = 6;
  this.relativeFontSize = 1;
  this.mapShowing = def.MAP;
  this.mapRenderPerNumberOfFrame = def.MAP_RENDER_PER_NUMBER_OF_FRAME;
  this.darkMode = true;
  this.lastNode = null;
  this.rightClickedNode = null;
  this.doHighlightNeighbors = def.NODE_NEIGHBOR_HIGHLIGHT;
  this.prevHighlights = [];
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
  let stats = new STATS();
  this.display = function() {
    if (STATS_SHOW) {
      stats.showPanel(0); // show fps panel
      document.body.appendChild(stats.dom);
    }
    this.animate();
  };

  /**
   *  Creates loop called on every animation frame
   */
  
  let fps = 30;
  // let now;
  // let then = Date.now();
  // let interval = 1000 / fps;
  // let delta;
  this.animate = function() {
    if (STATS_SHOW) {
      stats.begin(); // Begin stats.js panel timing
    }
    
    self.controls.update();
    self.render();

    if (STATS_SHOW) {
      stats.end(); // End stats.js panel timing
    }
    
    // now = Date.now();
    // delta = now - then;
    // if (delta > interval) {
    //   then = now;
    //   self.controls.update();
    //   self.render();
    // }
    requestAnimationFrame(self.animate);
  };

  /**
   *  Set initial properties
   */
  this.init = function(aa = true) {
    self.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: aa,
      preserveDrawingBuffer: true,
    });
    self.minimapRenderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: aa,
      preserveDrawingBuffer: true,
    });
    //self.renderer.setPixelRatio(window.devicePixelRatio);
    //self.renderer.setPixelRatio(0.1);
    self.setDisplayParams();
    self.setRendererParams();

    self.setupCamera();
    self.setupMinimap();
    self.setupGeometry();
    self.setupSelect();

    // Make sure to clear children before setting up new frame.
    self.element.innerHTML = "";
    self.element.appendChild(self.renderer.domElement);
    self.element.appendChild(self.cssRenderer.domElement);
    self.element.appendChild(self.minimapRenderer.domElement);

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
    self.minimapRenderer.setSize(0.2 * self.height, 0.2 * self.height);
  };

  /**
   *  Draws graphics
   */
  var stage = 0;
  var numberOfFrameSinceMiniMapRerender = 1;
  this.render = function() {
    self.updateCamera();
    self.updateNodes();
    if (stage == 1) {
      self.updateLabels();
      self.updateEdges();
      stage = 0;
    }
    stage += 1;
    numberOfFrameSinceMiniMapRerender += 1;
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
        if (self.tickToStatic && !self.paused) {
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
    self.renderer.setViewport(0, 0, self.width, self.height);
    self.renderer.setScissor(0, 0, self.width, self.height);
    self.renderer.setScissorTest(true);
    self.renderer.render(self.scene, self.ccamera);
    self.cssRenderer.render(self.scene, self.ccamera);

    // Render MiniMap at a lower framerate.
    if (numberOfFrameSinceMiniMapRerender >= this.mapRenderPerNumberOfFrame) {
      numberOfFrameSinceMiniMapRerender = 0;

      if (self.mapShowing) {
        self.minimap.width = 0.2 * self.height;
        self.minimap.height = 0.2 * self.height;
        self.minimapRenderer.setViewport(0, 0, self.minimap.width, self.minimap.height);
        self.minimapRenderer.setScissor(0, 0, self.minimap.width, self.minimap.height);
        self.minimapRenderer.setScissorTest(true);
        self.minimapRenderer.render(self.scene, self.minimap.camera);
      }
    }
  };
};

exports.Frame = Frame;
