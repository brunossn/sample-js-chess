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

// Move modes
const ALWAYS = 0;
const ONLY_ON_ENEMY = 1;
const NOT_ON_ENEMY = 2;

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

    function createPiece(piece, row, column, color) { // helper to create pieces faster
        return ({ piece, row, column, moves: 0, color, killed: false });
    }

    function whitePieces() {
        //range(8).forEach(n => _pieces.push(createPiece(PEAO, 1, n, 'white')));
        _pieces.push(createPiece(TORRE, 0, 0, 'white'));
        _pieces.push(createPiece(CAVALO, 0, 1 ,'white'));
        _pieces.push(createPiece(BISPO, 0, 2 ,'white'));
        _pieces.push(createPiece(REI, 0, 3 ,'white'));
        _pieces.push(createPiece(RAINHA, 0, 4 ,'white'));
        _pieces.push(createPiece(BISPO, 0, 5 ,'white'));
        _pieces.push(createPiece(CAVALO, 0, 6 ,'white'));
        _pieces.push(createPiece(TORRE, 0, 7 ,'white'));
    }

    function blackPieces() {
        range(8).forEach(n => _pieces.push(createPiece(PEAO, 6, n ,'black' )));
        _pieces.push(createPiece(TORRE, 7, 0 ,'black'));
        _pieces.push(createPiece(CAVALO, 7, 1 ,'black'));
        _pieces.push(createPiece(BISPO, 7, 2 ,'black'));
        _pieces.push(createPiece(REI, 7, 3 ,'black'));
        _pieces.push(createPiece(RAINHA, 7, 4 ,'black'));
        _pieces.push(createPiece(BISPO, 7, 5 ,'black'));
        _pieces.push(createPiece(CAVALO, 7, 6 ,'black'));
        _pieces.push(createPiece(TORRE, 7, 7 ,'black'));
    }
}

function draw() {
    drawBoard();
    createListeners();

    function drawBoard() {
        let html = '<table>';

        for(let i = 0; i < _board.length; i++) {
            html += '<tr>';

            for(let j = 0; j < _board[i].length; j++) {

                const square = _board[i][j];

                const backgroundColorClass = square.squareColor;
                const pieceHoverClass = hasSquarePiece(i, j) ? 'pieceHover' : '';
                const canBeNextMove = square.canBeNextMove == false ? '' : 'canBeNextMove';
                const selected = square.selected == false ? '' : 'selected';
                const hasPieceClass = hasSquarePiece(i, j) ? 'hasPiece' : '';

                const piece = _pieces.filter(p => p.row == i && p.column == j && !p.killed)[0];

                const inCheck = (piece != undefined && piece.piece == REI && isInCheck(piece.color))
                    ? 'inCheck' : '';

                html += `<td
                            data-row="${i}"
                            data-column="${j}"
                            class="${backgroundColorClass} ${pieceHoverClass} ${canBeNextMove} ${selected} ${hasPieceClass} ${inCheck}">
                            ${ (piece != undefined ? `<img height="50" src="${getImageFromPiece(piece.piece, piece.color)}" />` : '') }
                        </td>`;
            }
            
            html += '</tr>'; 
        }

        html += '</table>';

        document.querySelector('#chess').innerHTML = html;

        function getImageFromPiece(piece, color) {

            if(piece == null || piece == undefined) return '';
    
            const imagem = 
                piece == TORRE ? 'torre' :
                piece == CAVALO ? 'cavalo' :
                piece == BISPO ? 'bispo' :
                piece == REI ? 'rei' :
                piece == RAINHA ? 'rainha' :
                piece == PEAO ? 'peao' : '';
    
            return `img/${imagem}${ color == 'white' ? '_white' : '' }.svg`;
        }
    }
}

function isInCheck(color) {
    const king = _pieces.filter(p => p.piece == REI && p.color == color)[0];

    return _pieces
        .filter(p => p.color == toggleColor(color))
        .flatMap(p => getMovesFromPiece(p.piece, p.row, p.column, p.color, p.moves))
        .filter(x => x.row == king.row && x.column == king.column)
        .length > 0;
}

function toggleColor(color) {
    return color == 'white' ? 'black' : 'white';
}

function onClick(row, column) {

    if(hasSquarePiece(row, column, 'black')) { // se clicou em peça
        clearSelectedSquares();
        selectSquare(row, column);
        clearNextMovesMarkers();
        printNextMoves(row, column);
    }
    else if(_board[row][column].canBeNextMove == true) { // se clicou para mover peça  
        filterSquares(square => square.selected)
        .forEach(square => {
            killEnimies(row, column, 'black');
            movePiece(square.row, square.column, row, column);
        });
            
        clearNextMovesMarkers();
        clearSelectedSquares();
        promoteQueens();
    }
    else { // clicou em casa vazia
        clearSelectedSquares();
        clearNextMovesMarkers();
    }

    draw();
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
            onClick(this.dataset.row, this.dataset.column);
        }));
}

function killEnimies(row, column, pieceColor) {
    _pieces
        .filter(p => p.row == row && p.column == column && p.color != pieceColor)
        .forEach(p => {
            p.killed = true;
            p.row = null;
            p.column = null;
        });
}

/** Promote all peoes in the last square to queen */
function promoteQueens() {
    _pieces
        .filter(p => p.piece === PEAO && p.row === 0)
        .forEach(p => p.piece = RAINHA); 
}

function selectSquare(row, column) {
    _board[row][column].selected = true;
}

function printNextMoves(row, column) {
    _pieces
        .filter(p => p.row == Number(row) && p.column == Number(column))
        .forEach(p =>
            getMovesFromPiece(p.piece, p.row, p.column, p.color, p.moves)
                .forEach(x => _board[x.row][x.column].canBeNextMove = true)
        );
}

/** Return a array with the possibles moves */
function getMovesFromPiece(piece, row, column, pieceColor, moves) {

    const directions = getDirections(moves, pieceColor, row, column);
    return propagationMoves(row, column, directions, pieceColor);
    
    function getDirections(moves, pieceColor, row, column) {
        return piece == PEAO ? getPeaoDirections(moves, pieceColor) :
        piece == TORRE ? getTorreDirections(row, column) :
        piece == CAVALO ? getCavaloDirections() :
        piece == BISPO ? getBispoDirections() :
        piece == REI ? getReiDirections() :
        piece == RAINHA ? getRainhaDirections() :
        [];
    }

    function propagationMoves(row, column, directions, pieceColor) {

        const moves = [];

        directions.moves.forEach(d => { // para cada direção

            let collapses = false;
            let nextRow = Number(row);
            let nextColumn = Number(column);
            
            while(!collapses) {

                nextRow += d.y;
                nextColumn += d.x;

                const nextSquare = { row: nextRow, column: nextColumn };

                const isInBoard = inBoard(nextSquare.row, nextSquare.column);
                const pieceReached = hasSquarePiece(nextSquare.row, nextSquare.column, pieceColor);
                const enemyReached = hasSquarePiece(nextSquare.row, nextSquare.column) && !pieceReached;

                if(isInBoard && !pieceReached) {

                    if((d.mode == ONLY_ON_ENEMY && enemyReached) ||
                        (d.mode == NOT_ON_ENEMY && !enemyReached) ||
                        (d.mode != ONLY_ON_ENEMY && d.mode != NOT_ON_ENEMY)) // some moves require an enemy in the next square
                        moves.push(nextSquare);

                    if(enemyReached) collapses = true; // allow move to enemy square
                    if(!directions.propagation) collapses = true; // if not propagation, move only 1 square
                }
                else {
                    collapses = true;
                }
            }
        });

        return moves;
    }

    function getPeaoDirections(previousMoves, pieceColor) {

        let nextMoves = [
            { x: 0, y: -1, mode: NOT_ON_ENEMY },
            { x: 1, y: -1, mode: ONLY_ON_ENEMY },
            { x: -1, y: -1, mode: ONLY_ON_ENEMY }
        ];

        if(previousMoves == 0) nextMoves.push({ x: 0, y: -2 });
        if(pieceColor == 'white') nextMoves.forEach(m => m.y = m.y * -1);

        return {
            propagation: false,
            moves: nextMoves
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
function hasSquarePiece(row, column, pieceColor = '') {
    return _pieces
        .filter(p => p.row == row && p.column == column &&
            (pieceColor == '' || p.color == pieceColor))
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