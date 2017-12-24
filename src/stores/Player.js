import Tile from "./Tile";
import { TileCounts } from "../static/Tile";
export default class Player {
  color: string = "";
  tiles: Array<Tile> = [];
  isAI: boolean = false;
  constructor(color: string, isAI: boolean) {
    this.color = color;
    this.tiles = this.buildTileBag();
    this.isAI = isAI;
  }

  removeTile(tile) {
    const tileIndex = this.tiles.find(
      stateTile => stateTile.type === tile.type
    );
    this.tiles.splice(tileIndex, 1);
  }

  buildTileBag() {
    let tileBag = [];
    Object.keys(TileCounts).forEach(tileType => {
      for (let i = 0; i < TileCounts[tileType]; i++) {
        tileBag.push(new Tile({ type: tileType, color: this.color }));
      }
    });
    return tileBag;
  }
}
