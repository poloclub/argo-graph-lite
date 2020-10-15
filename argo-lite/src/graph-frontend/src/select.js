var def = require("./imports").default;
var THREE = def.THREE;
var Edge = def.Edge;
var Node = def.Node;
var OrbitControls = def.OrbitControls;
var d3 = def.d3;
var ee = def.ee;
var $ = require("jquery");

module.exports = function(self) {
  self.selectNode = function(node) {
    self.dragging = node;
    self.selection = [node];
    node.renderData.isSelected = true;
    self.updateSelection(self.mouseX, self.mouseY);
  };

  /**
   * Deselect nodes in selection list
   */
  self.clearSelection = function() {
    for (var i = 0; i < self.selection.length; i++) {
      self.selection[i].renderData.isSelected = false;
      if (!def.NODE_NO_HIGHLIGHT) {
        self.selection[i].renderData.draw_object.children[0].visible = false;
      } else {
        self.selection[i].renderData.draw_object.material.color.set(
          new THREE.Color(self.selection[i].renderData.color)
        );
      }
      self.selection[i].renderData.textHolder.children[0].element.hideme = true;
    }
    self.selection = [];
  };

  /**
   *  Update positions of all objects in self.selection
   *  based on diff between mouse position and self.dragging position
   */
  self.updateSelection = function(mouseX, mouseY, selection) {
    if (self.dragging) {
      var diffx = mouseX - self.dragging.x;
      var diffy = mouseY - self.dragging.y;
    }

    //'selection' only passed if a single node is double clicked
    let clickedNode = selection;
    //if not already pinned, then pin the node upon double-click
    if(clickedNode && !clickedNode.pinnedx) {
      clickedNode.pinnedx = true;
      clickedNode.pinnedy = true;
    } else if (clickedNode && clickedNode.pinnedx) {
      //if already pinned, then unpin upon double-click
      clickedNode.pinnedx = false;
      clickedNode.pinnedy = false;
    }
    
    for (var i = 0; i < self.selection.length; i++) {
      if (self.dragging) {
        self.selection[i].x += diffx;
        self.selection[i].y += diffy;
        self.selection[i].fx = self.selection[i].x;
        self.selection[i].fy = self.selection[i].y;
        //pins multiple nodes when dragging
        if(!clickedNode) {
          self.selection[i].pinnedx = true;
          self.selection[i].pinnedy = true;
        }
      }
      if (!def.NODE_NO_HIGHLIGHT) {
        self.selection[i].renderData.draw_object.children[0].visible = true;
      } else {
        self.selection[i].renderData.draw_object.material.color.set(
          new THREE.Color(self.selection[i].renderData.hcolor)
        );
      }
      self.selection[
        i
      ].renderData.textHolder.children[0].element.hideme = false;
    }
  };

  /**
   *  Find any objects within the current box selection and add it to self.selection
   */
  self.checkSelection = function(mouseX, mouseY) {
    if (!self.dragging) {
      self.mouseEnd = new THREE.Vector3(mouseX, mouseY, 0);
      if (self.mouseStart.x < self.mouseEnd.x) {
        var left = self.mouseStart;
        var right = self.mouseEnd;
      } else {
        var left = self.mouseEnd;
        var right = self.mouseStart;
      }

      self.graph.forEachNode(function(node) {
        let npos;
        if (self.options.layout == "ngraph") {
          npos = self.force.getNodePosition(node.id);
        } else if (self.options.layout == "d3") {
          npos = node;
        }
        if (self.insideBox(left, right, npos.x, npos.y)) {
          self.selection.push(node);
          //indicates nodes were in selection box 
          //when mouse is lifted
          //self.multNodesHighlighted = true;
        }
      });
    }
  };

  /**
   *  returns true if pos is in box with top left l and bottom right r
   */
  self.insideBox = function(l, r, posx, posy) {
    return (
      posx < r.x &&
      posx > l.x &&
      ((posy > r.y && posy < l.y) || (posy < r.y && posy > l.y))
    );
  };
};