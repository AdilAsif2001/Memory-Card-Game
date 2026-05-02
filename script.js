// DOM REFERENCES
// querySelector / getElementById find elements in the HTML by their
// CSS class or id attribute and store them in variables so we can
// reuse them without searching the page every time.

const cards = document.querySelectorAll(".card"); // all 16 card <li> elements
const startBtn = document.getElementById("startBtn"); // the Start Game button
const timerDisplay = document.getElementById("timer"); // the MM:SS display
const congratsOverlay = document.getElementById("congratsOverlay"); // win screen overlay
const finalTimeEl = document.getElementById("finalTime"); // time shown on win screen
const playAgainBtn = document.getElementById("playAgainBtn"); // Play Again button

// GAME STATE VARIABLES
let matchedCard = 0; // how many pairs have been matched so far (max 8)
let cardOne, cardTwo; // the two cards the player has flipped this turn
let disableDeck = false; // true while we're checking a pair — blocks extra clicks
let gameStarted = false; // true after the player presses Start
let timerInterval = null; // holds the setInterval reference so we can stop it later
let elapsedSeconds = 0; // total seconds that have passed since the game started

// TIMER HELPERS
function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// Resets the counter and starts ticking once per second.
function startTimer() {
  elapsedSeconds = 0;
  timerDisplay.textContent = "00:00";
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    timerDisplay.textContent = formatTime(elapsedSeconds);
  }, 1000);
}

// Cancels the interval so the timer stops ticking.
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// CARD FLIP LOGIC.
function flipCard(e) {
  let clickedCard = e.target;

  // Ignore the click if:
  // the player clicked the same card twice (clickedCard === cardOne), or
  // disableDeck is true (we're mid-check after the second flip)
  if (clickedCard !== cardOne && !disableDeck) {
    clickedCard.classList.add("flip");

    if (!cardOne) {
      // First card of this turn — store it and wait for the second click
      return (cardOne = clickedCard);
    }

    // Second card — store it, lock the deck, then check if they match
    cardTwo = clickedCard;
    disableDeck = true;

    // Read the image src from each card's <img> tag to compare them
    let cardOneImg = cardOne.querySelector("img").src,
      cardTwoImg = cardTwo.querySelector("img").src;

    matchCards(cardOneImg, cardTwoImg);
  }
}

// Decides what happens after two cards are flipped.
function matchCards(img1, img2) {
  if (img1 === img2) {
    // MATCH CARD.
    matchedCard++;

    if (matchedCard === 8) {
      // All 8 pairs found — stop the clock and show the win screen.
      stopTimer();
      setTimeout(() => {
        finalTimeEl.textContent = formatTime(elapsedSeconds);
        congratsOverlay.classList.add("show"); // reveals the overlay
      }, 500);
    }

    // Remove the click listener from both matched cards so they can't
    // be flipped again — they stay face-up permanently.
    cardOne.removeEventListener("click", flipCard);
    cardTwo.removeEventListener("click", flipCard);

    // Clear the stored cards and unlock the deck for the next turn
    cardOne = cardTwo = "";
    return (disableDeck = false);
  }

  // NO MATCH, Wait 400 ms (so the player can see the second card) then shake both.
  setTimeout(() => {
    cardOne.classList.add("shake");
    cardTwo.classList.add("shake");
  }, 400);

  // After a further 800 ms (total 1200 ms), flip both cards back over,
  // remove the shake animation, clear stored cards, and unlock the deck.
  setTimeout(() => {
    cardOne.classList.remove("shake", "flip");
    cardTwo.classList.remove("shake", "flip");
    cardOne = cardTwo = "";
    disableDeck = false;
  }, 1200);
}

// SHUFFLE, Randomises which image appears on each of the 16 card slots.
function shuffleCard() {
  // Reset all game-state variables back to their starting values
  matchedCard = 0;
  cardOne = cardTwo = "";
  disableDeck = false;

  // Array of image numbers.
  let arr = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8];

  arr.sort(() => (Math.random() > 0.5 ? 1 : -1));

  // Apply the shuffled order to the actual card elements in the DOM.
  // forEach gives us each card and its position index.
  cards.forEach((card, index) => {
    card.classList.remove("flip"); // make sure every card starts face-down
    let imgTag = card.querySelector("img");
    imgTag.src = `Images/img-${arr[index]}.png`; // assign the shuffled image
  });
}

// BUTTON EVENT LISTENERS
// Start Game button
startBtn.addEventListener("click", () => {
  gameStarted = true;
  startBtn.disabled = true; // prevent double-clicking to restart mid-game
  startBtn.textContent = "Game Started";
  shuffleCard(); // randomise the board
  // Attach a click listener to every card so they respond to flips
  cards.forEach((card) => card.addEventListener("click", flipCard));
  startTimer(); // begin the stopwatch
});

// Play Again button on the win screen.
playAgainBtn.addEventListener("click", () => {
  congratsOverlay.classList.remove("show"); // hide the win screen
  gameStarted = false;
  stopTimer();
  timerDisplay.textContent = "00:00"; // reset the display to zero
  startBtn.disabled = false; // re-enable the Start button
  startBtn.textContent = "▶ Start Game";
  // Remove flip listeners before shuffleCard so cards don't stay interactive
  cards.forEach((card) => card.removeEventListener("click", flipCard));
  shuffleCard(); // randomise for the next game
});

// INITIAL SHUFFLE
shuffleCard();
