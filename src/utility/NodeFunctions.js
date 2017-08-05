export const NodeTypes = {
	EMPTY: 'EMPTY',
	QUEEN: 'QUEEN',
	ANT: 'ANT',
	GRASSHOPPER: 'GRASSHOPPER',
	SPIDER: 'SPIDER',
	BEETLE: 'BEETLE'
};

export const Colors = {
	BLACK: 'BLACK',
	WHITE: 'WHITE',
	EMPTY: 'EMPTY'
};

export function Node({ type, color }) {
  this.type = type;
  this.color = color;
}

export const emptyNode = () => { return new Node({ type: NodeTypes.EMPTY, color: Colors.EMPTY }); }
export const isSameColor = ({ n1, n2 }) => { return n1.color === n2.color; }
