/**
 * File: QuakeHeap.js
 * Authors: Charissa Plattner (chariss@cs.stanford.edu)
 *			Laura Cruz-Albrecht (TODO)
 *			Gabriel Garza (TODO)
 * =====================================================
 * This file implements the general functionality for visualizing
 * a QuakeHeap in action. It supports the following functionality:
 * - insert
 * - decreaseKey
 * - extractMin
 *
 * Note that this is a visualization library only, and its current implementation
 * does not match the amortized bounds of Quake Heaps as proposed in the initial paper by Chan.
 */

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


QuakeHeap.LINK_COLOR = "#007700";
QuakeHeap.FOREGROUND_COLOR = "#007700";
QuakeHeap.BACKGROUND_COLOR = "#EEFFEE";
QuakeHeap.INDEX_COLOR = "#0000FF";

QuakeHeap.DEGREE_OFFSET_X = -20;
QuakeHeap.DEGREE_OFFSET_Y = -20;

QuakeHeap.DELETE_LAB_X = 30;
QuakeHeap.DELETE_LAB_Y = 50;

QuakeHeap.NODE_WIDTH = 60;
QuakeHeap.NODE_HEIGHT = 70

QuakeHeap.STARTING_X = 70;

QuakeHeap.INSERT_X = 30;
QuakeHeap.INSERT_Y = 25

QuakeHeap.STARTING_Y = 100;
QuakeHeap.MAX_DEGREE = 7;
QuakeHeap.DEGREE_ARRAY_ELEM_WIDTH = 30;
QuakeHeap.DEGREE_ARRAY_ELEM_HEIGHT = 30;
QuakeHeap.DEGREE_ARRAY_START_X = 500;
QuakeHeap.INDEGREE_ARRAY_START_Y = 50;

QuakeHeap.TMP_PTR_Y = 60;

QuakeHeap.LEAF_STARTING_X = 70;
QuakeHeap.LEAF_STARTING_Y = 400; // TODO: make dynamic somehow?^

function QuakeHeap(am, w, h)
{
	this.init(am, w, h);
}

QuakeHeap.prototype = new Algorithm();
QuakeHeap.prototype.constructor = QuakeHeap;
QuakeHeap.superclass = Algorithm.prototype;


QuakeHeap.prototype.init = function(am, w, h)
{
	QuakeHeap.superclass.init.call(this, am, w, h);
	this.addControls();
	this.treeRoot = null;
	this.currentLayer = 1;
	this.animationManager.setAllLayers([0,this.currentLayer]);
	this.minID = 0;
	this.nextIndex = 1;
	this.alpha = 0.55;
}


QuakeHeap.prototype.addControls =  function()
{
	this.controls = [];
	this.blankField = addControlToAlgorithmBar("None", "");
	// this.blankField.placeholder = "Key to insert";
	this.blankField.class = 'blankClass';
	this.controls.push(this.blankField);
	// Increase key text input and button
	this.insertField = addControlToAlgorithmBar("Text", "");
	this.insertField.placeholder = "Key to insert"
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.controls.push(this.insertField);

	

	this.insertButton = addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.controls.push(this.insertButton);

	this.blankField = addControlToAlgorithmBar("None", "");
	// this.blankField.placeholder = "Key to insert";
	this.blankField.class = 'blankClass';
	this.controls.push(this.blankField);	

	// Decrease key text inputs and button
	this.decreaseKeyOldValueField = addControlToAlgorithmBar("Text", "");
	this.decreaseKeyOldValueField.placeholder = "Key to decrease";
	this.controls.push(this.decreaseKeyOldValueField);
	this.decreaseKeyNewValueField = addControlToAlgorithmBar("Text", "");
	this.decreaseKeyNewValueField.placeholder = "New key value";	
	this.controls.push(this.decreaseKeyNewValueField);
	this.decreaseKeyButton = addControlToAlgorithmBar("Button", "Decrease Key");
	this.decreaseKeyButton.onclick = this.decreaseKeyCallback.bind(this);
	this.controls.push(this.decreaseKeyButton);

	this.blankField = addControlToAlgorithmBar("None", "");
	// this.blankField.placeholder = "Key to insert";
	this.blankField.class = 'blankClass';
	this.controls.push(this.blankField);

	// Remove smallest key button
	this.removeSmallestButton = addControlToAlgorithmBar("Button", "Remove Smallest");
	this.removeSmallestButton.onclick = this.removeSmallestCallback.bind(this);
	this.controls.push(this.removeSmallestButton);

	this.blankField = addControlToAlgorithmBar("None", "");
	// this.blankField.placeholder = "Key to insert";
	this.blankField.class = 'blankClass';
	this.controls.push(this.blankField);
	// Clear entire heap button
	this.clearHeapButton = addControlToAlgorithmBar("Button", "Clear Heap");
	this.clearHeapButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearHeapButton);

	// TODO: add alpha slider
}

/********************************************************************
 * EVENT CALLBACKS													*
 ********************************************************************/

QuakeHeap.prototype.insertCallback = function(event)
{
	var insertedValue;

	insertedValue = this.normalizeNumber(this.insertField.value, 4);
	if (insertedValue != "") {
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}

QuakeHeap.prototype.decreaseKeyCallback = function(event)
{
	var oldKey = this.normalizeNumber(this.decreaseKeyOldValueField.value, 4);
	var newKey = this.normalizeNumber(this.decreaseKeyNewValueField.value, 4);

	if (oldKey != "" && newKey != "" && newKey < oldKey) {
		this.decreaseKeyOldValueField.value = "";
		this.decreaseKeyNewValueField.value = "";
		this.implementAction(this.decreaseKey.bind(this), [oldKey, newKey]);
	}
}

QuakeHeap.prototype.removeSmallestCallback = function(event)
{
	this.implementAction(this.removeSmallest.bind(this),"");
}

QuakeHeap.prototype.clearCallback = function(event)
{
	this.implementAction(this.clear.bind(this), "");
}

/********************************************************************
 * MAIN TREE FUNCTIONS	    										*
 ********************************************************************/

function BinomialNode(val, id, initialX, initialY)		
{
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.graphicID = id;
	this.degree = 0;
	this.leftChild = null;
	this.rightSib = null;
	this.parent = null;
	this.degreeID = -1;
}

QuakeHeap.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();
	
	var insertNode = new BinomialNode(insertedValue, this.nextIndex++,  QuakeHeap.INSERT_X, QuakeHeap.INSERT_Y);
	insertNode.degreeID = this.nextIndex++;
	this.cmd("CreateCircle", insertNode.graphicID, insertedValue, QuakeHeap.INSERT_X, QuakeHeap.INSERT_Y);
	this.cmd("SetForegroundColor", insertNode.graphicID, QuakeHeap.FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", insertNode.graphicID, QuakeHeap.BACKGROUND_COLOR);
	this.cmd("SetLayer", insertNode.graphicID, 1);
	this.cmd("CreateLabel", insertNode.degreeID, insertNode.degree, insertNode.x  + QuakeHeap.DEGREE_OFFSET_X, insertNode.y + QuakeHeap.DEGREE_OFFSET_Y);
	this.cmd("SetTextColor", insertNode.degreeID, "#0000FF");
	this.cmd("SetLayer", insertNode.degreeID, 2);
	this.cmd("Step");
	
	if (this.treeRoot == null) {
		this.treeRoot = insertNode;
		this.SetAllPositionsByHeight();
		this.moveTree(this.treeRoot);
		this.cmd("CreateLabel", this.minID, "Min element", this.treeRoot.x, this.treeRoot.y - QuakeHeap.NODE_HEIGHT);
		this.minElement = this.treeRoot;
		this.cmd("Connect", this.minID, 
				 this.minElement.graphicID,
				 QuakeHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
	} else {
		var  tmp;
		var prev;
		
		if (this.minElement == this.treeRoot) {
			insertNode.rightSib = this.treeRoot;
			this.treeRoot = insertNode;
			
			this.cmd("Step");
			this.SetAllPositionsByHeight();
			this.maybeUpdateMinLabel(insertNode);
			this.moveTree(this.treeRoot);
			
		} else {
			for (prev = this.treeRoot; prev.rightSib != this.minElement; prev = prev.rightSib);
			
			insertNode.rightSib = prev.rightSib;
			prev.rightSib = insertNode;
			
			this.cmd("Step");
			this.SetAllPositionsByHeight();
			this.maybeUpdateMinLabel(insertNode);
			this.moveTree(this.treeRoot);
		}
	}
	
	return this.commands;
}

QuakeHeap.prototype.decreaseKey = function(keys)
{
	this.commands = new Array();

	var oldKey = keys[0];
	var newKey = keys[1];

	for (var root = this.treeRoot; root != null; root = root.rightSib) {
		var node = this.findKey(root, oldKey);
		if (node == null) continue;
		
		// Disconnect node from parent
		var parent = node.parent;
		if (parent != null) {
			if (parent.leftChild == node) {
				parent.leftChild = node.rightSib;
			} else {
				parent.leftChild.rightSib = null;
			}
			this.cmd("Disconnect", parent.graphicID, node.graphicID);
		}

		// Traverse tree to update label for entire path
		var curr = node;
		while (curr != null) {
			curr.data = newKey;
			this.cmd("SetText", curr.graphicID, newKey);
			curr = curr.leftChild;
		}

		// Add node to treeRoot list if it wasn't already there 
		if (node != root) {
			node.parent = null;
			node.rightSib = this.treeRoot;
			this.treeRoot = node;
		}

		this.maybeUpdateMinLabel(node);
		break;
	}

	this.SetAllPositionsByHeight();
	this.moveTree(this.treeRoot);

	this.cmd("Move", this.minID, this.minElement.x, this.minElement.y  - QuakeHeap.NODE_HEIGHT);

	return this.commands;
}

QuakeHeap.prototype.removeSmallest = function(dummy)
{
	this.commands = new Array();
	
	if (this.treeRoot != null) {
		var  tmp;
		var prev;
		
		// Find the minElement in the linked list of roots and remove it from the list
		if (this.minElement == this.treeRoot) {
			this.treeRoot = this.treeRoot.rightSib;
			prev = null;
		} else {
			for (prev = this.treeRoot; prev.rightSib != this.minElement; prev = prev.rightSib);
			prev.rightSib = prev.rightSib.rightSib; // Rewire prev to skip over this.minElement
		}
		
		// Copy the node's key label and move it to the upper left corner
		var moveLabel = this.nextIndex++;
		this.cmd("SetText", this.minElement.graphicID, "");
		this.cmd("CreateLabel", moveLabel, this.minElement.data, this.minElement.x, this.minElement.y);
		this.cmd("Move", moveLabel, QuakeHeap.DELETE_LAB_X, QuakeHeap.DELETE_LAB_Y);
		this.cmd("Step");

		// Delete the current minElement
		this.cmd("Delete", this.minID);
		this.cmd("Delete", this.minElement.graphicID);
		this.cmd("Delete", this.minElement.degreeID);
		
		// Remove all nodes in the tree rooted at minElement which contain the minElement
		var leftChild = this.minElement.leftChild;
		while (leftChild != null) {
			var rightChild = leftChild.rightSib;
			if (rightChild != null) {
				rightChild.parent = null;
				rightChild.rightSib = this.treeRoot;
				this.treeRoot = rightChild;
			}
			this.cmd("Delete", leftChild.graphicID);
			this.cmd("Delete", leftChild.degreeID);
			leftChild = leftChild.leftChild;
		}

		// Link trees
		this.SetAllPositionsByHeight();
		this.moveTree(this.treeRoot);
		this.LinkAllTrees();

		this.SetAllPositionsByHeight();
		this.moveTree(this.treeRoot);

		// Find new minElement
		this.FindNewMin();

		// Remove the label
		this.cmd("Delete", moveLabel);

		this.Quake();
	}
	return this.commands;
}

QuakeHeap.prototype.clear  = function()
{
	this.commands = new Array();
	this.deleteTree(this.treeRoot);
	this.cmd("Delete", this.minID);
	this.nextIndex = 1;
	this.treeRoot = null;
	this.minElement = null;
	return this.commands;
}

QuakeHeap.prototype.reset = function()
{
	this.treeRoot = null;
	this.nextIndex = 1;
}

/********************************************************************
 * MAIN TREE HELPER FUNCTIONS	    							    *
 ********************************************************************/

QuakeHeap.prototype.findKey = function(root, key)
{
	if (root == null) return null;
	if (root.data == key) return root;

	var leftChildOption = this.findKey(root.leftChild, key);
	if (leftChildOption != null) return leftChildOption;

	if (root.leftChild != null) {
		return this.findKey(root.leftChild.rightSib, key);
	}
	return null;
}

QuakeHeap.prototype.GetNodesPerLevel = function(tree, height, nodesPerLevel)
{
	if (tree == null) return;

	if (height in nodesPerLevel) {
		nodesPerLevel[height].push(tree);
	} else {
		nodesPerLevel[height] = [tree];
	}

	this.GetNodesPerLevel(tree.leftChild, height - 1, nodesPerLevel);
	this.GetNodesPerLevel(tree.rightSib, this.height(tree.rightSib) - 1, nodesPerLevel);
}

QuakeHeap.prototype.Quake = function()
{
	var nodesPerLevel = {};
	this.GetNodesPerLevel(this.treeRoot, this.height(this.treeRoot) - 1, nodesPerLevel);
	
	var levels = Object.keys(nodesPerLevel);
	var quake_level = -1;
	for (var i = 0; i < levels.length - 1; i++) {
		if (nodesPerLevel[i + 1].length > this.alpha * nodesPerLevel[i].length) {
			quake_level = i;
			break;
		}
	}

	if (quake_level == -1) {
		return; // no need to quake!
	}

	for (var i = 0; i < 10; i++) {
		this.OffsetTreePositionsRecursive(this.treeRoot);
		this.moveTree(this.treeRoot);
		this.cmd("Step");
	}

	// Reset root list to be the nodes at quake_level
	var newTreeList = null;
	var nodes = nodesPerLevel[quake_level];
	for (var i = nodes.length - 1; i >= 0; i--) {
		var node = nodes[i];
		node.parent = null;
		node.rightSib = newTreeList;
		newTreeList = node;
	}
	for (var root = this.treeRoot; root != null; root = root.rightSib) {
		if (this.height(root) <= quake_level) {
			root.parent = null;
			root.rightSib = newTreeList;
			newTreeList = root;
		}
	}
	this.treeRoot = newTreeList;

	// TODO: add animation alert that a quake is about to happen!

	// Remove all animations above quake_level
	this.cmd("Step");
	nodes = nodesPerLevel[quake_level + 1];
	for (i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (node.leftChild != null) {
			this.cmd("Disconnect", node.graphicID, node.leftChild.graphicID);
			this.cmd("Step");

			if (node.leftChild.rightSib != null) {
				this.cmd("Disconnect", node.graphicID, node.leftChild.rightSib.graphicID);
				this.cmd("Step");
			}
		}
	}
	this.cmd("Step");
	for (var level = quake_level + 1; level < levels.length; level++) {
		nodes = nodesPerLevel[level];
		for (i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			this.cmd("Delete", node.graphicID);
			this.cmd("Delete", node.degreeID);
			this.cmd("Step");
		}
	}

	this.cmd("Step");

	this.SetAllPositionsByHeight();
	this.moveTree(this.treeRoot);

	// Reset min element
	this.cmd("Delete", this.minID);
	this.FindNewMin();
}

QuakeHeap.prototype.LinkAllTrees = function()
{
	if (this.treeRoot == null) return;

	var heightMap = {};
	var tmpRoot = this.treeRoot;
	while (tmpRoot != null) {
		var h = this.height(tmpRoot);
		if (h in heightMap) {
			heightMap[h].push(tmpRoot);
		} else {
			heightMap[h] = [tmpRoot];
		}
		tmpRoot = tmpRoot.rightSib;
	}

	// while there are trees remaining to link, link 2 trees & animate that
	while (true) {
		var didLink = this.linkTwoTrees(heightMap);
		if (!didLink) break;
	}
}

QuakeHeap.prototype.linkTwoTrees = function(heightMap)
{	
	// find min height that has > 1 tree
	var minH = 0;
	var keys = Object.keys(heightMap);
	keys.sort(); //((a, b) => a - b);

	for (var i = 0; i < keys.length; i++) {
		if (heightMap[keys[i]].length > 1) {
			minH = keys[i];
			break;
		}
	}
	if (minH == 0) return false; // didn't link any trees

	// find the two trees to link
	var root1 = heightMap[minH].shift();
	var root2 = heightMap[minH].shift();
	if (heightMap[minH].length == 0) {
		delete heightMap[minH];
	}

	// remove them both from treelist
	this.removeFromRootList(root1);
	this.removeFromRootList(root2);

	// move them to the front
	if (root1.data < root2.data) {
		root1.rightSib = root2;
		root2.rightSib = this.treeRoot;
		this.treeRoot = root1;
	} else {
		root2.rightSib = root1;
		root1.rightSib = this.treeRoot;
		this.treeRoot = root2;
	}

	this.SetAllPositionsByHeight();
	this.moveTree(this.treeRoot);
	this.cmd("Step");

	// create new min node
	var minVal = this.treeRoot.data;
	var minNode = new BinomialNode(minVal, this.nextIndex++,  QuakeHeap.INSERT_X, QuakeHeap.INSERT_Y);
	minNode.degreeID = this.nextIndex++;
	this.cmd("CreateCircle", minNode.graphicID, minVal, QuakeHeap.INSERT_X, QuakeHeap.INSERT_Y);
	this.cmd("SetForegroundColor", minNode.graphicID, QuakeHeap.FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", minNode.graphicID, QuakeHeap.BACKGROUND_COLOR);
	this.cmd("SetLayer", minNode.graphicID, 1);
	this.cmd("CreateLabel", minNode.degreeID, minNode.degree, minNode.x  + QuakeHeap.DEGREE_OFFSET_X, minNode.y + QuakeHeap.DEGREE_OFFSET_Y);
	this.cmd("SetTextColor", minNode.degreeID, "#0000FF");
	this.cmd("SetLayer", minNode.degreeID, 2);
	this.cmd("Step");

	// link the trees as children of the new node
	root1.parent = minNode;
	root2.parent = minNode;
	minNode.leftChild = this.treeRoot;

	// add new tree to roots list
	this.treeRoot = minNode;
	this.treeRoot.rightSib = this.treeRoot.leftChild.rightSib.rightSib;
	this.treeRoot.leftChild.rightSib.rightSib = null;

	this.SetAllPositionsByHeight();
	this.moveTree(this.treeRoot);
	this.cmd("Step");

	var newH = parseInt(minH) + 1;
	if (newH in heightMap) {
		heightMap[newH].push(minNode);
	} else {
		heightMap[newH] = [minNode];
	}

	this.cmd("Connect", minNode.graphicID, 
		root1.graphicID,
		QuakeHeap.FOREGROUND_COLOR,
		0, // Curve
		1, // Directed
		""); // Label

	this.cmd("Connect", minNode.graphicID, 
		 root2.graphicID,
		 QuakeHeap.FOREGROUND_COLOR,
		 0, // Curve
		 1, // Directed
		 ""); // Label

	this.cmd("Step");

	return true; // we linked 2 trees!
}

QuakeHeap.prototype.height = function(root)
{
	var height = 0;
	while (root != null) {
		height++;
		root = root.leftChild;
	}
	return height;
}

QuakeHeap.prototype.printRootlist = function()
{
	console.log("Printing rootlist: ");
	for (var root = this.treeRoot; root != null; root = root.rightSib) {
		var nodeInfo = {
			'data': root.data,
			'leftChild': (root.leftChild != null) ? root.leftChild.data : "null",
			'rightSib': (root.rightSib != null) ? root.rightSib.data : "null",
			'parent': (root.parent != null) ? root.parent.data : "null"
		};
		console.log(nodeInfo);
	}
	console.log();
}

QuakeHeap.prototype.removeFromRootList = function(root)
{
	// Find the minElement in the linked list of roots and remove it from the list
	if (root == this.treeRoot) {
		this.treeRoot = this.treeRoot.rightSib;
	} else {
		for (var prev = this.treeRoot; prev.rightSib != root; prev = prev.rightSib);
		prev.rightSib = prev.rightSib.rightSib; // Rewire prev to skip over root
	}
}

QuakeHeap.prototype.FindNewMin = function()
{
	this.minElement = null;
	for (var root = this.treeRoot; root != null; root = root.rightSib) {
		if (this.minElement == null || root.data < this.minElement.data) {
			this.minElement = root;
		}
	}

	if (this.minElement != null) {
		this.cmd("CreateLabel", this.minID, "Min element", this.minElement.x, this.minElement.y - QuakeHeap.NODE_HEIGHT);
		this.cmd("Connect", this.minID, 
			this.minElement.graphicID,
			QuakeHeap.FOREGROUND_COLOR,
			0, // Curve
			1, // Directed
			""); // Label
	}
}

QuakeHeap.prototype.maybeUpdateMinLabel = function(node)
{
	if (this.minElement.data > node.data) {
		this.cmd("Disconnect", this.minID, this.minElement.graphicID);
		this.minElement = node;
		this.cmd("Connect", this.minID, 
				 this.minElement.graphicID,
				 QuakeHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
	}
	this.cmd("Move", this.minID, this.minElement.x, this.minElement.y - QuakeHeap.NODE_HEIGHT);
}

/********************************************************************
 * TREE ANIMATION HELPER FUNCTIONS	    							*
 ********************************************************************/

QuakeHeap.prototype.SetAllPositionsByHeight = function()
{
	var xPosition = QuakeHeap.LEAF_STARTING_X;
	for (var root = this.treeRoot; root != null; root = root.rightSib) {
		var height = this.height(root);
		var treeWidth = Math.pow(2, height - 1) * QuakeHeap.NODE_WIDTH;

		var yPosition = QuakeHeap.LEAF_STARTING_Y - (height - 1) * QuakeHeap.NODE_HEIGHT;

		this.SetTreePositionsRecursive(root, height, xPosition, yPosition);

		xPosition += treeWidth; // enable the next root to start at the right place!
	}
}

QuakeHeap.prototype.OffsetTreePositionsRecursive = function(tree)
{
	if (tree == null) return;

	var xOffset = Math.random() * 5;
	var yOffset =  Math.random() * 5;

	if (Math.random() < 0.5) {
		xOffset *= -1;
	}

	if (Math.random() < 0.5) {
		yOffset *= -1;
	}

	tree.x += xOffset;
	tree.y += yOffset;

	this.OffsetTreePositionsRecursive(tree.leftChild);
	this.OffsetTreePositionsRecursive(tree.rightSib);
}

QuakeHeap.prototype.SetTreePositionsRecursive = function(tree, height, xPosition, yPosition)
{
	// TODO: make chains stack on top of each other

	if (tree == null || height == 0) return;

	var treeWidth = Math.pow(2, height - 1) * QuakeHeap.NODE_WIDTH;

	if (height == 1) {
		tree.x = xPosition + (treeWidth / 2);
		tree.y = yPosition;
	} else {
		tree.x = xPosition + (treeWidth / 2);
		tree.y = yPosition;

		this.SetTreePositionsRecursive(tree.leftChild, height - 1, xPosition, yPosition + QuakeHeap.NODE_HEIGHT);
		if (tree.leftChild != null) {
			this.SetTreePositionsRecursive(tree.leftChild.rightSib, height - 1, xPosition + treeWidth / 2, yPosition + QuakeHeap.NODE_HEIGHT);
		}
	}
}
		
QuakeHeap.prototype.moveTree = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
		this.cmd("Move", tree.degreeID, tree.x  + QuakeHeap.DEGREE_OFFSET_X, tree.y + QuakeHeap.DEGREE_OFFSET_Y);
		
		this.moveTree(tree.leftChild);
		this.moveTree(tree.rightSib);
	}
}

QuakeHeap.prototype.deleteTree = function(tree)
{
	if (tree != null)
	{
		this.cmd("Delete", tree.graphicID);	
		this.cmd("Delete", tree.degreeID);
		this.deleteTree(tree.leftChild);
		this.deleteTree(tree.rightSib);
	}
}

/********************************************************************
 * MISC HELPER FUNCTIONS	    							        *
 ********************************************************************/

QuakeHeap.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++) {
		this.controls[i].disabled = false;
	}
}

QuakeHeap.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++) {
		this.controls[i].disabled = true;
	}
}

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new QuakeHeap(animManag, canvas.width, canvas.height);
}
