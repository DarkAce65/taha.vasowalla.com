const { spawn } = require('child_process');
const bourbon = require('bourbon').includePaths[0];

const args = ['--include-path ' + bourbon, '--source-map true'].concat(process.argv.slice(2));
const sassSources = [
	'style.scss style.css',
	'-r test -o test'
];
const options = {
	shell: true,
	stdio: 'inherit'
};

for(let i = 0; i < sassSources.length; i++) {
	const c = spawn('node-sass', args.concat([sassSources[i]]), options);
}
