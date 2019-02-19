const _table = [];

// Peças
const PEAO = 1;
const TORRE = 2;
const CAVALO = 3;
const BISPO = 4;
const REI = 5;
const RAINHA = 6;

// Table
const TABLE_WIDTH = 8;
const TABLE_HEIGHT = 8;

main();

function main() {
    createTable();
    createPieces();
    draw();
}

function createTable() {
    for(let i = 0; i < TABLE_WIDTH; i++) {
        _table[i] = [];

        for(let j = 0; j < TABLE_HEIGHT; j++) {
            _table[i][j] = {
                piece: null,
                pieceColor: 'white',
                tableColor: (i + j) % 2 == 0 ? 'white' : 'black',
                canBeNextMove: false,
                selected: false
            };
        }
    }
}

function movePiece(fromRow, fromColumn, toRow, toColumn) {
    const piece = _table[fromRow][fromColumn];
    _table[fromRow][fromColumn].piece = null;
    _table[toRow][toColumn].piece = piece;
    draw();
}

function createPieces() {
    for(let i = 0; i < TABLE_WIDTH; i++) {
        _table[6][i].piece = PEAO;
    }

    _table[7][0].piece = TORRE;
    _table[7][1].piece = CAVALO;
    _table[7][2].piece = BISPO;
    _table[7][3].piece = REI;
    _table[7][4].piece = RAINHA;
    _table[7][5].piece = BISPO;
    _table[7][6].piece = CAVALO;
    _table[7][7].piece = TORRE;
}

function draw() {
    let html = '<table>';
    for(let i = 0; i < _table.length; i++) {
        html += '<tr>';
        
        for(let j = 0; j < _table[i].length; j++) {
            const celula = _table[i][j];
            const backgroundColorClass = celula.tableColor;
            const pieceHoverClass = celula.piece == null ? '' : 'pieceHover';
            const canBeNextMove = celula.canBeNextMove == false ? '' : 'canBeNextMove';
            const selected = celula.selected == false ? '' : 'selected';

            html += `<td
                        data-row="${i}"
                        data-column="${j}"
                        class="${backgroundColorClass} ${pieceHoverClass} ${canBeNextMove} ${selected}">
                        <img height="50" src="${getImageFromPiece(_table[i][j].piece)}" />
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
            
            const clickedCell = _table[this.dataset.row][this.dataset.column];

            if(clickedCell.piece != null) { // se clicou em peça
                clearSelectedCells();
                selectCell(this.dataset.row, this.dataset.column);
                clearNextMovesMarkers();
                printNextMoves(this.dataset.row, this.dataset.column);
            }
            else if(clickedCell.canBeNextMove == true) { // se clicou para mover peça
                let previousSelectedCell = null;

                for(let i = 0; i < _table.length; i++) {
                    for(let j = 0; j < _table[i].length; j++) {
                        if(_table[i][j].selected) {
                            previousSelectedCell = { row: i, column: j };
                            break;
                        }
                    }
                }

                if(previousSelectedCell != null) {
                    movePiece(previousSelectedCell.row,
                        previousSelectedCell.column,
                        this.dataset.row,
                        this.dataset.column);
                }
                
                clearNextMovesMarkers();
                clearSelectedCells();
            }

            draw();
        }));
}

function selectCell(row, column) {
    if(_table[row][column].piece != null) {
        _table[row][column].selected = true;
    }
}

function printNextMoves(row, column) {
    if(_table[row][column].piece != null) {
        getMovesFromPiece(_table[row][column].piece, row, column)
        .forEach(x => _table[x.row][x.column].canBeNextMove = true);
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
            .filter(piece => inTable(piece.row, piece.column))
            .filter(piece => !hasCellPiece(piece.row, piece.column));

        function removeCollapses(pieces) {
            return pieces.filter(piece => !hasCellPiece(piece.row, piece.column));
        }

        function calculaCasas(row, column, directions) {

            if(!directions.propagation)
                return directions.moves.map(d =>
                    ({ row: Number(row) + d.y, column: Number(column) + d.x })
                );

            let moves = [];
            directions.moves.forEach(move => { // para cada direção
                
                let cell = { row: Number(row) + move.y, column: Number(column) + move.x };

                while(inTable(cell.row, cell.column) && !hasCellPiece(cell.row, cell.column)) {
                    moves.push({ row: cell.row, column: cell.column });
                    cell.row += move.y;
                    cell.column += move.x;
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
    for(let i = 0; i < TABLE_WIDTH; i++) {
        for(let j = 0; j < TABLE_HEIGHT; j++) {
            _table[i][j].canBeNextMove = false;
        }
    }
}

/** Clear the "Selected cell" status from all cells */
function clearSelectedCells() {
    for(let i = 0; i < TABLE_WIDTH; i++) {
        for(let j = 0; j < TABLE_HEIGHT; j++) {
            _table[i][j].selected = false;
        }
    }
}

function hasCellPiece(row, column) {
    return _table[row][column].piece != null;
}

function inTable(row, column) {
    return row >= 0 && row < TABLE_HEIGHT && column >= 0 && column < TABLE_WIDTH;
}