# Argo Lite Quick Start Guide

This is a quick start guide introducing the basic features of Argo Lite. Let's begin by launching Argo Lite in your browser!

[Launch Argo Lite](https://poloclub.github.io/argo-graph-lite/)

For the purpose of this quick start, we will be working with built-in sample graph - the [Les Miserables](https://en.wikipedia.org/wiki/Les_Mis%C3%A9rables) Character Relationship graph, derived from [The Stanford GraphBase by Donald E. Knuth](https://www-cs-faculty.stanford.edu/~knuth/sgb.html).

If you have launched Argo Lite with the above link, this sample graph will automatically be displayed. If you have launched Argo with another graph, you can navigate to this graph by selecting `Graph -> Samples -> Les Miserables` in the top menu.

If you are on a device with small screen and cannot see the top menu, you can click the expand button to bring up the full Argo Lite UI.

## Basic navigation

Whether you are on mouse/keyboard or a touchscreen device, you can learn the basic navigation using the `Help button` on the top right corner of the app. This will help you learn how to pan, zoom and select nodes.

## Interactive Visualization

Let's begin by playing around this small sample!

### Force-directed Layout

Once you have launched the graph, you will see a play/pause button on the top menu bar. This is for interactive force-directed layout, which helps to position your nodes.

![Argo Lite visualization with force directed layout](img/video-layout.gif)

### Graph Options Panel

Argo Lite gives a default visualization by coloring and sizing the nodes based on their [PageRank](https://en.wikipedia.org/wiki/PageRank) or [degree](https://en.wikipedia.org/wiki/Degree_(graph_theory)) values. You can update these settings using the panel on the left (when you are not selecting any node).

![Argo Lite visualization graph options](img/video-graph-options.gif)

### Override Individual Nodes

If you select a node, you will see the graph options panel changed into override mode. You can override the global settings by giving these selected nodes a different look!

![Argo Lite override options](img/video-override.gif)

### Pinning and Unpinning

If you want to fix the positions of certain nodes when other nodes are running force-directed layout, you can select a node or a group of nodes and use the pin button on the selection menu that pops up. (By default, if you select a node and drag it to a new position, it will already be pinned).

To unpin, just select them again and click the unpin button.

## Saving and Sharing

### Graph Snapshots

Argo saves your visualization and exploration progress into *snapshots*. A snapshot includes the full graph data as well as the current visualization settings. You can capture a snapshot using the `Graph -> Save Snapshot` for saving locally, or `Graph -> Publish and Share Snapshot` for saving your snapshot to a URL/link.

### Sharing as links/URLs

Now try `Graph -> Publish and Share Snapshot`.

By sharing your graph with a link, anyone can load the graph through the link later. It's a great tool for sharing and collaboration.

![Argo Lite sharing graph as link](img/video-share.gif)


### Sharing as embedded widgets

On the same screen where you get your sharable URL, you can also copy the iframe code for embedding the snapshot. Argo Lite allows you to embed any snapshot URL in iframes. This is perfect for publishing your graph on online articles, blog posts or interactive notebooks (such as a Jupyter Notebook).

![Argo Lite embedded widget mode](img/img-embedded.png)

### About Sharing Service

We provide a public sharing service for public datasets. If you want to establish your own sharing server for private or proprietary datasets, refer to [the deployment guide](deploy.md) to easily set up your own sharing service!

## Next Steps

Congratulations for completing the Quick Start! Argo Lite has many other awesome features to explore.

If you want to learn about importing your own data, or how to incrementally explore a larger graph, please head to [the tutorial](tutorial.md).