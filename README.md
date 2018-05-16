# Flachpack

Flachpack pipes a directory of HTML files through [EJS](https://github.com/mde/ejs) and [HTML Minifier](https://github.com/kangax/html-minifier), resulting in a flat directory of _only_ HTML files. Use it to build the smallest possible websites.

I built it for my tiny [personal website](https://danieldiekmeier.de).

```
npm i flachpack -g

flachpack -o dist src
# -o / --out:    The output directory
# last argument: The folder containing some HTML files.
```

Look at [the repo for danieldiekmeier.de](https://github.com/danieldiekmeier/danieldiekmeier.de) for an example.

## Plans for the future:

It would be nice to support inlining images as base64. Currently, I don't use an image on [danieldiekmeier.de](https://danieldiekmeier.de), so it's not my priority.
