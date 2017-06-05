@echo off
setlocal
set STYLE=nested
where ruby > nul 2>&1
if %ERRORLEVEL% neq 0 (
	echo Error: Ruby not found.
	echo Make sure ruby is installed and is added to your PATH
	pause
	exit
)
where sass > nul 2>&1
if %ERRORLEVEL% neq 0 (
	echo Error: Sass not found.
	echo Make sure sass is installed and is added to your PATH
	pause
	exit
)
for /f "tokens=*" %%i in ('where sass') do if not defined SASS_COMMAND set SASS_COMMAND=%%i

if not exist bourbon (
	echo Error: Bourbon mixins not installed.
	where bourbon > nul 2>&1
	if %ERRORLEVEL% neq 0 (
		echo Install bourbon: 'gem install bourbon'
	)
	echo Run 'bourbon install' in this directory
	pause
	exit
)

echo Compiling global.scss...
ruby %SASS_COMMAND% --style %STYLE% --update global.scss:global.css
echo Compiling colors directory...
ruby %SASS_COMMAND% --style %STYLE% --update colors:colors
echo Compiling all subdirectories...
ruby %SASS_COMMAND% --style %STYLE% --update new:new about:about origami:origami photography:photography ventures:ventures school:school tools:tools visual:visual games:games experiments:experiments
