const gameboard = (function() {
    const board = [];

    const Cell = () => {
        let token = " ";

        const getToken = () => token;
        const setToken = (newToken) => token = newToken;

        return {getToken, setToken};
    }

    // Setup board
    for (let i = 0; i < 3; i++) {
        board[i] = [];
        for (let j = 0; j < 3; j++) {
            board[i].push(Cell());
        }
    }
    
    const getBoard = () => board;

    const selectCell = (row, column, token) => {
        const cellState = board[row][column].getToken();

        // If cell is already taken, stop execution
        if (cellState !== " ") return false;

        // Otherwise select the cell
        board[row][column].setToken(token)
        return true;
    }

    // For console version
    const printBoard = () => {
        board.forEach((row) => {
            let rowString = "";
            for (let j = 0; j < 3; j++) {
                if (row[j].getToken() === " ") {
                    rowString += "_";
                }
                else {
                    rowString += row[j].getToken();
                }
            }
            console.log(rowString);
        })
    }

    return {getBoard, selectCell, printBoard};
})();

const makePlayer = function(name) {
    let token = null

    const getName = () => name;
    const setName = (newName) => name;

    const getToken = () => token;
    const assignToken = (newToken) => token = newToken;

    return {getName, setName, getToken, assignToken};
}

const game = (function() {
    const players = {
        playerOne: makePlayer("Player One"),
        playerTwo: makePlayer("Player Two")
    };

    // Give players tokens
    players.playerOne.assignToken("x");
    players.playerTwo.assignToken("o");

    let activePlayer = players.playerOne;

    const getActivePlayer = () => activePlayer;

    const switchPlayerTurn = () => {
        if (activePlayer === players.playerOne) {
            activePlayer = players.playerTwo;
        }
        else {
            activePlayer = players.playerOne;
        }
    }

    // Console only
    const printNewRound = () => {
        gameboard.printBoard();
        console.log(`It is ${getActivePlayer().getName()}'s turn:`)
    }

    const checkForWin = () => {
        // Check rows
        for (let i = 0; i < 3; i++) {
            let rowString = "";
            for (let j = 0; j < 3; j++) {
                rowString += gameboard.getBoard()[i][j].getToken();
            }
            if (rowString === "xxx" || rowString === "ooo") {
                return true;
            }
        }

        // Check columns
        for (let j = 0; j < 3; j++) {
            let columnString = "";
            for (let i = 0; i < 3; i++) {
                columnString += gameboard.getBoard()[i][j].getToken();
            }
            if (columnString === "xxx" || columnString === "ooo") {
                return true;
            }
        }

        // Check diagonals
        let firstDiagonalString = "";
        for (let i = 0, j = 0; i < 3; i++, j++) {
            firstDiagonalString += gameboard.getBoard()[i][j].getToken();
        }
        if (firstDiagonalString === "xxx" || firstDiagonalString === "ooo") {
            return true;
        }

        let secondDiagonalString = "";
        for (let i = 2, j = 0; i >= 0; i--, j++) {
            secondDiagonalString += gameboard.getBoard()[i][j].getToken();
        }
        if (secondDiagonalString === "xxx" || secondDiagonalString === "ooo") {
            return true;
        }

        // No win
        return false;
    }

    const handleWin = () => {
        gameboard.printBoard();
        console.log(`${getActivePlayer().getName()} wins!`);
    }

    const playRound = (row, column) => {
        const cellSelected = gameboard.selectCell(row, column, getActivePlayer().getToken());
        if (!cellSelected) {
            printNewRound();
            return;
        }
        
        if (checkForWin()) {
            handleWin();
            return;
        }

        switchPlayerTurn();
        printNewRound();
    }

    return {getActivePlayer, playRound}
})();

const displayController = (function() {
    const renderBoard = () => {

        // If UI cells have token text, then remove them
        const cellNodes = document.querySelectorAll(".board > .cell");
        if (cellNodes.item(0).hasChildNodes()) {
            for (const cell of cellNodes) {
                    const tokenText = cell.querySelector(".token-text");
                    cell.removeChild(tokenText);            
            }
        }

        // Get tokens and add to display
        let cellCounter = 1;
        gameboard.getBoard().forEach((row) => {
            row.forEach((cell) => {
                const token = cell.getToken();

                const tokenElem = document.createElement("p");
                tokenElem.classList.add("token-text");
                tokenElem.textContent = token;

                const targetCell = document.querySelector(`#cell-${cellCounter}`);
                targetCell.appendChild(tokenElem);
                cellCounter++;
            })
        });
    }

    return {renderBoard};
})();