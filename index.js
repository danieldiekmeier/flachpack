#!/usr/bin/env node

const jetpack = require('fs-jetpack')
const Terser = require('terser')
const ejs = require('ejs')
const path = require('path')
const minimist = require('minimist')
const { minify } = require('html-minifier')

const argv = require('minimist')(process.argv.slice(2), {
  boolean: ['watch'],
  alias: {
    watch: 'w',
    out: 'o'
  }
})

const DONE_MESSAGE = 'Done! 🎉 Compiled in'
const input = argv._[0]
const src = path.resolve(process.cwd(), input)
const dist = path.resolve(process.cwd(), argv.out)

if (argv.watch) {
  const chokidar = require('chokidar')
  const BrowserSync = require('browser-sync')
  const browserSync = BrowserSync.create()
  browserSync.init({
    server: dist,
    ui: false,
    open: false,
    notify: false
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
  const Sass = require('sass')
  return Sass.renderSync({ file }).css.toString()
}

function compile(browserSync) {
  console.time(DONE_MESSAGE)

  const files = jetpack
    .find(src, { matching: '*.html', recursive: false })
    .map(fileName => path.resolve(process.cwd(), fileName))
    .map(fileName => ({
      fileName: fileName,
      distPath: path.resolve(dist, path.basename(fileName)),
      content: minify(
        ejs.render(
          jetpack.read(fileName),
          {
            includeSass
          },
          {
            filename: fileName
          }
        ),
        {
          minifyCSS: !argv.watch,
          minifyJS: argv.watch
            ? false
            : (text, inline) => {
                const result = Terser.minify(text, { warnings: true })
                if (result.warnings) console.log(result.warnings)
                if (result.error) {
                  console.log(text)
                  throw result.error
                }
                return result.code
              },
          removeAttributeQuotes: true,
          removeComments: true,
          removeScriptTypeAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: false
        }
      )
    }))

  // Ensure empty output directory exists
  jetpack.dir(dist, { empty: true })

  jetpack.copy(src, dist, {
    overwrite: true,
    matching: ['html', 'css', 'js', 'scss'].map(
      extension => `!**/*.${extension}`
    )
  })

  files.forEach(file => {
    jetpack.write(file.distPath, file.content)
  })

  if (browserSync) {
    browserSync.reload('*.html')
  }

  console.timeEnd(DONE_MESSAGE)
}
