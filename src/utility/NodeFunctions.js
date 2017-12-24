/* flow */
export const NodeTypes = {
  EMPTY: "EMPTY",
  QUEEN: "QUEEN",
  ANT: "ANT",
  GRASSHOPPER: "GRASSHOPPER",
  SPIDER: "SPIDER",
  BEETLE: "BEETLE"
};

export const Colors = {
  BLACK: "BLACK", // Maxie
  WHITE: "WHITE", // Minnie
  EMPTY: "EMPTY"
};

export type Tile = {
  type: string,
  color: string
};

export default class Node {
  type;
  color;

  constructor(props: Tile) {
    Object.assign(this, props);
  }

  static emptyNode() {
    return new Node({ type: NodeTypes.EMPTY, color: Colors.EMPTY });
  }

  sameColorAs(node) {
    return this.color === node.color;
  }
}
