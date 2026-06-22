const STORAGE_KEY = "callbreakScorekeeper";

let game = {
  players: ["Player 1", "Player 2", "Player 3", "Player 4"],
  rounds: [],
  currentCalls: null,
  namesSaved: false
};

const playerInputs = [
  document.getElementById("player0"),
  document.getElementById("player1"),
  document.getElementById("player2"),
  document.getElementById("player3")
];

const savePlayersBtn = document.getElementById("savePlayersBtn");
const newGameBtn = document.getElementById("newGameBtn");
const newGameAfterCompleteBtn = document.getElementById("newGameAfterCompleteBtn");
const saveCallsBtn = document.getElementById("saveCallsBtn");
const saveRoundBtn = document.getElementById("saveRoundBtn");
const undoBtn = document.getElementById("undoBtn");

const roundTitle = document.getElementById("roundTitle");
const roundNumber = document.getElementById("roundNumber");
const errorMsg = document.getElementById("errorMsg");
const playerErrorMsg = document.getElementById("playerErrorMsg");

const roundEntryBox = document.getElementById("roundEntryBox");
const gameCompleteBox = document.getElementById("gameCompleteBox");

const callTab = document.getElementById("callTab");
const wonTab = document.getElementById("wonTab");
const callStep = document.getElementById("callStep");
const wonStep = document.getElementById("wonStep");

const callForm = document.getElementById("callForm");
const wonForm = document.getElementById("wonForm");

const scoreboard = document.getElementById("scoreboard");
const historyHead = document.getElementById("historyHead");
const historyBody = document.getElementById("historyBody");
const historyCards = document.getElementById("historyCards");

const navButtons = document.querySelectorAll(".nav-btn");
const screens = document.querySelectorAll(".screen");


function showScreen(screenId) {
  if (!game.namesSaved && screenId !== "playersScreen") {
    playerErrorMsg.textContent = "Save player names first before starting the game.";
    screenId = "playersScreen";
  }

  screens.forEach((screen) => {
    screen.classList.remove("active");
  });

  navButtons.forEach((button) => {
    button.classList.remove("active");
  });

  document.getElementById(screenId).classList.add("active");

  const activeButton = document.querySelector(`[data-screen="${screenId}"]`);
  if (activeButton) {
    activeButton.classList.add("active");
  }
}

function updateNavigationLock() {
  navButtons.forEach((button) => {
    const screenId = button.dataset.screen;

    if (screenId === "playersScreen") {
      button.disabled = false;
      button.classList.remove("locked");
      return;
    }

    if (game.namesSaved) {
      button.disabled = false;
      button.classList.remove("locked");
    } else {
      button.disabled = true;
      button.classList.add("locked");
    }
  });
}

function updatePlayerLock() {
  const shouldLockPlayers = game.namesSaved;

  playerInputs.forEach((input) => {
    input.disabled = shouldLockPlayers;
  });

  if (shouldLockPlayers) {
    savePlayersBtn.textContent = "Names Saved";
    savePlayersBtn.disabled = true;
  } else {
    savePlayersBtn.textContent = "Save Names";
    savePlayersBtn.disabled = false;
  }
}

function saveGame() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
}

function loadGame() {
  const savedGame = localStorage.getItem(STORAGE_KEY);

  if (savedGame) {
    game = JSON.parse(savedGame);
  }

  if (!Array.isArray(game.players)) {
    game.players = ["Player 1", "Player 2", "Player 3", "Player 4"];
  }

  if (!Array.isArray(game.rounds)) {
    game.rounds = [];
  }

  if (!game.currentCalls) {
    game.currentCalls = null;
  }

  if (typeof game.namesSaved !== "boolean") {
    game.namesSaved = false;
  }

  playerInputs.forEach((input, index) => {
    input.value = game.players[index] || `Player ${index + 1}`;
  });
}

function isGameComplete() {
  return game.rounds.length >= 5;
}

function calculateRoundScore(call, won) {
  call = Number(call);
  won = Number(won);

  if (won < call) {
    return -call;
  }

  const extraTricks = won - call;
  return call + extraTricks / 10;
}

function formatScore(score) {
  const rounded = Math.round(score * 10) / 10;

  if (Number.isInteger(rounded)) {
    return String(rounded);
  }

  return rounded.toFixed(1);
}

function getTotals() {
  const totals = [0, 0, 0, 0];

  game.rounds.forEach((round) => {
    round.players.forEach((playerRound, index) => {
      totals[index] += calculateRoundScore(playerRound.call, playerRound.won);
    });
  });

  return totals;
}

function getRankLabel(index) {
  const labels = ["1st Place", "2nd Place", "3rd Place", "Last Place"];
  return labels[index];
}

function getRankedPlayers() {
  const totals = getTotals();

  return game.players
    .map((name, index) => {
      return {
        name,
        total: totals[index]
      };
    })
    .sort((a, b) => b.total - a.total);
}

function renderCallForm() {
  callForm.innerHTML = "";

  game.players.forEach((player, index) => {
    const box = document.createElement("div");
    box.className = "player-round-box";

    const savedValue = game.currentCalls ? game.currentCalls[index] : "";

    box.innerHTML = `
      <h3>${player}</h3>

      <label>
        Call
        <input 
          id="call${index}" 
          type="number" 
          min="1" 
          max="13" 
          inputmode="numeric"
          placeholder="0"
          value="${savedValue}"
        />
      </label>
    `;

    callForm.appendChild(box);
  });
}

function renderWonForm() {
  wonForm.innerHTML = "";

  if (!game.currentCalls) {
    return;
  }

  game.players.forEach((player, index) => {
    const box = document.createElement("div");
    box.className = "player-round-box";

    box.innerHTML = `
      <h3>${player}</h3>

      <p class="saved-call">Called: ${game.currentCalls[index]}</p>

      <label>
        Won
        <input 
          id="won${index}" 
          type="number" 
          min="0" 
          max="13" 
          inputmode="numeric"
          placeholder="0"
        />
      </label>
    `;

    wonForm.appendChild(box);
  });
}

function renderRoundEntry() {
  const nextRound = game.rounds.length + 1;

  if (!game.namesSaved) {
    roundTitle.textContent = "Save Names First";
    roundNumber.textContent = "Locked";
    roundEntryBox.classList.add("hidden");
    gameCompleteBox.classList.add("hidden");
    return;
  }

  if (isGameComplete()) {
    roundTitle.textContent = "Game Finished";
    roundNumber.textContent = "5 of 5 Rounds Complete";

    roundEntryBox.classList.add("hidden");
    gameCompleteBox.classList.remove("hidden");
    return;
  }

  roundTitle.textContent = "Round Entry";
  roundNumber.textContent = `Round ${nextRound} of 5`;

  roundEntryBox.classList.remove("hidden");
  gameCompleteBox.classList.add("hidden");

  renderCallForm();
  renderWonForm();

  if (game.currentCalls) {
    callStep.classList.add("hidden");
    wonStep.classList.remove("hidden");

    callTab.classList.remove("active");
    wonTab.classList.add("active");
  } else {
    callStep.classList.remove("hidden");
    wonStep.classList.add("hidden");

    callTab.classList.add("active");
    wonTab.classList.remove("active");
  }
}

function renderScoreboard() {
  const rankedPlayers = getRankedPlayers();

  scoreboard.innerHTML = "";

  rankedPlayers.forEach((player, rankIndex) => {
    const card = document.createElement("div");

    card.className = "score-card";

    if (rankIndex === 0 && game.rounds.length > 0) {
      card.classList.add("first");
    }

    if (rankIndex === 3 && game.rounds.length > 0) {
      card.classList.add("last");
    }

    const rankText = game.rounds.length > 0 ? getRankLabel(rankIndex) : "No Rank Yet";

    card.innerHTML = `
      <span class="rank">${rankText}</span>
      <h3>${player.name}</h3>
      <div class="score">${formatScore(player.total)}</div>
    `;

    scoreboard.appendChild(card);
  });
}

function renderHistoryTable() {
  historyHead.innerHTML = "";
  historyBody.innerHTML = "";

  const headerRow = document.createElement("tr");

  headerRow.innerHTML = `
    <th>Round</th>
    ${game.players.map(player => `<th>${player}<br>Call / Won / Score</th>`).join("")}
  `;

  historyHead.appendChild(headerRow);

  if (game.rounds.length === 0) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td colspan="5" class="empty-history">
        No rounds added yet.
      </td>
    `;

    historyBody.appendChild(row);
    return;
  }

  game.rounds.forEach((round, roundIndex) => {
    const row = document.createElement("tr");

    const playerCells = round.players.map((playerRound) => {
      const score = calculateRoundScore(playerRound.call, playerRound.won);
      const scoreClass = score < 0 ? "negative" : "positive";

      return `
        <td>
          ${playerRound.call} / ${playerRound.won} /
          <span class="${scoreClass}">
            ${formatScore(score)}
          </span>
        </td>
      `;
    }).join("");

    row.innerHTML = `
      <td>${roundIndex + 1}</td>
      ${playerCells}
    `;

    historyBody.appendChild(row);
  });
}

function renderEverything() {
  updateNavigationLock();
  updatePlayerLock();
  renderRoundEntry();
  renderScoreboard();
  renderHistoryTable();
  saveGame();
}

function savePlayerNames() {
  const names = playerInputs.map((input, index) => {
    const name = input.value.trim();
    return name || `Player ${index + 1}`;
  });

  game.players = names;
  game.namesSaved = true;

  playerErrorMsg.textContent = "";
  errorMsg.textContent = "";

  renderEverything();
  showScreen("roundScreen");
}

function saveCalls() {
  errorMsg.textContent = "";

  if (!game.namesSaved) {
    errorMsg.textContent = "Save player names first.";
    showScreen("playersScreen");
    return;
  }

  if (isGameComplete()) {
    errorMsg.textContent = "This game is already complete. Start a new game.";
    return;
  }

  const calls = [];

  for (let i = 0; i < 4; i++) {
    const callInput = document.getElementById(`call${i}`);
    const call = Number(callInput.value);

    if (!Number.isInteger(call) || call < 1 || call > 13) {
      errorMsg.textContent = `${game.players[i]}'s call must be between 1 and 13.`;
      return;
    }

    calls.push(call);
  }

  game.currentCalls = calls;

  renderEverything();
  showScreen("roundScreen");
}

function saveRound() {
  errorMsg.textContent = "";

  if (!game.namesSaved) {
    errorMsg.textContent = "Save player names first.";
    showScreen("playersScreen");
    return;
  }

  if (!game.currentCalls) {
    errorMsg.textContent = "Enter calls first.";
    return;
  }

  if (isGameComplete()) {
    errorMsg.textContent = "This game is already complete. Start a new game.";
    return;
  }

  const roundPlayers = [];

  for (let i = 0; i < 4; i++) {
    const wonInput = document.getElementById(`won${i}`);
    const won = Number(wonInput.value);

    if (!Number.isInteger(won) || won < 0 || won > 13) {
      errorMsg.textContent = `${game.players[i]}'s won tricks must be between 0 and 13.`;
      return;
    }

    roundPlayers.push({
      call: game.currentCalls[i],
      won: won
    });
  }

  const totalWon = roundPlayers.reduce((sum, playerRound) => {
    return sum + playerRound.won;
  }, 0);

  if (totalWon !== 13) {
    errorMsg.textContent = `Total tricks won must equal 13. Right now it is ${totalWon}.`;
    return;
  }

  game.rounds.push({
    players: roundPlayers
  });

  game.currentCalls = null;

  renderEverything();

  if (isGameComplete()) {
    showScreen("scoreboardScreen");
  } else {
    showScreen("roundScreen");
  }
}

function undoLastRound() {
  if (!game.namesSaved) {
    playerErrorMsg.textContent = "Save player names first before using game controls.";
    showScreen("playersScreen");
    return;
  }

  if (game.currentCalls) {
    game.currentCalls = null;
    errorMsg.textContent = "";

    renderEverything();
    showScreen("roundScreen");
    return;
  }

  if (game.rounds.length === 0) {
    errorMsg.textContent = "There is no round to undo.";
    showScreen("roundScreen");
    return;
  }

  game.rounds.pop();
  errorMsg.textContent = "";

  renderEverything();
  showScreen("roundScreen");
}

function startNewGame() {
  const confirmed = confirm("Start a new game? This will erase the current scores and unlock player names.");

  if (!confirmed) {
    return;
  }

  game = {
    players: ["Player 1", "Player 2", "Player 3", "Player 4"],
    rounds: [],
    currentCalls: null,
    namesSaved: false
  };

  playerInputs.forEach((input, index) => {
    input.value = game.players[index];
  });

  playerErrorMsg.textContent = "";
  errorMsg.textContent = "";

  renderEverything();
  showScreen("playersScreen");
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.screen);
  });
});

savePlayersBtn.addEventListener("click", savePlayerNames);
saveCallsBtn.addEventListener("click", saveCalls);
saveRoundBtn.addEventListener("click", saveRound);
undoBtn.addEventListener("click", undoLastRound);
newGameBtn.addEventListener("click", startNewGame);
newGameAfterCompleteBtn.addEventListener("click", startNewGame);

loadGame();
renderEverything();

if (!game.namesSaved) {
  showScreen("playersScreen");
}