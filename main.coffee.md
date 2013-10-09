Like a Doctor
=============

Document all of your literate code: files that end in `.md`.

Inspired by Docco. Designed for the browser environment.

We use marked for generating the markdown.

    marked = require "./lib/marked"
    highlight = require "./lib/highlight"
    languages = require "./languages"

    marked.setOptions
      highlight: (code, lang) ->
        if highlight.LANGUAGES[lang]
          highlight.highlight(lang, code).value
        else
          console.warn "couldn't highlight code block with unknown language '#{lang}'"

          code

Export our public api.

    module.exports = doctor =
      parse: require('./parse')

Our docco style template.

      template: require('./template')

Document one file.

      compile: (content, language="coffeescript") ->
        doctor.parse(content).map ({text, code}) ->
          docsHtml: marked(text)
          codeHtml: marked "```#{language}\n#{code}\n```"

Generate the documentation for all files within the given package. Returns a
promise that will be fulfilled with an array of `fileData`.

      documentAll: (pkg) ->
        {entryPoint, source, repository} = pkg
        {branch, default_branch} = repository

        if branch is default_branch
          base = "docs"
        else
          base = "#{branch}/docs"

        documentableFiles = Object.keys(source).select (name) ->
          name.extension() is "md"

        results = documentableFiles.map (name) ->
          language = name.withoutExtension().extension()
          language = languages[language] || language

          doctor.compile source[name].content, language

        extras = [packageScript(base, pkg)]

        scripts = dependencyScripts unique([
          "//code.jquery.com/jquery-1.10.1.min.js"
          "//cdnjs.cloudflare.com/ajax/libs/coffee-script/1.6.3/coffee-script.min.js"
          "http://strd6.github.io/require/v0.2.2.js"
          "http://strd6.github.io/interactive/v0.8.0.js"
        ].concat(
          pkg.remoteDependencies or []
        ))

        results = results.map (result, i) ->
          # Assuming .*.md so we should strip the extension twice
          name = documentableFiles[i].withoutExtension().withoutExtension()

          content = doctor.template
            title: name
            sections: result
            scripts:  scripts.concat makeScript(relativeScriptPath(name))

          # Add an index.html if our file is the entry point
          if name is entryPoint
            extras.push
              path: "#{base}/index.html"
              content: content

          path: "#{base}/#{name}.html"
          content: content
        .concat(extras)

        Deferred().resolve(results)

Helpers
-------

`makeScript` returns a string representation of a script tag that has a src
attribute.

    makeScript = (src) ->
      script = document.createElement("script")
      script.src = src

      return script.outerHTML

`dependencyScripts` returns a string containing the script tags that are
the dependencies of this build.

    dependencyScripts = (remoteDependencies=[]) ->
      remoteDependencies.map(makeScript).join("\n")

`unique` returns a new duplicate free version of an array.

    unique = (array) ->
      array.reduce (results, item) ->
        results.push item if results.indexOf(item) is -1

        results
      , []

This returns a script file that exposes a global `require` that gives access to
the current package and is meant to be included in every docs page.

    packageScript = (base, pkg) ->
      path: "#{base}/package.js"
      content: """
        (function(pkg) {
          // Expose a require for our package so scripts can access our modules
          window.require = Require.generateFor(pkg);
        })(#{JSON.stringify(pkg, null, 2)});
      """

Package Script path

    relativeScriptPath = (path) ->
      upOne = "../"
      results = []

      (path.split("/").length - 1).times ->
        results.push upOne
        
      results.concat("package.js").join("")
  