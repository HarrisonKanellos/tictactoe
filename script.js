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

    return {getBoard, selectCell};
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

    const playRound = (row, column) => {
        const selectedCell = gameboard.selectCell(row, column, getActivePlayer().getToken());
        if (!selectedCell) {
            return;
        }
        
        if (checkForWin()) {
            displayController.displayWin();
            return;
        }

        switchPlayerTurn();
    }

    return {getActivePlayer, playRound}
})();

const displayController = (function() {
    const topWrapper = document.querySelector(".top-wrapper");
    const textDisplay = document.querySelector(".text-display");
    const boardDisplay = document.querySelector(".board");
    const editNameButton1 = document.querySelector(".player-one-wrapper .edit-name-button");
    const editNameButton2 = document.querySelector(".player-two-wrapper .edit-name-button");

    const handleBoardClick = (event) => {
        const targetCell = event.target.closest(".cell");
        if (targetCell) {
            const row = targetCell.dataset.row;
            const column = targetCell.dataset.column;

            game.playRound(row, column);

            displayActivePlayer();
            renderBoard();
        }
    }

    const handleStartGame = () => {
        const startGameButton = document.querySelector(".start-game");
        topWrapper.removeChild(startGameButton);

        const editNameButtons = document.querySelectorAll(".edit-name-button");
        editNameButtons.forEach((button) => button.remove());

        displayActivePlayer();
        
        boardDisplay.addEventListener("click", handleBoardClick);
    }

    const handlePlayAgain = () => {
        // Remove play again button
        // Remove edit name buttons
        // Switch player tokens
        // Switch starting player
        // Display active player
        boardDisplay.addEventListener("click", handleBoardClick);
    }

    const handlePlayClick = (event) => {
        if (event.target.classList.contains("start-game")) {
            handleStartGame();
        }
        else if (event.target.classList.contains("play-again")) {
            handlePlayAgain();
        }
    }

    topWrapper.addEventListener("click", handlePlayClick);

    const displayActivePlayer = () => {
        textDisplay.textContent = `It is ${game.getActivePlayer().getName()}'s turn. . .`;
    }

    const addPlayAgainButton = () => {
        const playAgainButton = document.createElement("button");
        playAgainButton.setAttribute("type", "button");
        playAgainButton.classList.add("play-again");
        playAgainButton.textContent = "Play Again";
        
        topWrapper.insertBefore(playAgainButton, textDisplay);
    }

    const addEditNameButtons = () => {
        document.querySelector(".player-one-wrapper").appendChild(editNameButton1);
        document.querySelector(".player-two-wrapper").appendChild(editNameButton2);
    }

    const displayWin = () => {
        textDisplay.textContent = `${game.getActivePlayer().getName()} is the Winner!`;
        boardDisplay.removeEventListener("click", handleBoardClick);
        addPlayAgainButton();
        addEditNameButtons();
        renderBoard();
    }

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

                const tokenElem = document.createElement("div");
                tokenElem.classList.add("token-text");
                tokenElem.textContent = token;

                const targetCell = document.querySelector(`#cell-${cellCounter}`);
                targetCell.appendChild(tokenElem);
                cellCounter++;
            })
        });
    }

    return {displayWin}
})();