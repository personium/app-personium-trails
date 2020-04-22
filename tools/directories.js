const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

function flatten(lists) {
  return lists.reduce((a, b) => a.concat(b) , []);
}
function getDirectories(srcPath) {
  return task = readdirAsync(srcPath)
    .then(dirs => dirs.map(dir => path.join(srcPath, dir)))
    .then(dirs => Promise.all(dirs.map(path => statAsync(path).then(stat => ({path, stat})))))
    .then(dirs => ({
      folders: dirs.filter(path => path.stat.isDirectory()),
      files: dirs.filter(path => !path.stat.isDirectory()),
    }))
    .then(({folders,files}) => ({
      folders: folders.map(dir => dir.path),
      files: files.map(dir => dir.path),
    }))
}
function getSubdirectories(dirs, prevResult = {folders: [], files: []}) {
  return Promise.all(dirs.map( dir => getDirectories(dir)))
    .then(results => ({
      folders: flatten(results.map(result => result.folders)),
      files: flatten(results.map(result => result.files)),
    }))
    .then(({folders, files}) => {
      prevResult = {
        folders: prevResult.folders.concat(folders),
        files: prevResult.files.concat(files),
      };
      if (folders.length === 0) return prevResult;
      return getSubdirectories(folders, prevResult); 
    });
}

async function getContents(folderPath) {
  function mergeFullpath(srcFolder, filename) {
    return Object.assign({}, {filename}, {filepath: path.join(srcFolder, filename)});
  }
  async function mergeStatAsync(fileInfo) {
    const {filepath} = fileInfo;
    return statAsync(filepath)
      .then(stat => Object.assign({}, fileInfo, {stat}));
  }
  return readdirAsync(folderPath)
    .then(filenames => filenames.map(filename => mergeFullpath(folderPath, filename)))
    .then(paths => Promise.all(paths.map(mergeStatAsync)));
}
async function getFiles(folderPath) {
  return getContents(folderPath).then(filepaths => filepaths.filter(filepath => !filepath.stat.isDirectory()));
}
async function getDirectories(folderPath) {
  return getContents(folderPath).then(filepaths => filepaths.filter(filepath => filepath.stat.isDirectory()));
}

module.exports = {
  getSubdirectories: async (dir) => {
    return getSubdirectories([dir]);
  },
  getContents,
  getFiles,
  getDirectories,
};
