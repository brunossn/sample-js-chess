const _board = [];
const _pieces = [];

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

startGame();

function startGame() {
    createBoard();
    createPieces();
    draw();
}

function createBoard() {
    range(BOARD_WIDTH).forEach(i => {
        _board[i] = [];

        range(BOARD_HEIGHT).forEach(j => {
            _board[i][j] = {
                piece: null,
                pieceColor: 'white',
                squareColor: (i + j) % 2 == 0 ? 'white' : 'black',
                canBeNextMove: false,
                selected: false,
                row: i,
                column: j
            };
        });
    });
}

function createPieces() {
    blackPieces();
    whitePieces();

    function whitePieces() {
        range(8).forEach(n => _pieces.push({ piece: PEAO, row: 1, column: n, moves: 0, color: 'white' }));
        _pieces.push({ piece: TORRE, row: 0, column: 0, moves: 0, color: 'white' });
        _pieces.push({ piece: CAVALO, row: 0, column: 1, moves: 0, color: 'white' });
        _pieces.push({ piece: BISPO, row: 0, column: 2, moves: 0, color: 'white' });
        _pieces.push({ piece: REI, row: 0, column: 3, moves: 0, color: 'white' });
        _pieces.push({ piece: RAINHA, row: 0, column: 4, moves: 0, color: 'white' });
        _pieces.push({ piece: BISPO, row: 0, column: 5, moves: 0, color: 'white' });
        _pieces.push({ piece: CAVALO, row: 0, column: 6, moves: 0, color: 'white' });
        _pieces.push({ piece: TORRE, row: 0, column: 7, moves: 0, color: 'white' });
    }

    function blackPieces() {
        range(8).forEach(n => _pieces.push({ piece: PEAO, row: 6, column: n, moves: 0, color: 'black' }));
        _pieces.push({ piece: TORRE, row: 7, column: 0, moves: 0, color: 'black' });
        _pieces.push({ piece: CAVALO, row: 7, column: 1, moves: 0, color: 'black' });
        _pieces.push({ piece: BISPO, row: 7, column: 2, moves: 0, color: 'black' });
        _pieces.push({ piece: REI, row: 7, column: 3, moves: 0, color: 'black' });
        _pieces.push({ piece: RAINHA, row: 7, column: 4, moves: 0, color: 'black' });
        _pieces.push({ piece: BISPO, row: 7, column: 5, moves: 0, color: 'black' });
        _pieces.push({ piece: CAVALO, row: 7, column: 6, moves: 0, color: 'black' });
        _pieces.push({ piece: TORRE, row: 7, column: 7, moves: 0, color: 'black' });
    }
}

function draw() {
    let html = '<table>';

    for(let i = 0; i < _board.length; i++) {
        html += '<tr>';

        for(let j = 0; j < _board[i].length; j++) {

            const square = _board[i][j];

            const backgroundColorClass = square.squareColor;
            const pieceHoverClass = hasSquarePiece(i, j) ? 'pieceHover' : '';
            const canBeNextMove = square.canBeNextMove == false ? '' : 'canBeNextMove';
            const selected = square.selected == false ? '' : 'selected';

            const piece = _pieces.filter(p => p.row == i && p.column == j);

            html += `<td
                        data-row="${i}"
                        data-column="${j}"
                        class="${backgroundColorClass} ${pieceHoverClass} ${canBeNextMove} ${selected}">
                        ${ (piece.length > 0 ? `<img height="50" src="${getImageFromPiece(piece[0].piece, piece[0].color)}" />` : '') }
                    </td>`;
        }
        
        html += '</tr>'; 
    }

    html += '</table>';

    document.querySelector('#chess').innerHTML = html;

    createListeners();

    function getImageFromPiece(piece, color) {

        if(piece == null || piece == undefined) return '';

        const imagem = 
            piece == TORRE ? 'torre' :
            piece == CAVALO ? 'cavalo' :
            piece == BISPO ? 'bispo' :
            piece == REI ? 'rei' :
            piece == RAINHA ? 'rainha' :
            piece == PEAO ? 'peao' : '';

        return `img/${imagem}${ color === 'white' ? '_white' : '' }.svg`;
    }
}

function movePiece(fromRow, fromColumn, toRow, toColumn) {   
    _pieces
        .filter(p => p.row == fromRow && p.column == fromColumn)
        .forEach(p => {
            p.row = toRow;
            p.column = toColumn;
            p.moves++;
        });

    draw();
}

function createListeners() {
    
    // Click
    document.querySelectorAll("td")
        .forEach(e => e.addEventListener('click', function(e) {
         
            const clickedsquare = _board[this.dataset.row][this.dataset.column];

            if(hasSquarePiece(this.dataset.row, this.dataset.column)) { // se clicou em peça
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
                promoteQueens();
            }
            else { // clicou em casa vazia
                clearSelectedSquares();
                clearNextMovesMarkers();
            }

            draw();
        }));
}

/** Promote all peoes in the last square to queen */
function promoteQueens() {
    _pieces
        .filter(p => p.piece == PEAO && p.row == 0)
        .forEach(p => p.piece = RAINHA); 
}

function selectSquare(row, column) {
    _board[row][column].selected = true;
}

function printNextMoves(row, column) {
    _pieces
        .filter(p => p.row == row && p.column == column)
        .forEach(p =>
            getMovesFromPiece(p.piece, p.row, p.column)
                .forEach(x => _board[x.row][x.column].canBeNextMove = true)
        );
}

/** Return a array with the possibles moves */
function getMovesFromPiece(piece, row, column) {
    
    const directions =
        piece == PEAO ? getPeaoDirections(row) :
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

    function getPeaoDirections(row) {

        let moves = [ { x: 0, y: -1 } ];

        if(row == 6) moves.push({ x: 0, y: -2 });

        return {
            propagation: false,
            moves
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
    return _pieces
        .filter(p => p.row == row && p.column == column)
        .length > 0
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

/** Returns a array from start to size */
function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}