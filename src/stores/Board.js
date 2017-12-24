/* flow */

import { List } from "immutable";
import { Map } from "extendable-immutable";
import { directionFunctions, key, fromKey } from "../utility/Directions";
import Tile from "./Tile";
import { TileTypes } from "../static/Tile";
import type Point from "../Hive";

export default class Board extends Map {
  isEmptyTile(point: Point): boolean {
    return this.topTile(point).type === TileTypes.EMPTY;
  }

  topTile(point) {
    const tileKey = key(point);
    if (this.get(tileKey)) return this.get(tileKey).last();
    return undefined;
  }

  addEmptyTilesAround(point) {
    let newBoard = this;
    directionFunctions.forEach(direction => {
      const neighborKey = key(direction(point));
      if (!this.has(neighborKey))
        newBoard = newBoard.set(neighborKey, List([Tile.emptyTile()]));
    });
    return newBoard;
  }

  isSurrounded(point) {
    let surrounded = true;
    directionFunctions.forEach(direction => {
      const neighborKey = key(direction(point));
      if (this.has(neighborKey) && this.topTile(point) === TileTypes.EMPTY)
        surrounded = false;
    });
    return surrounded;
  }

  /*
*	Can only ever possibly add tiles to tiles where there is already a tile
*	An empty tile is anywhere the board is available
*/
  addTile(point, tile) {
    console.log("addTo: " + JSON.stringify(this.toJS()));
    let newBoard = this;
    const tileKey = key(point);
    const tileSlot = newBoard.get(tileKey);
    // beetle jumps on top of other tile
    if (tileSlot && tileSlot.last().type !== TileTypes.EMPTY) {
      const newList = newBoard.get(tileKey).push(tile); // add to end
      newBoard = newBoard.set(tileKey, newList);
    } else newBoard = newBoard.set(tileKey, List([tile])); // was empty so we can set this one as completely empty

    // Cache the queens so we can quickly calculate a heuristic for the board
    if (tile.type === TileTypes.QUEEN)
      newBoard = newBoard.set(`${tile.color}_${tile.type}`, tileKey);

    return newBoard.addEmptyTilesAround(point);
  }

  removeTile(point) {
    let newBoard = this;
    const tileKey = key(point);
    newBoard = newBoard.get(tileKey).pop();
    return this.addTile(point, Tile.emptyTile());
  }

  moveTile({ fromX, fromY, toX, toY }) {
    const tile = this.topTile({ x: fromX, y: fromY });
    const newBoard = this.removeTile({ x: fromX, y: fromY });
    return this.addTile({ x: toX, y: toY }, tile);
  }

  /*
*	Tile Moves
* Rules:
*				1) Freedom of movement
*				2) Connected Hive
*/
  canMoveTile({ fromX, fromY, toX, toY }) {
    // use the tile move rules to check
    const tile = this.topTile({ x: fromX, y: fromY });
    switch (tile.type) {
      case TileTypes.QUEEN:
        return this.canMoveQueen({ fromX, fromY, toX, toY });
      default:
        return false;
    }
  }

  canPlace(point, tile, turn) {
    if (turn === 1) return true;
    let conflictingColor = false;
    let matchingColor = false;

    directionFunctions.forEach(direction => {
      const neighborKey = key(direction(point));
      if (this.has(neighborKey)) {
        const topTile = this.topTile(point);
        if (tile.sameColorAs(topTile)) matchingColor = true;
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
        const tile = this.topTile(direction(locationPoint));
        if (tile.type !== TileTypes.EMPTY) acc++;
        return acc;
      }, 0);
    }

    if (this.queens().WHITE) {
      const location: string = this.queens().WHITE;
      const locationPoint: Point = fromKey(location);
      playerScores.WHITE = directionFunctions.reduce((acc, direction) => {
        const tile = this.topTile(direction(locationPoint));
        if (tile.type !== TileTypes.EMPTY) acc--;
        return acc;
      }, 0);
    }
    return playerScores;
  }

  queens(): { BLACK?: string, WHITE?: string } {
    return { BLACK: this.get("BLACK_QUEEN"), WHITE: this.get("WHITE_QUEEN") };
  }

  possibleSpotsToPlace(tile) {
    // return List of all possible keys ['0~0', '1~0', ...]
    let moves = List();
    this.filter(
      (v, key) => key !== "BLACK_QUEEN" && key !== "WHITE_QUEEN"
    ).forEach((v, k) => {
      const point = fromKey(k);
      if (this.isEmptyTile(point))
        moves = moves.push(this.addTile(point, tile));
    });
    return moves;
  }
}
