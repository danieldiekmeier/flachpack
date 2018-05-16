#!/usr/bin/env node

const jetpack = require('fs-jetpack')
const ejs = require('ejs')
const path = require('path')
const minimist = require('minimist')
const { minify } = require('html-minifier')

const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    out: 'o'
  }
})

const input = argv._[0]
const src = path.resolve(process.cwd(), input)
const dist = path.resolve(process.cwd(), argv.out)

const files = jetpack.find(src, { matching: '*.html', recursive: false })
  .map(fileName => path.resolve(process.cwd(), fileName))
  .map(fileName => ({
    fileName: fileName,
    distPath: path.resolve(dist, path.basename(fileName)),
    content: minify(ejs.render(jetpack.read(fileName), {
      filename: fileName
    }), {
      minifyCSS: true,
      minifyJS: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeScriptTypeAttributes: true,
      collapseWhitespace: true,
      conservativeCollapse: false
    })
  }))

// Remove and add Output Directory
jetpack.dir(dist)

files.forEach(file => {
  jetpack.write(file.distPath, file.content)
})

console.log('Done! 🎉')
