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
    let newBoard = this;
    directionFunctions.forEach(direction => {
      const neighborKey = key(direction(point));
      if (!this.has(neighborKey))
        newBoard = newBoard.set(neighborKey, List([Node.emptyNode()]));
    });
    return newBoard;
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
    let newBoard = this;
    const nodeKey = key(point);
    const tileSlot = newBoard.get(nodeKey);
    // beetle jumps on top of other tile
    if (tileSlot && tileSlot.last().type !== NodeTypes.EMPTY) {
      const newList = newBoard.get(nodeKey).push(node); // add to end
      newBoard = newBoard.set(nodeKey, newList);
    } else newBoard = newBoard.set(nodeKey, List([node])); // was empty so we can set this one as completely empty

    // Cache the queens so we can quickly calculate a heuristic for the board
    if (node.type === NodeTypes.QUEEN)
      newBoard = newBoard.set(`${node.color}_${node.type}`, nodeKey);

    return newBoard.addEmptyNodesAround(point);
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

  /**
   * Return the score on the board for each player
   * BLACK: Positive is better
   * WHITE: Negative is better
   */
  score(): { BLACK: number, WHITE: number } {
    const playerScores = { BLACK: 0, WHITE: 0 };
    if (this.queens().BLACK) {
      const location: string = this.queens().BLACK;
      const locationPoint: Point = fromKey(location);
      playerScores.BLACK = directionFunctions.reduce((acc, direction) => {
        const node = this.topNode(direction(locationPoint));
        if (node.type !== NodeTypes.EMPTY) acc++;
        return acc;
      }, 0);
    }

    if (this.queens().WHITE) {
      const location: string = this.queens().WHITE;
      const locationPoint: Point = fromKey(location);
      playerScores.WHITE = directionFunctions.reduce((acc, direction) => {
        const node = this.topNode(direction(locationPoint));
        if (node.type !== NodeTypes.EMPTY) acc--;
        return acc;
      }, 0);
    }
    return playerScores;
  }

  queens(): { BLACK?: string, WHITE?: string } {
    return { BLACK: this.get("BLACK_QUEEN"), WHITE: this.get("WHITE_QUEEN") };
  }

  possibleSpotsToPlace(node) {
    // return List of all possible keys ['0~0', '1~0', ...]
    let moves = List();
    this.filter(
      (v, key) => key !== "BLACK_QUEEN" && key !== "WHITE_QUEEN"
    ).forEach((v, k) => {
      const point = fromKey(k);
      if (this.isEmptyNode(point))
        moves = moves.push(this.addNode(point, node));
    });
    return moves;
  }
}
