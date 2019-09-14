import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import TweenLite from 'gsap/TweenLite';
import TimelineLite from 'gsap/TimelineLite';
import { Sine } from 'gsap/EasePack';
import DrawSVGPlugin from '../../../lib/DrawSVGPlugin';

const plugins = [DrawSVGPlugin]; // eslint-disable-line no-unused-vars

let hangmanWord = '';
let guessedLetters = [];
let guessesLeft = 6;
let showingError = false;
let randomWords = null;
const timeline = new TimelineLite();

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  const guessInput = document.querySelector('#guessInput');
  const wordInput = document.querySelector('#wordInput');
  const guessesLeftEl = document.querySelector('#guessesLeft');
  const wordDisplayEl = document.querySelector('#wordDisplay');
  const guessedLettersContainerEl = document.querySelector('#guessedLettersContainer');
  const guessedLettersEl = document.querySelector('#guessedLetters');
  const setWordButton = document.querySelector('#setWord');
  const randomWordButton = document.querySelector('#randomWord');
  const submitGuessButton = document.querySelector('#submitGuess');
  const errorMessage = document.querySelector('#setWordModal #error');

  const setWord = word => {
    hangmanWord = word.toUpperCase(); // Convert word to uppercase
    guessedLetters = []; // Clear guessed letters
    guessesLeft = 6; // Set 6 guesses

    // Reset DOM elements
    guessedLettersContainerEl.classList.add('uk-hidden');
    guessesLeftEl.innerHTML = `${guessesLeft} guesses left`;
    wordInput.value = '';
    wordInput.classList.remove('uk-form-danger');
    if (showingError) {
      errorMessage.classList.remove('uk-animation-slide-top-small');
      errorMessage.setAttribute('hidden', '');
      setWordButton.disabled = true;
      showingError = false;
    }
    wordDisplayEl.innerHTML = '';
    wordDisplayEl.classList.remove('lost');
    guessedLettersEl.innerHTML = '';
    document.querySelectorAll('.letter-tile').forEach(guessXs => {
      guessXs.classList.remove('correct', 'incorrect');
    });
    for (let i = 0; i < word.length; i++) {
      const span = document.createElement('span');
      span.classList.add('letter');
      span.innerHTML = '&emsp;';
      wordDisplayEl.appendChild(span);
    }

    timeline.clear().to(document.querySelectorAll('#man path, #eyes path'), 0.3, { drawSVG: '0%' });
  };

  const guess = letter => {
    guessInput.value = '';
    if (letter.match(/[^A-Za-z]/)) {
      // Invalid guess
      guessInput.focus();
    } else if (guessedLetters.indexOf(letter) !== -1) {
      // Letter already guessed
      guessInput.focus();
    } else if (guessedLetters.indexOf(letter) === -1) {
      // Check if letter has not been guessed
      guessedLettersContainerEl.classList.remove('uk-hidden');
      guessedLetters.push(letter); // Add guessed letter to guessedLetters
      const guessedLetterEl = document.createElement('span');
      guessedLetterEl.classList.add('letter');
      guessedLetterEl.innerHTML = letter;
      let offset = 0;
      let index = hangmanWord.indexOf(letter, offset); // Get index of guess in the word
      if (index !== -1) {
        // Guessed letter is in the word
        guessedLetterEl.classList.add('correct');
        document.querySelector(`.letter-tile[data-letter='${letter}']`).classList.add('correct');
        while (index !== -1) {
          // While guessed letter is still in word
          const space = document.querySelectorAll('#wordDisplay .letter')[index]; // Get blank space where letter is
          space.innerHTML = letter; // Set content of blank to the letter
          space.classList.add('correct');
          offset = index + 1;
          index = hangmanWord.indexOf(letter, offset); // Get next occurence of letter
        }
        if (wordDisplayEl.innerHTML.replace(/<[^<>]*>/g, '') === hangmanWord) {
          // Word has been guessed
          guessesLeft = -1;
          UIkit.notification('You win!');
        } else {
          guessInput.focus();
        }
      } else {
        // Guessed letter is not in the word
        guessedLetterEl.classList.add('incorrect');
        guessesLeft--;
        guessesLeftEl.innerHTML =
          guessesLeft === 1 ? `${guessesLeft} guess left` : `${guessesLeft} guesses left`;
        timeline.to(
          document.querySelectorAll('#man path')[guessesLeft],
          1,
          { drawSVG: '100%', ease: Sine.easeIn },
          timeline.time()
        ); // Draw part of man
        const incorrectGuess = document.createElement('span');
        incorrectGuess.classList.add('letter', 'incorrect');
        incorrectGuess.innerHTML = letter;
        document.querySelector(`.letter-tile[data-letter='${letter}']`).classList.add('incorrect');
        if (guessesLeft === 0) {
          // Out of guesses
          const guessedWord = wordDisplayEl.innerHTML.replace(/<[^<>]*>/g, '');
          timeline.staggerFromTo(
            document.querySelectorAll('#eyes path'),
            0.25,
            { drawSVG: '0%' },
            { drawSVG: '100%' },
            0.25
          ); // X-ed out eyes
          for (let i = 0; i < hangmanWord.length; i++) {
            // Get blank spaces
            if (/\s/.test(guessedWord.charAt(i))) {
              const blankSpace = document.querySelectorAll('#wordDisplay .letter')[i];
              blankSpace.innerHTML = hangmanWord.charAt(i); // Set blank to correct letter
              blankSpace.classList.add('incorrect');
            }
          }
          wordDisplayEl.classList.add('lost');
        } else {
          guessInput.focus();
        }
      }

      guessedLettersEl.appendChild(guessedLetterEl); // Append incorrect guess to the guessed letters section
    }
  };

  import(/* webpackChunkName: "wordlist" */ './wordlist.txt').then(({ default: words }) => {
    randomWords = words.split('\n');
  });

  TweenLite.fromTo(document.querySelectorAll('path'), 1, { drawSVG: '0%' }, { drawSVG: '100%' }); // Initial drawing of gallows

  document.addEventListener('keypress', evt => {
    const key = evt.key || evt.keyCode;
    // Shift + R sets random word
    if (key === 'R' || (key === 82 && evt.shiftKey)) {
      randomWordButton.click();
      evt.preventDefault();
    }
  });

  wordInput.addEventListener('keypress', evt => {
    const key = evt.key || evt.keyCode;
    if (key === 'Enter' || key === 13) {
      // Enter key triggers submit button
      setWordButton.click();
    }
    evt.stopPropagation();
  });

  wordInput.addEventListener('input', () => {
    const word = wordInput.value.trim();

    if (/[^A-Za-z]/.test(word)) {
      wordInput.classList.add('uk-form-danger');
      if (!showingError) {
        errorMessage.removeAttribute('hidden');
        errorMessage.classList.add('uk-animation-slide-top-small');
        setWordButton.disabled = true;
        showingError = true;
      }
    } else {
      wordInput.classList.remove('uk-form-danger');
      if (showingError) {
        errorMessage.classList.remove('uk-animation-slide-top-small', 'uk-animation-reverse');
        errorMessage.setAttribute('hidden', '');
        setWordButton.disabled = false;
        showingError = false;
      }
    }
  });

  guessInput.addEventListener('keypress', evt => {
    const key = evt.key || evt.keyCode;
    if (key === 'Enter' || key === 13) {
      // Enter key triggers submit button
      document.querySelector('#submitGuess').click();
    }
  });

  setWordButton.addEventListener('click', async () => {
    const word = wordInput.value.trim();
    if (showingError || word.length === 0) {
      return;
    }

    setWord(word);
    await UIkit.modal('#setWordModal').hide();
    guessInput.focus();
  });

  randomWordButton.addEventListener('click', () => {
    // Random word button press
    setWord(randomWords[Math.floor(Math.random() * randomWords.length)]); // Submit random word
    guessInput.focus();
  });

  submitGuessButton.addEventListener('click', () => {
    const guessedLetter = guessInput.value.trim();
    if (hangmanWord !== '' && guessedLetter !== '' && guessesLeft > 0) {
      // Check if a word is set, guess is not whitespace, and there are guesses left
      guess(guessedLetter.toUpperCase()); // Submit guess
    }
  });

  document.querySelectorAll('.letter-tile').forEach(letterTile => {
    letterTile.addEventListener('click', () => {
      const classList = letterTile.classList;
      if (
        !classList.contains('correct') &&
        !classList.contains('incorrect') &&
        hangmanWord !== '' &&
        guessesLeft > 0
      ) {
        // Check if letter has not been guessed, a word is set, and there are guesses left
        guess(letterTile.dataset.letter); // Submit guess
      }
    });
  });
});
