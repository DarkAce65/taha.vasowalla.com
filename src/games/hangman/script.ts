import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import gsap from 'gsap';

import ValidatedInput from '~/lib/ValidatedInput';
import { getElOrThrow } from '~/lib/getEl';
import makeDashOffsetParams from '~/lib/makeDashOffsetParams';

let hangmanWord = '';
let guessedLetters: string[] = [];
let guessesLeft = 6;
let randomWords: string[] | null = null;
const timeline = gsap.timeline();

document.addEventListener('DOMContentLoaded', async () => {
  UIkit.use(Icons);

  const rawWordlist = (await import(/* webpackChunkName: "wordlist" */ './wordlist.txt')).default;
  randomWords = rawWordlist.split('\n').map((word) => word.trim());

  const guessInput = getElOrThrow<HTMLInputElement>('#guessInput');
  const guessesLeftEl = getElOrThrow('#guessesLeft');
  const wordDisplayEl = getElOrThrow('#wordDisplay');
  const guessedLettersContainerEl = getElOrThrow('#guessedLettersContainer');
  const guessedLettersEl = getElOrThrow('#guessedLetters');
  const setWordButton = getElOrThrow<HTMLButtonElement>('#setWord');
  const randomWordButton = getElOrThrow('#randomWord');
  const submitGuessButton = getElOrThrow('#submitGuess');

  const wordInput = new ValidatedInput('#wordInput', {
    customValidator: (input) => {
      const word = input.trim();
      if (/[^A-Za-z]/.test(word)) {
        return { type: 'error' };
      }

      return false;
    },
    validationMessageElement: '#error',
    stateCallback: (state) => {
      setWordButton.disabled = state === 'empty' || state === 'error';
    },
  });

  const setWord = (word: string): void => {
    hangmanWord = word.toUpperCase(); // Convert word to uppercase
    guessedLetters = []; // Clear guessed letters
    guessesLeft = 6; // Set 6 guesses

    // Reset DOM elements
    guessedLettersContainerEl.classList.add('uk-hidden');
    guessesLeftEl.innerHTML = `${guessesLeft} guesses left`;
    wordInput.reset();
    setWordButton.disabled = true;
    wordDisplayEl.innerHTML = '';
    wordDisplayEl.classList.remove('lost');
    guessedLettersEl.innerHTML = '';
    document.querySelectorAll('.letter-tile').forEach((guessXs) => {
      guessXs.classList.remove('correct', 'incorrect');
    });
    for (let i = 0; i < word.length; i++) {
      const span = document.createElement('span');
      span.classList.add('letter');
      span.innerHTML = '&emsp;';
      wordDisplayEl.appendChild(span);
    }

    timeline
      .clear()
      .restart()
      .to('#man path, #eyes path', { duration: 0.3, ...makeDashOffsetParams({ progress: 0 }) });
  };

  const guess = (letter: string): void => {
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
        getElOrThrow(`.letter-tile[data-letter='${letter}']`).classList.add('correct');
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
          UIkit.notification('You win!', { status: 'success' });
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
          { duration: 1, ...makeDashOffsetParams({ progress: 1 }) },
          timeline.time()
        ); // Draw part of man
        const incorrectGuess = document.createElement('span');
        incorrectGuess.classList.add('letter', 'incorrect');
        incorrectGuess.innerHTML = letter;
        getElOrThrow(`.letter-tile[data-letter='${letter}']`).classList.add('incorrect');
        if (guessesLeft === 0) {
          // Out of guesses
          const guessedWord = wordDisplayEl.innerHTML.replace(/<[^<>]*>/g, '');
          timeline.fromTo('#eyes path', makeDashOffsetParams({ progress: 0 }), {
            duration: 0.25,
            stagger: 0.25,
            ...makeDashOffsetParams({ progress: 1 }),
          }); // X-ed out eyes
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

  gsap.fromTo('#base, #gallows', makeDashOffsetParams({ progress: 0 }), {
    duration: 1,
    ...makeDashOffsetParams({ progress: 1 }),
  }); // Initial drawing of gallows
  timeline.fromTo('#man path, #eyes path', makeDashOffsetParams({ progress: 0 }), {
    duration: 1,
    ...makeDashOffsetParams({ progress: 1 }),
  });

  document.addEventListener('keypress', (evt) => {
    const key = evt.key || evt.keyCode;
    // Shift + R sets random word
    if (key === 'R' || (key === 82 && evt.shiftKey)) {
      randomWordButton.click();
      evt.preventDefault();
    }
  });

  wordInput.input.addEventListener('keypress', (evt) => {
    const key = evt.key || evt.keyCode;
    if (key === 'Enter' || key === 13) {
      // Enter key triggers submit button
      setWordButton.click();
    }
    evt.stopPropagation();
  });

  guessInput.addEventListener('keypress', (evt) => {
    const key = evt.key || evt.keyCode;
    if (key === 'Enter' || key === 13) {
      // Enter key triggers submit button
      submitGuessButton.click();
    }
  });

  setWordButton.addEventListener('click', async () => {
    const word = wordInput.value.trim();
    if (wordInput.state === 'error' || word.length === 0) {
      return;
    }

    setWord(word);
    await UIkit.modal('#setWordModal').hide();
    guessInput.focus();
  });

  randomWordButton.addEventListener('click', () => {
    // Random word button press
    if (!randomWords) {
      return;
    }

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

  document.querySelectorAll<HTMLDivElement>('.letter-tile').forEach((letterTile) => {
    letterTile.addEventListener('click', () => {
      const classList = letterTile.classList;
      if (
        !classList.contains('correct') &&
        !classList.contains('incorrect') &&
        hangmanWord !== '' &&
        guessesLeft > 0 &&
        letterTile.dataset.letter
      ) {
        // Check if letter has not been guessed, a word is set, and there are guesses left
        guess(letterTile.dataset.letter); // Submit guess
      }
    });
  });
});
