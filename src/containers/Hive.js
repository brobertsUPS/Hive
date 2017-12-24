import React, { PureComponent } from "react";
import { Map, List } from "immutable";

import { fromKey } from "../utility/Directions";
import { Node, Colors, NodeTypes, emptyNode } from "../utility/NodeFunctions";
import {
  getTopNode,
  isSurrounded,
  possibleMoves,
  addNode
} from "../utility/BoardFunctions";

export default class Hive extends PureComponent {
  constructor() {
    super();
    this.state = {
      board: Map(),
      turn: 1,
      curPlayer: Colors.WHITE,
      tempMoveState: {
        node: new Node({ type: NodeTypes.QUEEN, color: Colors.WHITE })
      }
    };
    this.changeNodeType = this.changeNodeType.bind(this);
  }

  componentDidMount() {
    // set the initial board (a single spot for a player to place the first tile)
    this.setBoard(this.state.board.set("0~0", List([emptyNode()])));
  }

  /*
	*	This is the only function that will update the current board state
	*/
  setBoard(newBoard) {
    this.setState({ board: newBoard });
  }

  /*
	* @param move the move to make { x, y, node }
	* @param AIMove true if this is a move for the AI to make
	*/
  nextBoard({ move, AIMove }) {
    if (AIMove) {
      this.setBoard(this.userSpecifiedMove({ move })); // no AI Yet :)
    } else {
      this.setBoard(this.userSpecifiedMove({ move }));
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
        tempMoveState: {
          node: new Node({
            type: prevState.tempMoveState.node.type,
            color: prevState.curPlayer
          })
        }
      };
    });
  }

  /*
	* Determines if the a queen has been completely surrounded
	*	@return true if a queen has been completely surrounded
	*/
  isOver() {
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
      let { x, y } = fromKey(key);
      if (isSurrounded({ x, y, board: this.state.board })) over = true;
    });
    return over;
  }

  userSpecifiedMove({ move }) {
    return addNode({ ...move, board: this.state.board });
  }

  changeNodeType(e) {
    this.setState({
      tempMoveState: {
        node: new Node({
          type: e.target.value,
          color: this.state.tempMoveState.node.color
        })
      }
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
    return { numberKeys, minY, maxY, minX, maxX };
  }

  _renderHex({ node = {}, x, y }) {
    const makeUserSpecifiedMove = () =>
      this.nextBoard({
        move: {
          ...this.state.tempMoveState,
          x,
          y
        }
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
    const { numberKeys, minY, maxY, minX, maxX } = this.sortBoard();
    /*
			Have to go left 1x for every -2y we go up. So the left most is either minX or minimum computed from minimum of y axis
		*/
    let leftBorder = Math.min(minX, -1 - Math.floor(Math.abs(minY) / 2));

    const hexes = [];
    let rowCounter = 0;
    for (let y = minY; y <= maxY; y++) {
      let rowItems = [];
      let rowStart = leftBorder;
      if (y < 0) rowStart = rowStart + Math.floor(Math.abs(y) / 2); // shift left if the row is -2 or greater
      if (y > 0) rowStart = rowStart - Math.ceil(y / 2); // shift right if the row is greater than 0
      rowStart--;
      for (let x = rowStart; x <= maxX; x++) {
        // get top node (a tile or an empty slot) or don't display a slot
        const node = getTopNode({ x, y, board: this.state.board });
        rowItems.push(this._renderHex({ node, x, y }));
      }
      hexes.push(this._renderHexRow({ even: y % 2 === 0, rowItems }));
    }
    return hexes;
  }

  render() {
    const { numberKeys, minY, maxY, minX, maxX } = this.sortBoard();
    const hexes = this._renderBoard();

    return (
      <div>
        type:{" "}
        <input
          type="text"
          value={this.state.tempMoveState.node.type}
          onChange={this.changeNodeType}
        />
        color: {this.state.tempMoveState.node.color}
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
