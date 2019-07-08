import TimelineMax from 'gsap/TimelineMax';
import { Sine } from 'gsap/TweenMax';
import DrawSVGPlugin from '../../../lib/DrawSVGPlugin';

// eslint-disable-next-line no-unused-vars
const plugins = [DrawSVGPlugin];

let hangmanWord = '',
  guessedLetters = '',
  guessesLeft = 6;
let randomWords = null;
const timeline = new TimelineMax();

function submitWord(word) {
  hangmanWord = word.toUpperCase(); // Convert word to uppercase
  guessedLetters = ''; // Clear guessed letters
  guessesLeft = 6; // Set 6 guesses
  document.querySelector('#guessesLeft').innerHTML = `${guessesLeft} Guesses left`; // Reset DOM elements
  document.querySelector('#wordInput').value = '';
  document.querySelector('#wordDisplay').innerHTML = '';
  document.querySelector('#guessedLetters').innerHTML = '';
  document.querySelectorAll('.guess-xs').forEach(guessXs => {
    guessXs.classList.remove('correct', 'incorrect');
  });
  for (let i = 0; i < word.length; i++) {
    const span = document.createElement('span');
    span.classList.add('letter');
    span.innerHTML = '&emsp;';
    document.querySelector('#wordDisplay').append(span);
  }
}

function guess(letter) {
  document.querySelector('#guess').value = '';
  if (hangmanWord !== '' && guessedLetters === '') {
    // Reset on first guess
    timeline.clear();
    timeline.set(document.querySelectorAll('#man path, #eyes path'), { drawSVG: '0%' });
  }
  if (letter.match(/[^A-Za-z]/)) {
    // Invalid guess
    document
      .querySelector('#submitGuess')
      .attr('title', 'Only letters are allowed.')
      .tooltip('fixTitle')
      .tooltip('show');
    document.querySelector('#guess').focus();
  } else if (guessedLetters.indexOf(letter) != -1) {
    // Letter already guessed
    // document
    //   .querySelector('#submitGuess')
    //   .attr('title', "You've already guessed this letter.")
    //   .tooltip('fixTitle')
    //   .tooltip('show');
    document.querySelector('#guess').focus();
  } else if (guessedLetters.indexOf(letter) == -1) {
    // Check if letter has not been guessed
    // document.querySelector('#submitGuess').tooltip('hide');
    guessedLetters += letter; // Add guessed letter to guessedLetters
    let offset = 0;
    let index = hangmanWord.indexOf(letter, offset); // Get index of guess in the word
    if (index != -1) {
      // Guessed letter is in the word
      document.querySelector(`.guess-xs[data-letter='${letter}']`).classList.add('correct');
      while (index != -1) {
        // While guessed letter is still in word
        let space = document.querySelectorAll('#wordDisplay .letter')[index]; // Get blank space where letter is
        timeline.to(space, 0.2, { background: 'rgba(62, 200, 62, 0.6)' }, timeline.time()); // Green highlight
        timeline.to(space, 0.8, { background: 'rgba(62, 200, 62, 0)' }, timeline.time() + 0.2);
        space.innerHTML = letter; // Set content of blank to the letter
        offset = index + 1;
        index = hangmanWord.indexOf(letter, offset); // Get next occurence of letter
      }
      if (
        document.querySelector('#wordDisplay').innerHTML.replace(/<[^<>]*>/g, '') == hangmanWord
      ) {
        // Word has been guessed
        guessesLeft = -1;
        console.log({
          title: 'Hooray!',
          text: 'You win!',
          type: 'success',
          confirmButtonClass: 'btn-success',
          confirmButtonText: 'OK',
        });
      } else if (window.innerWidth > 767) {
        document.querySelector('#guess').focus();
      }
    } else {
      // Guessed letter is not in the word
      guessesLeft--;
      document.querySelector('#guessesLeft').innerHTML = `${guessesLeft} Guesses left`;
      timeline.to(
        document.querySelectorAll('#man path')[guessesLeft],
        1,
        { drawSVG: '100%', ease: Sine.easeIn },
        timeline.time()
      ); // Draw part of man
      let incorrectGuess = document.createElement('span');
      incorrectGuess.classList.add('letter');
      incorrectGuess.innerHTML = letter;
      document.querySelector('#guessedLetters').appendChild(incorrectGuess); // Append incorrect guess to the guessed letters section
      timeline.to(incorrectGuess, 0.2, { background: 'rgba(200, 62, 62, 0.6)' }, timeline.time()); // Red highlight
      timeline.to(
        incorrectGuess,
        0.8,
        { background: 'rgba(200, 62, 62, 0)' },
        timeline.time() + 0.2
      );
      document.querySelector(`.guess-xs[data-letter='${letter}']`).classList.add('incorrect');
      if (guessesLeft === 0) {
        // Out of guesses
        let guessedWord = document.querySelector('#wordDisplay').innerHTML.replace(/<[^<>]*>/g, '');
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
            let blankSpace = document.querySelectorAll('#wordDisplay .letter')[i];
            blankSpace.innerHTML = hangmanWord.charAt(i); // Set blank to correct letter
            timeline.to(
              blankSpace,
              0.2,
              { background: 'rgba(200, 62, 62, 0.6)', color: 'red', 'border-color': 'red' },
              timeline.time()
            ); // Red highlight
            timeline.to(
              blankSpace,
              0.8,
              { background: 'rgba(200, 62, 62, 0)' },
              timeline.time() + 0.2
            );
          }
        }
      } else {
        document.querySelector('#guess').focus();
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  import(/* webpackChunkName: "wordlist" */ './wordlist.txt').then(({ default: words }) => {
    randomWords = words.split('\n');
  });
  timeline.fromTo(document.querySelectorAll('path'), 1, { drawSVG: '0%' }, { drawSVG: '100%' }); // Initial drawing of gallows

  document.addEventListener('keypress', function(e) {
    if (e.which == 82 && e.shiftKey) {
      // Shift + R sets random word
      document.querySelector('#randomWord').click();
      document.querySelector('#guess').focus();
      e.preventDefault();
    }
  });

  document.querySelector('#wordInput').addEventListener('keypress', function(e) {
    if (e.which == 13) {
      // Enter key triggers submit button
      document.querySelector('#submitWord').click();
    }
    e.stopPropagation();
  });

  document.querySelector('#guess').addEventListener('keypress', function(e) {
    if (e.which == 82 && e.shiftKey) {
      // Shift + R sets random word
      e.preventDefault();
      document.querySelector('#randomWord').click();
    }
    if (e.which == 13) {
      // Enter key triggers submit button
      document.querySelector('#submitGuess').click();
    }
    e.stopPropagation();
  });

  document.querySelector('#randomWord').addEventListener('click', function() {
    // Random word button press
    submitWord(randomWords[Math.floor(Math.random() * randomWords.length)].trim()); // Submit random word
    timeline.clear();
    timeline.to(document.querySelectorAll('#man path, #eyes path'), 0.2, { drawSVG: '0%' }); // Clear the gallows
  });

  document.querySelector('#wordDialog').addEventListener('shown.bs.modal', function() {
    document.querySelector('#wordInput').focus();
  });

  document.querySelector('#submitWord').addEventListener('click', function() {
    // Submit button press
    var word = document.querySelector('#wordInput').value;
    if (word !== '' && !/[^A-Za-z]/.test(word)) {
      // Check if the word exists and contains valid characters
      document.querySelector('#wordDialog').modal('hide'); // Close modal
      submitWord(word); // Submit the word

      const listener = function() {
        // When the modal is closed, clear the gallows
        timeline.clear();
        timeline.to(document.querySelector('#man path, #eyes path'), 0.2, { drawSVG: '0%' });
        document.querySelector('#guess').focus();

        document.querySelector('#wordDialog').removeEventListener('hidden.bs.modal', listener);
      };
      document.querySelector('#wordDialog').addEventListener('hidden.bs.modal', listener);
    } else if (word === '') {
      document.querySelector('#wordDialog').modal('hide'); // Close modal
    } else {
      document.querySelector('#error').show(500); // Show the error message
    }
  });

  document.querySelector('#submitGuess').addEventListener('click', function() {
    var guessedLetter = document.querySelector('#guess').value.trim();
    if (hangmanWord !== '' && guessedLetter !== '' && guessesLeft > 0) {
      // Check if a word is set, guess is not whitespace, and there are guesses left
      guess(guessedLetter.toUpperCase()); // Submit guess
    }
  });

  document.querySelectorAll('.guess-xs').forEach(guessXs => {
    guessXs.addEventListener('click', function() {
      const classList = guessXs.classList;
      if (
        !classList.contains('correct') &&
        !classList.contains('incorrect') &&
        hangmanWord !== '' &&
        guessesLeft > 0
      ) {
        // Check if letter has not been guessed, a word is set, and there are guesses left
        guess(guessXs.dataset.letter); // Submit guess
      }
    });
  });
});
