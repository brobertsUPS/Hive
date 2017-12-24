import React, { PureComponent } from "react";
import { List } from "immutable";

import Board from "./stores/Board";
import Player from "./stores/Player";
import Tile from "./stores/Tile";

import { TileTypes } from "./static/Tile";
import { Colors } from "./static/Player";

import { fromKey } from "./utility/Directions";

type Point = { x: number, y: number };
type Props = {};
type State = {
  maxie: Player,
  minnie: Player,
  board: Board,
  curPlayer: Player,
  curTile: Tile,
  winner: Player
};

export default class Hive extends PureComponent<Props, State> {
  constructor() {
    super();
    this.state = {
      maxie: null,
      minnie: null,
      board: new Board(),
      curPlayer: null,
      curTile: null,
      winner: null,
      AIEnabled: true
    };
  }

  componentWillMount() {
    // set up the players
    const maxie = new Player("BLACK");
    const minnie = new Player("WHITE", true);
    this.setState({
      maxie,
      minnie,
      curPlayer: maxie,
      curTile: maxie.tiles[0]
    });
  }

  componentDidMount() {
    // set the initial board (a single spot for a player to place the first tile)
    this.setBoard(this.state.board.set("0~0", List([Tile.emptyTile()])));
  }

  /*
	*	This is the only function that will update the current board state
	*/
  setBoard(newBoard: Board) {
    this.setState({ board: newBoard });
  }

  setCurrentTile(tile) {
    this.setState({ curTile: tile });
  }

  nextBoard(point?: Point) {
    if (this.state.curPlayer.AIEnabled) {
      this.setBoard(this.aiMove());
      //this.setBoard(this.userSpecifiedMove(point, this.state.curTile)); // no AI Yet :)
    } else {
      this.state.curPlayer.removeTile(this.state.curTile);
      this.setBoard(this.userSpecifiedMove(point, this.state.curTile));
    }

    this.setState(prevState => {
      return {
        curPlayer:
          prevState.curPlayer.color === Colors.WHITE
            ? prevState.maxie
            : prevState.minnie // swap players
      };
    });
    this.setState(prevState => {
      return {
        curTile: prevState.curPlayer.tiles[0]
      };
    });
  }

  aiMove(): Board {
    const possibleBoardStates = this.state.board.possibleSpotsToPlace(
      this.state.curTile
    );
    // get all possible board states
    // pick one

    // Game over if AI can't move
    if (possibleBoardStates.size === 0) {
      this.setState({ winner: "WHITE" });
      return this.state.board;
    }

    console.log(possibleBoardStates.last());
    return possibleBoardStates.last();
  }

  userSpecifiedMove(point: Point, tile: Tile): Board {
    return this.state.board.addTile(point, tile);
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
      tileSlot.forEach(tile => {
        if (tile.type === TileTypes.QUEEN) queens = queens.push(k);
      });
    });

    // check if either of the queens is completely surrounded
    queens.forEach(key => {
      let point = fromKey(key);
      if (this.state.board.isSurrounded(point)) over = true;
    });
    return over;
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
    let numberKeys = ks
      .filter(key => key !== "BLACK_QUEEN" && key !== "WHITE_QUEEN")
      .map(key => {
        let { x, y } = fromKey(key);
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

  _renderHex({ tile = {}, x, y }) {
    const makeUserSpecifiedMove = () =>
      this.nextBoard({
        x,
        y
      });
    return (
      <div className={`hex`} onClick={makeUserSpecifiedMove}>
        <div className={`top ${tile.color}`} />
        <div className={`middle ${tile.color}`}>
          {tile.type || "null"} {tile.color || "null"} {x} {y}
        </div>
        <div className={`bottom ${tile.color}`} />
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
        // get top tile (a tile or an empty slot) or don't display a slot
        const tile = this.state.board.topTile({ x, y });
        rowItems.push(this._renderHex({ tile, x, y }));
      }
      hexes.push(this._renderHexRow({ even: y % 2 === 0, rowItems }));
    }
    return hexes;
  }

  render() {
    const { minY, maxY, minX, maxX } = this.sortBoard();
    const hexes = this._renderBoard();
    if (this.state.curPlayer.AIEnabled) this.nextBoard();

    return (
      <div>
        <div>
          minX:{minX} maxX:{maxX}
        </div>
        <div>
          minY:{minY} maxY:{maxY}
        </div>
        <br />
        {/* BLACK */}
        <div>
          <div>Player: {this.state.curPlayer.color}</div>
          {this.state.curPlayer.tiles.map(tile => {
            return (
              <div onClick={() => this.setCurrentTile(tile)}>
                {tile.type}
                <span>{tile.type === this.state.curTile.type && "ACTIVE"}</span>
              </div>
            );
          })}
        </div>

        <div className="boardWrapper">
          <div className="board">{hexes}</div>
        </div>
      </div>
    );
  }
}
