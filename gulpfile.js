const gulp = require('gulp');
const zip = require('gulp-zip');
const path = require('path').posix;
const merge = require('merge-stream');

const config = require('./config.js');
const PersoniumAuthClient = require('./tools/auth');
const PersoniumWebdavClient = require('./tools/webdav');

const CONSTANT = {
  RESOURCETYPE: {
    SERVICE: 'service',
    COLLECTION: 'collection',
    STATICFILE: 'staticfile',
  },
};

gulp.task('build_bar', () => {
  return gulp
    .src(['src/bar/**/*', '!src/bar/**/*.example.*'])
    .pipe(zip(`${config.personium.CELL_NAME}.bar`))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy_statics', () => {
  const tasks = config.personium.DIRECTORY_MAPPING.map(mapping => {
    const getDstDir = mapping => {
      const strPaths = ['build', mapping.dstDir];
      if (mapping.resourceType === CONSTANT.RESOURCETYPE.SERVICE) {
        strPaths.push('__src');
      }
      return path.join(...strPaths);
    };
    const dstDir = getDstDir(mapping);
    return gulp
      .src(mapping.filePattern, { base: mapping.srcDir })
      .pipe(gulp.dest(dstDir));
  });
  return merge(tasks);
});

/*
 * upload Ordinal folder. (collection)
 */
async function deployCollection(
  client,
  srcFolder,
  dstName,
  deploySubdirectory = true
) {
  const { getContents } = require('./tools/directories');
  const collectionPath = path.join('/__/', dstName);

  try {
    await client.createCollection(collectionPath);
  } catch (e) {
    if (e.response.status === 405) {
      console.log(
        `the collection ${collectionPath} is already exists (perhaps)`
      );
    } else {
      console.log(e);
      throw e;
    }
  }

  const contents = await getContents(srcFolder);
  return Promise.all(
    contents.map(content => {
      const { stat } = content;
      if (deploySubdirectory && stat.isDirectory()) {
        const dstPath = path.join(dstName, content.filename);
        return deployCollection(client, content.filepath, dstPath);
      } else {
        const dstPath = path.join(collectionPath, content.filename);
        console.log(`file upload: ${content.filepath} -> ${dstPath}`);
        return client.putFile(dstPath, content.filepath);
      }
    })
  );
}

/*
 * upload Engine folder.
 * It referers `__src` subdirectory as engine script.
 */
async function deployEngine(client, engineFolderPath, engineName, engineMeta) {
  const { getFiles } = require('./tools/directories');
  const enginePath = path.join('/__/', engineName);
  const engineSrcFolderPath = path.join(engineFolderPath, '__src');

  try {
    await client.createEngine(enginePath);
  } catch (e) {
    if (e.response.status === 405) {
      console.log(`the engine ${enginePath} is already exists (perhaps)`);
    } else {
      console.log(e);
      throw e;
    }
  }

  // upload engine scripts
  const files = await getFiles(engineSrcFolderPath);
  const results = await Promise.all(
    files.map(fileInfo => {
      console.log(`engine upload: ${fileInfo.filepath}`);
      return client.putFileToEngine(
        enginePath,
        fileInfo.filepath,
        fileInfo.filename
      );
    })
  );

  // setting props
  try {
    await client.updateServiceEndpoint(enginePath, engineMeta);
  } catch (e) {
    console.log(e);
    throw e;
  }
  return results;
}

gulp.task('deploy', () => {
  const cellURL = `https://${config.personium.CELL_FQDN}/`;
  const username = config.personium.CELL_ADMIN;
  const password = config.personium.CELL_ADMIN_PASS;

  return (async () => {
    const tokens = await PersoniumAuthClient.getTokenROPC(
      cellURL,
      username,
      password
    );
    const client = new PersoniumWebdavClient(cellURL, tokens.access_token);

    return Promise.all(
      config.personium.DIRECTORY_MAPPING.map(mapping => {
        if (mapping.resourceType === CONSTANT.RESOURCETYPE.SERVICE) {
          return deployEngine(
            client,
            path.join('build', mapping.dstDir),
            mapping.dstDir,
            mapping.meta
          );
        } else if (mapping.resourceType === CONSTANT.RESOURCETYPE.STATICFILE) {
          const { getFiles } = require('./tools/directories');

          return getFiles(path.join('build', mapping.dstDir)).then(contents =>
            Promise.all(
              contents.map(content => {
                const collectionPath = path.join('/__/', mapping.dstDir);
                const dstPath = path.join(collectionPath, content.filename);
                console.log(`file upload: ${content.filepath} -> ${dstPath}`);
                return client.putFile(dstPath, content.filepath);
              })
            )
          );
        } else {
          return deployCollection(
            client,
            path.join('build', mapping.dstDir),
            mapping.dstDir
          );
        }
      })
    );
  })();
});

const webpack = require('webpack-stream');

gulp.task('webpack', () => {
  return gulp
    .src('src/app/frontend/index.js')
    .pipe(
      webpack(
        Object.assign(require('./webpack.config'), { mode: 'production' })
      )
    )
    .pipe(gulp.dest('build/public'));
});
