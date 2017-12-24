import { Map, List } from 'immutable';
import { directionFunctions, key, fromKey } from './Directions';
import { isSameColor, emptyNode, NodeTypes } from './NodeFunctions';

const isEmptyNode = ({ x, y, board }) => {
	return getTopNode({ x, y, board }).type === NodeTypes.EMPTY;
}

export const getTopNode = ({ x, y, board }) => {
	const nodeKey = key({ x, y });
	if (board.get(nodeKey)) return board.get(nodeKey).last();
	return undefined;
}

// Check the neighbors and create empty nodes around!
export const addEmptyNodesAround = ({ x, y, board }) => {
	let newBoard = board;
	directionFunctions.forEach(direction => {
		const neighborKey = key(direction(x, y));
		if (!board.has(neighborKey)) newBoard = newBoard.set(neighborKey, List([emptyNode()]));
	});
	return newBoard;
}

export const isSurrounded = ({ x, y, board }) => {
	let surrounded = true;
	directionFunctions.forEach(direction => {
		const neighborKey = key(direction(x, y));
		if (board.has(neighborKey) && getTopNode({ x, y, board }) === NodeTypes.EMPTY) surrounded = false;
	});
	return surrounded;
}

/*
*	Can only ever possibly add nodes to tiles where there is already a tile
*	An empty tile is anywhere the board is available
*/
export const addNode = ({ x, y, node, board }) => {
	console.log('addTo: ' + JSON.stringify(board.toJS()));
	let newBoard = board;
	const nodeKey = key({ x, y });
	const tileSlot = newBoard.get(nodeKey);
	// beetle jumps on top of other tile
	if (tileSlot && tileSlot.last().type !== NodeTypes.EMPTY) {
		const newList = newBoard.get(nodeKey).push(node); // add to end
		newBoard = newBoard.set(nodeKey, newList);
	} else
		newBoard = newBoard.set(nodeKey, List([node])); // was empty so we can set this one as completely empty

	return addEmptyNodesAround({ x, y, board: newBoard });
}

// replace top node at x, y with an empty node
export const removeNode = ({ x, y, board }) => {
	let newBoard = board;
	const nodeKey = key({ x, y });
	newBoard = newBoard.get(nodeKey).pop();
	return addNode({ x, y, node: emptyNode(), board: newBoard });
}

export const moveNode = ({ fromX, fromY, toX, toY, board }) => {
	const node = getTopNode({ x: fromX, y: fromY, board });
	const newBoard = removeNode({ x: fromX, y: fromY, board });
	return addNode({ x: toX, y: toY, node, board: newBoard });
}

/*
*	Tile Moves
* Rules:
*				1) Freedom of movement
*				2) Connected Hive
*/
export const canMoveNode = ({ fromX, fromY, toX, toY, board }) => {
	// use the node move rules to check
	const node = getTopNode({ x: fromX, y: fromY, board });
	switch (node.type) {
		case NodeTypes.QUEEN:
			return canMoveQueen({ fromX, fromY, toX, toY, board });
		default:
			return false
	}
}

const canMoveQueen = ({ fromX, fromY, toX, toY, board }) => {
	// ensure the new spot is open

	// check the destination is not more than one tile away
}



// check around for a mathing color and ensure there is no conflicting color
export const canPlace = ({ x, y, node, board, turn }) => {
	if (turn === 1) return true;
	let conflictingColor = false;
	let matchingColor = false;

	directionFunctions.forEach(direction => {
		const neighborKey = key(direction(x, y));
		if (board.has(neighborKey)) {
			const topNode = getTopNode({ x, y, board });
			if (isSameColor({ n1: node, n2: topNode })) matchingColor = true;
			else conflictingColor = true;
		}
	});
	return matchingColor && !conflictingColor;
}

export const possibleMoves = ({ board }) => {
	// return List of all possible keys ['0~0', '1~0', ...]
	let moves = List();
	board.forEach((v, k) => {
		const { x, y } = fromKey(k);
		if (isEmptyNode({ x, y, board })) moves = moves.push(k);
	})
	return moves;
}
