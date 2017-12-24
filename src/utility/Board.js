/* flow */

import { List } from "immutable";
import { Map } from "extendable-immutable";
import { directionFunctions, key, fromKey } from "./Directions";
import Node, { NodeTypes } from "./NodeFunctions";
import type Point from "../containers/Hive";

export default class Board extends Map {
  isEmptyNode(point: Point): boolean {
    return this.topNode(point).type === NodeTypes.EMPTY;
  }

  topNode(point) {
    const nodeKey = key(point);
    if (this.get(nodeKey)) return this.get(nodeKey).last();
    return undefined;
  }

  addEmptyNodesAround(point) {
    directionFunctions.forEach(direction => {
      const neighborKey = key(direction(point));
      if (!this.has(neighborKey))
        this.set(neighborKey, List([Node.emptyNode()]));
    });
    return this;
  }

  isSurrounded(point) {
    let surrounded = true;
    directionFunctions.forEach(direction => {
      const neighborKey = key(direction(point));
      if (this.has(neighborKey) && this.topNode(point) === NodeTypes.EMPTY)
        surrounded = false;
    });
    return surrounded;
  }

  /*
*	Can only ever possibly add nodes to tiles where there is already a tile
*	An empty tile is anywhere the board is available
*/
  addNode(point, node) {
    console.log("addTo: " + JSON.stringify(this.toJS()));
    const nodeKey = key(point);
    const tileSlot = this.get(nodeKey);
    // beetle jumps on top of other tile
    if (tileSlot && tileSlot.last().type !== NodeTypes.EMPTY) {
      const newList = this.get(nodeKey).push(node); // add to end
      this.set(nodeKey, newList);
    } else this.set(nodeKey, List([node])); // was empty so we can set this one as completely empty

    return this.addEmptyNodesAround(point);
  }

  removeNode(point) {
    let newBoard = this;
    const nodeKey = key(point);
    newBoard = newBoard.get(nodeKey).pop();
    return this.addNode(point, Node.emptyNode());
  }

  moveNode({ fromX, fromY, toX, toY }) {
    const node = this.topNode({ x: fromX, y: fromY });
    const newBoard = this.removeNode({ x: fromX, y: fromY });
    return this.addNode({ x: toX, y: toY }, node);
  }

  /*
*	Tile Moves
* Rules:
*				1) Freedom of movement
*				2) Connected Hive
*/
  canMoveNode({ fromX, fromY, toX, toY }) {
    // use the node move rules to check
    const node = this.topNode({ x: fromX, y: fromY });
    switch (node.type) {
      case NodeTypes.QUEEN:
        return this.canMoveQueen({ fromX, fromY, toX, toY });
      default:
        return false;
    }
  }

  canPlace(point, node, turn) {
    if (turn === 1) return true;
    let conflictingColor = false;
    let matchingColor = false;

    directionFunctions.forEach(direction => {
      const neighborKey = key(direction(point));
      if (this.has(neighborKey)) {
        const topNode = this.topNode(point);
        if (node.sameColorAs(topNode)) matchingColor = true;
        else conflictingColor = true;
      }
    });
    return matchingColor && !conflictingColor;
  }

  possibleMoves() {
    // return List of all possible keys ['0~0', '1~0', ...]
    let moves = List();
    this.forEach((v, k) => {
      const point = fromKey(k);
      if (this.isEmptyNode(point)) moves = moves.push(k);
    });
    return moves;
  }
}
