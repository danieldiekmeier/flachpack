#!/usr/bin/env node

import jetpack from 'fs-jetpack'
import ejs from 'ejs'
import path from 'path'
import minimist from 'minimist'
import { minify } from 'html-minifier'
import makeSynchronous from 'make-synchronous'
import chokidar from 'chokidar'
import BrowserSync from 'browser-sync'
import Sass from 'sass'

const terserMinify = makeSynchronous(async (code) => {
  const minifyTerserAsync = await import('terser').then((m) => m.minify)

  const result = await minifyTerserAsync(code, { warnings: true })
  if (result.warnings) console.log(result.warnings)
  if (result.error) {
    console.log(code)
    throw result.error
  }
  return result.code
})

const argv = minimist(process.argv.slice(2), {
  boolean: ['watch'],
  alias: {
    watch: 'w',
    out: 'o',
  },
})

const DONE_MESSAGE = 'Done! 🎉 Compiled in'
const input = argv._[0]
const src = path.resolve(process.cwd(), input)
const dist = path.resolve(process.cwd(), argv.out)

if (argv.watch) {
  const browserSync = BrowserSync.create()
  browserSync.init({
    server: dist,
    ui: false,
    open: false,
    notify: false,
  })

  const watcher = chokidar.watch(src, { ignoreInitial: true })

  watcher.on('ready', () => {
    compile(browserSync)
  })

  watcher.on('all', (event, path) => {
    console.log(event, path)
    compile(browserSync)
  })
} else {
  compile()
}

function includeSass(fileName) {
  const file = path.resolve(src, fileName)
  return Sass.renderSync({ file }).css.toString()
}

function compile(browserSync) {
  console.time(DONE_MESSAGE)

  const files = jetpack
    .find(src, { matching: '*.html', recursive: false })
    .map((fileName) => path.resolve(process.cwd(), fileName))
    .map((fileName) => {
      const content = ejs.render(
        jetpack.read(fileName),
        {
          includeSass,
        },
        {
          filename: fileName,
        }
      )

      return {
        fileName: fileName,
        distPath: path.resolve(dist, path.basename(fileName)),
        content: minify(content, {
          minifyCSS: !argv.watch,
          minifyJS: argv.watch ? false : terserMinify,
          removeAttributeQuotes: true,
          removeComments: true,
          removeScriptTypeAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: false,
        }),
      }
    })

  // Ensure empty output directory exists
  jetpack.dir(dist, { empty: true })

  jetpack.copy(src, dist, {
    overwrite: true,
    matching: ['html', 'css', 'js', 'scss'].map(
      (extension) => `!**/*.${extension}`
    ),
  })

  files.forEach((file) => {
    jetpack.write(file.distPath, file.content)
  })

  if (browserSync) {
    browserSync.reload('*.html')
  }

  console.timeEnd(DONE_MESSAGE)
}
