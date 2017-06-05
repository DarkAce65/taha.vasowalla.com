#!/bin/bash

style="nested"
if ! type "sass" > /dev/null; then
	echo "Error: Sass not found. Install sass and rerun script."
	exit
fi

if [[ ! -d "bourbon" ]]; then
	echo "Error: Bourbon mixins not installed."
	if ! type "bourbon" > /dev/null; then
		echo "Install bourbon via 'gem install bourbon'"
	fi
	echo "Run 'bourbon install' in this directory"
	exit
fi

echo "Compiling global.scss..."
sass --style $style --update global.scss:global.css
echo "Compiling colors directory..."
sass --style $style --update colors:colors
echo "Compiling all subdirectories..."
sass --style $style --update new:new about:about origami:origami photography:photography ventures:ventures school:school tools:tools visual:visual games:games experiments:experiments
