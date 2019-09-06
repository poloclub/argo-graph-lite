var Frame = require("./src/process").Frame;

exports.Frame = Frame;

var graph = require("ngraph.generators").balancedBinTree(5);

exports.graph = graph;

if (window) {
  window.Argo = exports;
}
