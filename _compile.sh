#!/bin/bash

style="nested"
if ! type "sass" > /dev/null; then
	echo "Error: Sass not found. Install sass and rerun script."
	exit
fi

if [[ ! -d "bourbon" ]]; then
	echo "Error: Bourbon mixins not installed."
	where bourbon > nul 2>&1
	if ! type "bourbon" > /dev/null; then
		echo "Install bourbon via 'gem install bourbon'"
		exit
	fi
	echo "Run 'bourbon install' in this directory"
	exit
fi

echo "Compiling global.scss and style.scss..."
sass --style $style --update global.scss:global.css style.scss:style.css
echo "Compiling colors directory..."
sass --style $style --update colors:colors
echo "Compiling all subdirectories..."
sass --style $style --update about:about origami:origami photography:photography ventures:ventures school:school tools:tools visual:visual games:games experiments:experiments
