import { TileTypes } from "../static/Tile";
import { Colors } from "../static/Player";

export type TileProps = {
  type: string,
  color: string
};

export default class Tile {
  type;
  color;

  constructor(props: TileProps) {
    Object.assign(this, props);
  }

  static emptyTile() {
    return new Tile({ type: TileTypes.EMPTY, color: Colors.EMPTY });
  }

  sameColorAs(node) {
    return this.color === node.color;
  }
}
