# Flachpack

Flachpack pipes a directory of HTML files through [EJS](https://github.com/mde/ejs), [Minifier](https://github.com/kangax/html-minifier) and [Terser](https://github.com/terser/terser), resulting in a flat directory of HTML files. Use it to build tiny websites!

I built it for my tiny [personal website](https://danieldiekmeier.de).

```
npm i flachpack -g

flachpack -o dist src
# -o / --out:    The output directory
# -w / --watch:  Enable watch mode and serve over BrowserSync
# last argument: The folder containing the HTML files
```

An example `src/index.html`:

```html
<html>
  <head>
    <style type="text/css">
      /* inline Sass, SCSS or plain SCSS */
      <%- includeSass('main.scss') %>
    </style>

    <script>
      // inline JavaScript
      <%- include('./script.js') %>
    </script>
  </head>

  <body>
    <!-- reuse some parts! -->
    <%- include('./parts/header.html') %>

    <h1>Hello World!</h1>
  </body>
</html>
```

Look at [the repo for danieldiekmeier.de](https://github.com/danieldiekmeier/danieldiekmeier.de) for a bigger example.
