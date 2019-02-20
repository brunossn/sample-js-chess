const _board = [];

// Peças
const PEAO = 1;
const TORRE = 2;
const CAVALO = 3;
const BISPO = 4;
const REI = 5;
const RAINHA = 6;

// Board
const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

main();

function main() {
    createBoard();
    createPieces();
    draw();
}

function createBoard() {
    for(let i = 0; i < BOARD_WIDTH; i++) {
        _board[i] = [];

        for(let j = 0; j < BOARD_HEIGHT; j++) {
            _board[i][j] = {
                piece: null,
                pieceColor: 'white',
                squareColor: (i + j) % 2 == 0 ? 'white' : 'black',
                canBeNextMove: false,
                selected: false,
                row: i,
                column: j
            };
        }
    }
}

function movePiece (fromRow, fromColumn, toRow, toColumn) {
    
    const piece = _board[fromRow][fromColumn].piece;
    _board[fromRow][fromColumn].piece = null;
    _board[toRow][toColumn].piece = piece;
    
    draw();
}

function createPieces() {
    _board[6].map(x => x.piece = PEAO);
    _board[7][0].piece = TORRE;
    _board[7][1].piece = CAVALO;
    _board[7][2].piece = BISPO;
    _board[7][3].piece = REI;
    _board[7][4].piece = RAINHA;
    _board[7][5].piece = BISPO;
    _board[7][6].piece = CAVALO;
    _board[7][7].piece = TORRE;
}

function draw() {
    let html = '<table>';

    for(let i = 0; i < _board.length; i++) {
        html += '<tr>';

        for(let j = 0; j < _board[i].length; j++) {

            const square = _board[i][j];

            const backgroundColorClass = square.squareColor;
            const pieceHoverClass = square.piece == null ? '' : 'pieceHover';
            const canBeNextMove = square.canBeNextMove == false ? '' : 'canBeNextMove';
            const selected = square.selected == false ? '' : 'selected';

            html += `<td
                        data-row="${i}"
                        data-column="${j}"
                        class="${backgroundColorClass} ${pieceHoverClass} ${canBeNextMove} ${selected}">
                        <img height="50" src="${getImageFromPiece(square.piece)}" />
                    </td>`;
        }
        
        html += '</tr>'; 
    }

    html += '</table>';

    document.querySelector('#chess').innerHTML = html;

    createListeners();

    function getImageFromPiece(piece) {

        if(piece == null || piece == undefined) return '';

        const imagem = 
            piece == TORRE ? 'torre' :
            piece == CAVALO ? 'cavalo' :
            piece == BISPO ? 'bispo' :
            piece == REI ? 'rei' :
            piece == RAINHA ? 'rainha' :
            'peao';

        return `img/${imagem}.svg`;
    }
}

function createListeners() {
    
    // Click
    document.querySelectorAll("td")
        .forEach(e => e.addEventListener('click', function(e) {
            
            const clickedsquare = _board[this.dataset.row][this.dataset.column];

            if(clickedsquare.piece != null) { // se clicou em peça
                clearSelectedSquares();
                selectSquare(this.dataset.row, this.dataset.column);
                clearNextMovesMarkers();
                printNextMoves(this.dataset.row, this.dataset.column);
            }
            else if(clickedsquare.canBeNextMove == true) { // se clicou para mover peça
                
                filterSquares(square => square.selected)
                .map(square =>
                    movePiece(square.row, square.column, this.dataset.row, this.dataset.column));
                    
                clearNextMovesMarkers();
                clearSelectedSquares();
            }

            draw();
        }));
}

function selectSquare(row, column) {
    if(_board[row][column].piece != null) {
        _board[row][column].selected = true;
    }
}

function printNextMoves(row, column) {
    if(_board[row][column].piece != null) {
        getMovesFromPiece(_board[row][column].piece, row, column)
        .forEach(x => _board[x.row][x.column].canBeNextMove = true);
    }

    /** Return a array with the possibles moves */
    function getMovesFromPiece(piece, row, column) {
        
        const directions =
            piece == PEAO ? getPeaoDirections() :
            piece == TORRE ? getTorreDirections(row, column) :
            piece == CAVALO ? getCavaloDirections() :
            piece == BISPO ? getBispoDirections() :
            piece == REI ? getReiDirections() :
            piece == RAINHA ? getRainhaDirections() :
            [];

        return calculaCasas(row, column, directions)
            .filter(piece => inBoard(piece.row, piece.column))
            .filter(piece => !hasSquarePiece(piece.row, piece.column));

        function removeCollapses(pieces) {
            return pieces.filter(piece => !hasSquarePiece(piece.row, piece.column));
        }

        function calculaCasas(row, column, directions) {

            if(!directions.propagation)
                return directions.moves.map(d =>
                    ({ row: Number(row) + d.y, column: Number(column) + d.x })
                );

            let moves = [];
            directions.moves.forEach(move => { // para cada direção
                
                let square = { row: Number(row) + move.y, column: Number(column) + move.x };

                while(inBoard(square.row, square.column) && !hasSquarePiece(square.row, square.column)) {
                    moves.push({ row: square.row, column: square.column });
                    square.row += move.y;
                    square.column += move.x;
                }
            });

            return moves;
        }

        function getPeaoDirections() {
            return {
                propagation: false,
                moves: [
                    { x: 0, y: -1 }
                ]
            };
        }

        function getTorreDirections(row, column) {
            return {
                propagation: true,
                moves: [
                    { x: 0, y: -1 },
                    { x: 0, y: 1 },
                    { x: -1, y: 0 },
                    { x: 1, y: 0 }
                ]
            }
        }

        function getCavaloDirections() {
            return {
                propagation: false,
                moves: [
                    { x: -2, y: -1 },
                    { x: -1, y: -2 },
                    { x: 1, y: -2 },
                    { x: 2, y: -1 },
                    { x: 2, y: 1 },
                    { x: 1, y: 2 },
                    { x: -1, y: 2 },
                    { x: -2, y: 1 }
                ]
            };
        }

        function getBispoDirections() {
            return {
                propagation: true,
                moves: [
                    { x: -1, y: -1 },
                    { x: -1, y: 1 },
                    { x: 1, y: -1 },
                    { x: 1, y: 1 }
                ]
            }
        }

        function getReiDirections() {
            return {
                propagation: false,
                moves: [
                    { x: 0, y: -1 },
                    { x: 1, y: -1 },
                    { x: 1, y: 0 },
                    { x: 1, y: 1 },
                    { x: 0, y: 1 },
                    { x: -1, y: 1 },
                    { x: -1, y: 0 },
                    { x: -1, y: -1 }
                ]
            }
        }

        function getRainhaDirections() {
            return {
                propagation: true,
                moves: [
                    { x: 0, y: -1 },
                    { x: 1, y: -1 },
                    { x: 1, y: 0 },
                    { x: 1, y: 1 },
                    { x: 0, y: 1 },
                    { x: -1, y: 1 },
                    { x: -1, y: 0 },
                    { x: -1, y: -1 }
                ]
            }
        }
    }
}

/** Clear the "Next moves" marks */
function clearNextMovesMarkers() {
    mapSquares(square => square.canBeNextMove = false);
}

/** Clear the "Selected square" status from all squares */
function clearSelectedSquares() {
    mapSquares(square => square.selected = false);
}

/** Returns true if the square has a piece */
function hasSquarePiece(row, column) {
    return _board[row][column].piece != null;
}

/** Return true if the row and column is inside the board */
function inBoard(row, column)
{
    return row >= 0 && 
        row < BOARD_HEIGHT && 
        column >= 0 && 
        column < BOARD_WIDTH;
}

/** Execute a function in all squares */
function mapSquares(fnSquare) {
    _board.map(row =>
        row.map(square =>
            fnSquare(square)));
}

/** Return all squares that fits the param filter */
function filterSquares(fnSquare) {
    return _board.flatMap(row => row.filter(square => fnSquare(square)));
}