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

    const clearBoard = () => {
        board.forEach((row) => {
            row.forEach((cell) => {
                cell.setToken(" ");
            })
        })
    }

    return {getBoard, selectCell, clearBoard};
})();

const makePlayer = function(name) {
    let token = null

    const getName = () => name;
    const setName = (newName) => name = newName;

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
    players.playerOne.assignToken("X");
    players.playerTwo.assignToken("O");

    let startingPlayer = players.playerOne;
    let activePlayer = startingPlayer;

    const getActivePlayer = () => activePlayer;

    const getPlayers = () => players;

    const switchPlayerTurn = () => {
        if (activePlayer === players.playerOne) {
            activePlayer = players.playerTwo;
        }
        else {
            activePlayer = players.playerOne;
        }
    }

    const switchPlayerTokens = () => {
        if (players.playerOne.getToken() === "X") {
            players.playerOne.assignToken("O");
            players.playerTwo.assignToken("X");
        }
        else {
            players.playerOne.assignToken("X");
            players.playerTwo.assignToken("O");
        }
    }

    const switchStartingPlayer = () => {
        if (players.playerOne.getToken() === "X") {
            startingPlayer = players.playerOne;
            activePlayer = startingPlayer;
        }
        else {
            startingPlayer = players.playerTwo;
            activePlayer = startingPlayer;
        }
    }

    const checkForWin = () => {
        // Check rows
        for (let i = 0; i < 3; i++) {
            let rowString = "";
            for (let j = 0; j < 3; j++) {
                rowString += gameboard.getBoard()[i][j].getToken();
            }
            if (rowString === "XXX" || rowString === "OOO") {
                return true;
            }
        }

        // Check columns
        for (let j = 0; j < 3; j++) {
            let columnString = "";
            for (let i = 0; i < 3; i++) {
                columnString += gameboard.getBoard()[i][j].getToken();
            }
            if (columnString === "XXX" || columnString === "OOO") {
                return true;
            }
        }

        // Check diagonals
        let firstDiagonalString = "";
        for (let i = 0, j = 0; i < 3; i++, j++) {
            firstDiagonalString += gameboard.getBoard()[i][j].getToken();
        }
        if (firstDiagonalString === "XXX" || firstDiagonalString === "OOO") {
            return true;
        }

        let secondDiagonalString = "";
        for (let i = 2, j = 0; i >= 0; i--, j++) {
            secondDiagonalString += gameboard.getBoard()[i][j].getToken();
        }
        if (secondDiagonalString === "XXX" || secondDiagonalString === "OOO") {
            return true;
        }

        // No win
        return false;
    }

    const checkForDraw = () => {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (gameboard.getBoard()[i][j].getToken() === " ") {
                    return false;
                }
            }
        }
        return true;
    }

    const playRound = (row, column) => {
        const selectedCell = gameboard.selectCell(row, column, getActivePlayer().getToken());
        if (!selectedCell) {
            return;
        }
        
        else if (checkForWin()) {
            return "win";
        }

        else if (checkForDraw()) {
            return "draw";
        }

        switchPlayerTurn();
    }

    const playAgain = () => {
        switchPlayerTokens();
        switchStartingPlayer();
        gameboard.clearBoard();
    }

    return {getPlayers, getActivePlayer, playRound, playAgain}
})();

const displayController = (function() {
    const topWrapper = document.querySelector(".top-wrapper");
    const textDisplay = document.querySelector(".text-display");
    const boardDisplay = document.querySelector(".board");
    const bottomWrapper = document.querySelector(".bottom-wrapper");
    const editNameButton1 = document.querySelector("#edit-player-one");
    const editNameButton2 = document.querySelector("#edit-player-two");
    const playerOneName = document.querySelector(".player-one-wrapper .player-name");
    const playerTwoName = document.querySelector(".player-two-wrapper .player-name");

    playerOneName.textContent = game.getPlayers().playerOne.getName();
    playerTwoName.textContent = game.getPlayers().playerTwo.getName();

    const handleBoardClick = (event) => {
        const targetCell = event.target.closest(".cell");
        if (targetCell) {
            const row = targetCell.dataset.row;
            const column = targetCell.dataset.column;

            const outcome = game.playRound(row, column);
            if (outcome === "win") {
                displayWin();
            }
            else if (outcome === "draw") {
                displayDraw();
            }
            else {
                displayActivePlayer();
            }

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
        const playAgainButton = document.querySelector(".play-again");
        topWrapper.removeChild(playAgainButton);

        const editNameButtons = document.querySelectorAll(".edit-name-button");
        editNameButtons.forEach((button) => button.remove());

        game.playAgain();

        displayActivePlayer();
        renderBoard();

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

    const handleNameClick = (event) => {
        const id = event.target.id;
        if (id === "edit-player-one") {
            const playerOneWrapper = document.querySelector(".player-one-wrapper");
            
            playerOneWrapper.removeChild(playerOneName);
            playerOneWrapper.removeChild(editNameButton1);

            const nameInput = document.createElement("input");
            nameInput.setAttribute("type", "text");
            nameInput.setAttribute("name", "player-one-name");
            nameInput.setAttribute("id", "player-one-name");
            nameInput.classList.add("name-input");
            nameInput.value = game.getPlayers().playerOne.getName();

            const saveButton = document.createElement("button");
            saveButton.setAttribute("type", "button");
            saveButton.classList.add("save-button");
            saveButton.setAttribute("id", "save-player-one");

            const label = playerOneWrapper.querySelector(".player-title");
            label.setAttribute("for", "player-one-name")

            playerOneWrapper.appendChild(nameInput);
            playerOneWrapper.appendChild(saveButton);
        }

        else if (id === "edit-player-two") {
            const playerTwoWrapper = document.querySelector(".player-two-wrapper");
            
            playerTwoWrapper.removeChild(playerTwoName);
            playerTwoWrapper.removeChild(editNameButton2);

            const nameInput = document.createElement("input");
            nameInput.setAttribute("type", "text");
            nameInput.setAttribute("name", "player-two-name");
            nameInput.setAttribute("id", "player-two-name");
            nameInput.classList.add("name-input");
            nameInput.value = game.getPlayers().playerTwo.getName();

            const saveButton = document.createElement("button");
            saveButton.setAttribute("type", "button");
            saveButton.classList.add("save-button");
            saveButton.setAttribute("id", "save-player-two");

            const label = playerTwoWrapper.querySelector(".player-title");
            label.setAttribute("for", "player-two-name");

            playerTwoWrapper.appendChild(nameInput);
            playerTwoWrapper.appendChild(saveButton);
        }

        else if (id === "save-player-one") {
            const playerOneWrapper = document.querySelector(".player-one-wrapper");
            const nameInput = document.querySelector("#player-one-name");
            const saveButton = playerOneWrapper.querySelector(".save-button");

            const newName = nameInput.value;
            game.getPlayers().playerOne.setName(newName);

            playerOneWrapper.removeChild(nameInput);
            playerOneWrapper.removeChild(saveButton);

            playerOneName.textContent = newName;

            playerOneWrapper.appendChild(playerOneName);
            playerOneWrapper.appendChild(editNameButton1);
        }

        else if (id === "save-player-two") {
            const playerTwoWrapper = document.querySelector(".player-two-wrapper");
            const nameInput = document.querySelector("#player-two-name");
            const saveButton = playerTwoWrapper.querySelector(".save-button");

            const newName = nameInput.value;
            game.getPlayers().playerTwo.setName(newName);

            playerTwoWrapper.removeChild(nameInput);
            playerTwoWrapper.removeChild(saveButton);

            playerTwoName.textContent = newName;

            playerTwoWrapper.appendChild(playerTwoName);
            playerTwoWrapper.appendChild(editNameButton2);
        }
    }

    bottomWrapper.addEventListener("click", handleNameClick);

    const displayActivePlayer = () => {
        textDisplay.textContent = `${game.getActivePlayer().getName()}'s turn. . .`;
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
    }

    const displayDraw = () => {
        textDisplay.textContent = "It is a draw.";
        boardDisplay.removeEventListener("click", handleBoardClick);
        addPlayAgainButton();
        addEditNameButtons();
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
})();