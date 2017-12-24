import React, { PureComponent } from "react";
import { List } from "immutable";

import { fromKey } from "../utility/Directions";
import Node, { Colors, NodeTypes } from "../utility/NodeFunctions";
import Board from "../utility/Board";

type Point = { x: number, y: number };
type Props = {};
type State = {
  board: Board,
  turn: number,
  curPlayer: Color,
  curTile: Node
};

export default class Hive extends PureComponent<Props, State> {
  constructor() {
    super();
    this.state = {
      board: new Board(),
      turn: 1,
      curPlayer: Colors.WHITE,
      curTile: new Node({ type: NodeTypes.QUEEN, color: Colors.WHITE })
    };
    this.changeNodeType = this.changeNodeType.bind(this);
  }

  componentDidMount() {
    // set the initial board (a single spot for a player to place the first tile)
    this.setBoard(this.state.board.set("0~0", List([Node.emptyNode()])));
  }

  /*
	*	This is the only function that will update the current board state
	*/
  setBoard(newBoard: Board) {
    this.setState({ board: newBoard });
  }

  /*
	* @param move the move to make { x, y, node }
	* @param AIMove true if this is a move for the AI to make
	*/
  nextBoard(point: Point, AIMove = false) {
    if (AIMove) {
      this.setBoard(this.userSpecifiedMove(point, this.state.curTile)); // no AI Yet :)
    } else {
      this.setBoard(this.userSpecifiedMove(point, this.state.curTile));
    }

    this.setState(prevState => {
      return {
        curPlayer:
          prevState.curPlayer === Colors.WHITE ? Colors.BLACK : Colors.WHITE, // swap players
        turn:
          prevState.turn === Colors.BLACK ? prevState.turn + 1 : prevState.turn // increment turn if tiles are BLACK
      };
    });
    this.setState(prevState => {
      return {
        curTile: new Node({
          ...prevState.curTile,
          color: prevState.curPlayer
        })
      };
    });
  }

  userSpecifiedMove(point: Point, node: Node): Board {
    return this.state.board.addNode(point, node);
  }

  /*
	* Determines if the a queen has been completely surrounded
	*	@return true if a queen has been completely surrounded
	*/
  isOver(): boolean {
    let over = false;

    // get the queens
    let queens = List();
    this.state.board.forEach((tileSlot, k) => {
      tileSlot.forEach(node => {
        if (node.type === NodeTypes.QUEEN) queens = queens.push(k);
      });
    });

    // check if either of the queens is completely surrounded
    queens.forEach(key => {
      let point = fromKey(key);
      if (this.state.board.isSurrounded(point)) over = true;
    });
    return over;
  }

  changeNodeType(e) {
    this.setState({
      curTile: new Node({
        type: e.target.value,
        color: this.state.color
      })
    });
  }

  /*
	* Sort the board so that it can be rendered properly
	*/
  sortBoard() {
    let minY = Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let maxX = -Infinity;
    // sort by x then y
    const [...ks] = this.state.board.keys();
    let numberKeys = ks.map(key => {
      let { x, y } = fromKey({ key });
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      return { x: x, y: y };
    });
    // sort by y value first
    numberKeys.sort((a, b) => {
      let n = a.y - b.y;
      if (n !== 0) return n;
      return a.x - b.x;
    });
    return { minY, maxY, minX, maxX };
  }

  _renderHex({ node = {}, x, y }) {
    const makeUserSpecifiedMove = () =>
      this.nextBoard({
        x,
        y
      });
    return (
      <div className={`hex`} onClick={makeUserSpecifiedMove}>
        <div className={`top ${node.color}`} />
        <div className={`middle ${node.color}`}>
          {node.type || "null"} {node.color || "null"} {x} {y}
        </div>
        <div className={`bottom ${node.color}`} />
      </div>
    );
  }

  _renderHexRow({ even, rowItems }) {
    return <div className={`hex-row ${even ? "even" : ""}`}>{rowItems}</div>;
  }

  _renderBoard() {
    const { minY, maxY, minX, maxX } = this.sortBoard();
    /*
			Have to go left 1x for every -2y we go up. So the left most is either minX or minimum computed from minimum of y axis
		*/
    let leftBorder = Math.min(minX, -1 - Math.floor(Math.abs(minY) / 2));

    const hexes = [];
    for (let y = minY; y <= maxY; y++) {
      let rowItems = [];
      let rowStart = leftBorder;
      if (y < 0) rowStart = rowStart + Math.floor(Math.abs(y) / 2); // shift left if the row is -2 or greater
      if (y > 0) rowStart = rowStart - Math.ceil(y / 2); // shift right if the row is greater than 0
      rowStart--;
      for (let x = rowStart; x <= maxX; x++) {
        // get top node (a tile or an empty slot) or don't display a slot
        const node = this.state.board.topNode({ x, y });
        rowItems.push(this._renderHex({ node, x, y }));
      }
      hexes.push(this._renderHexRow({ even: y % 2 === 0, rowItems }));
    }
    return hexes;
  }

  render() {
    const { minY, maxY, minX, maxX } = this.sortBoard();
    const hexes = this._renderBoard();

    return (
      <div>
        type:{" "}
        <input
          type="text"
          value={this.state.curTile.type}
          onChange={this.changeNodeType}
        />
        color: {this.state.curTile.color}
        <br />
        <div>
          minX:{minX} maxX:{maxX}
        </div>
        <div>
          minY:{minY} maxY:{maxY}
        </div>
        <br />
        <div className="boardWrapper">
          <div className="board">{hexes}</div>
        </div>
      </div>
    );
  }
}
