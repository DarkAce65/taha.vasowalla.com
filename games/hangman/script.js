"use strict";

$(function() {
	function submitWord(word) {
		hangmanWord = word.toUpperCase(); // Convert word to uppercase
		guessedLetters = ""; // Clear guessed letters
		guessesLeft = 6; // Set 6 guesses
		$("#guessesLeft").html(guessesLeft + " Guesses left"); // Reset DOM elements
		$("#wordInput").val("");
		$("#wordDisplay").html("");
		$("#guessedLetters").html("");
		$(".guess-xs").removeClass("correct incorrect");
		$("#error").hide();
		for(var i = 0; i < word.length; i++) {
			$("#wordDisplay").append('<span class="letter">&emsp;</span>');
		}
	}

	function guess(letter) {
		$("#guess").val("");
		if(hangmanWord !== "" && guessedLetters === "") { // Reset on first guess
			timeline.clear();
			timeline.set($("#man path, #xEyes path"), {drawSVG: "0%"});
		}
		if(letter.match(/[^A-Za-z]/)) { // Invalid guess
			$("#submitGuess").attr("title", "Only letters are allowed.").tooltip("fixTitle").tooltip("show");
			$("#guess").focus();
		}
		else if(guessedLetters.indexOf(letter) != -1) { // Letter already guessed
			$("#submitGuess").attr("title", "You've already guessed this letter.").tooltip("fixTitle").tooltip("show");
			$("#guess").focus();
		}
		else if(guessedLetters.indexOf(letter) == -1) { // Check if letter has not been guessed
			$("#submitGuess").tooltip("hide");
			guessedLetters += letter; // Add guessed letter to guessedLetters
			var offset = 0;
			var index = hangmanWord.indexOf(letter, offset); // Get index of guess in the word
			if(index != -1) { // Guessed letter is in the word
				$(".guess-xs[data-letter='" + letter + "']").addClass("correct");
				while(index != -1) { // While guessed letter is still in word
					var space = $("#wordDisplay .letter")[index]; // Get blank space where letter is
					timeline.to(space, 0.2, {background: "rgba(62, 200, 62, 0.6)"}, timeline.time()); // Green highlight
					timeline.to(space, 0.8, {background: "rgba(62, 200, 62, 0)"}, timeline.time() + 0.2);
					$(space).html(letter); // Set content of blank to the letter
					offset = index + 1;
					index = hangmanWord.indexOf(letter, offset); // Get next occurence of letter
				}
				if($("#wordDisplay").html().replace(/<[^<>]*>/g, "") == hangmanWord) { // Word has been guessed
					guessesLeft = -1;
					swal({
						title: "Hooray!",
						text: "You win!",
						type: "success",
						confirmButtonClass: "btn-success",
						confirmButtonText: "OK"
					});
				}
				else if(window.innerWidth > 767) {
					$("#guess").focus();
				}
			}
			else { // Guessed letter is not in the word
				guessesLeft--;
				$("#guessesLeft").html(guessesLeft + " Guesses left");
				timeline.to($("#man path")[guessesLeft], 1, {drawSVG: "100%", ease: Sine.easeIn}, timeline.time()); // Draw part of man
				var incorrectGuess = $('<span class="letter">' + letter + '</span>');
				$("#guessedLetters").append(incorrectGuess); // Append incorrect guess to the guessed letters section
				timeline.to(incorrectGuess, 0.2, {background: "rgba(200, 62, 62, 0.6)"}, timeline.time()); // Red highlight
				timeline.to(incorrectGuess, 0.8, {background: "rgba(200, 62, 62, 0)"}, timeline.time() + 0.2);
				$(".guess-xs[data-letter='" + letter + "']").addClass("incorrect");
				if(guessesLeft === 0) { // Out of guesses
					var guessedWord = $("#wordDisplay").html().replace(/<[^<>]*>/g, "");
					timeline.staggerFromTo($("#xEyes path"), 0.25, {drawSVG: "0%"}, {drawSVG: "100%"}, 0.25); // X-ed out eyes
					for(var i = 0; i < hangmanWord.length; i++) { // Get blank spaces
						if(/\s/.test(guessedWord.charAt(i))) {
							var space = $("#wordDisplay .letter")[i];
							$(space).html(hangmanWord.charAt(i)); // Set blank to correct letter
							timeline.to(space, 0.2, {background: "rgba(200, 62, 62, 0.6)", color: "red", "border-color": "red"}, timeline.time()); // Red highlight
							timeline.to(space, 0.8, {background: "rgba(200, 62, 62, 0)"}, timeline.time() + 0.2);
						}
					}
				}
				else {
					$("#guess").focus();
				}
			}
		}
	}

	var hangmanWord = "", guessedLetters = "", guessesLeft = 6;
	var randomWords = [];
	var timeline = new TimelineMax();

	$(window).on("keypress", function(e) {
		if(e.which == 82 && e.shiftKey) { // Shift + R sets random word
			$("#randomWord").click();
			$("#guess").focus();
			e.preventDefault();
		}
	});

	$("#wordInput").on("keypress", function(e) {
		if(e.which == 13) { // Enter key triggers submit button
			$("#submitWord").click();
		}
		e.stopPropagation();
	});

	$("#guess").on("keypress", function(e) {
		if(e.which == 82 && e.shiftKey) { // Shift + R sets random word
			e.preventDefault();
			$("#randomWord").click();
		}
		if(e.which == 13) { // Enter key triggers submit button
			$("#submitGuess").click();
		}
		e.stopPropagation();
	});

	$("#randomWord").click(function() { // Random word button press
		submitWord(randomWords[Math.floor(Math.random() * randomWords.length)].trim()); // Submit random word
		timeline.clear();
		timeline.to($("#man path, #xEyes path"), 0.2, {drawSVG: "0%"}); // Clear the gallows
	});

	$("#wordDialog").on("shown.bs.modal", function() {
		$("#wordInput").focus();
	});

	$("#submitWord").click(function() { // Submit button press
		var word = $("#wordInput").val();
		if(word !== "" && !/[^A-Za-z]/.test(word)) { // Check if the word exists and contains valid characters
			$("#wordDialog").modal("hide"); // Close modal
			submitWord(word); // Submit the word
			$("#wordDialog").one("hidden.bs.modal", function() { // When the modal is closed, clear the gallows
				timeline.clear();
				timeline.to($("#man path, #xEyes path"), 0.2, {drawSVG: "0%"});
				$("#guess").focus();
			});
		}
		else if(word === "") {
			$("#wordDialog").modal("hide"); // Close modal
		}
		else {
			$("#error").show(500); // Show the error message
		}
	});

	$("#submitGuess").click(function() {
		var guessedLetter = $("#guess").val().trim();
		if(hangmanWord !== "" && guessedLetter !== "" && guessesLeft > 0) { // Check if a word is set, guess is not whitespace, and there are guesses left
			guess(guessedLetter.toUpperCase()); // Submit guess
		}
	});

	$(".guess-xs").click(function() {
		if(!$(this).is(".correct, .incorrect") && hangmanWord !== "" && guessesLeft > 0) { // Check if letter has not been guessed, a word is set, and there are guesses left
			guess($(this).data("letter")); // Submit guess
		}
	});

	$("#randomWord").button("loading");

	$.ajax({ // Load random word list (54,970 words)
		type: "GET",
		url: "wordlist.txt",
		dataType: "text",
		success: function(response) {
			randomWords = response.split('\n');
			$("#randomWord").button("reset");
		},
		error: function() {
			$("#randomWord").remove();
		}
	});

	timeline.fromTo($("path"), 1, {drawSVG: "0%"}, {drawSVG: "100%"}); // Initial drawing of gallows
});