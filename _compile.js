const fs = require("fs");
const path = require("path");

const glob = require("glob");
const sass = require("node-sass");

const outputStyle = "nested";
const filesToCompile = [
  "global.scss",
  ...glob.sync("colors/**/[^_]*.scss"),
  ...glob.sync("about/**/style.scss"),
  ...glob.sync("origami/**/style.scss"),
  ...glob.sync("photography/**/style.scss"),
  ...glob.sync("ventures/**/style.scss"),
  ...glob.sync("school/**/style.scss"),
  ...glob.sync("tools/**/style.scss"),
  ...glob.sync("visual/**/style.scss"),
  ...glob.sync("games/**/style.scss"),
  ...glob.sync("experiments/**/style.scss"),
];

filesToCompile.forEach((file) => {
  const outFile = path.join(
    path.dirname(file),
    `${path.basename(file, path.extname(file))}.css`
  );

  try {
    const { css,map, stats } = sass.renderSync({ file, outFile ,outputStyle,sourceMap:true});

    console.log(
      `Compiled ${path.relative(__dirname, stats.entry)} in ${stats.duration}ms`
    );

    fs.writeFile(outFile, css, (err) => err && console.error(err));
    fs.writeFile(`${outFile}.map`, map, (err) => err && console.error(err));
  } catch (error) {
    console.error(error.formatted ? error.formatted : error);
  }
});
