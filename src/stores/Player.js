import { List } from "immutable";

import Tile from "./Tile";
import { TileCounts } from "../static/Tile";
export default class Player {
  color: string = "";
  tiles: Array<Tile> = List();
  isAI: boolean = false;
  constructor(color: string, isAI: boolean, intelligence?: number) {
    this.color = color;
    this.tiles = this.buildTileBag();
    this.isAI = isAI;
    this.intelligence = intelligence;
  }

  removeTile(tile) {
    const tileIndex = this.tiles.findIndex(
      stateTile => stateTile.type === tile.type
    );
    this.tiles = this.tiles.delete(tileIndex);
  }

  buildTileBag() {
    let tileBag = List();
    Object.keys(TileCounts).forEach(tileType => {
      for (let i = 0; i < TileCounts[tileType]; i++) {
        tileBag = tileBag.push(new Tile({ type: tileType, color: this.color }));
      }
    });
    return tileBag;
  }
}
