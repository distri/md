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

        index = []

        results = results.map (result, i) ->
          # Assuming .*.md so we should strip the extension twice
          name = documentableFiles[i].withoutExtension().withoutExtension()

          # TODO: Migrate Tempest and athletic-support into editor based projects.

          content = doctor.template
            title: name
            sections: result
            scripts: """
              <script src="//code.jquery.com/jquery-1.10.1.min.js"><\/script>
              <script src="//cdnjs.cloudflare.com/ajax/libs/coffee-script/1.6.3/coffee-script.min.js"><\/script>
              <script src="http://strd6.github.io/interactive/v0.7.0.js"><\/script>
              <script src="http://strd6.github.io/tempest/javascripts/envweb.js"><\/script>
              <script src="http://strd6.github.io/require/v0.1.0.js"><\/script>
              <script>
                (function(pkg) {
                  // Expose a require for our package so scripts can access our modules
                  window.require = Require.generateFor(pkg);
                })(#{JSON.stringify(pkg, null, 2)});
              <\/script>
            """

          # Add an index.html if our file is the entry point
          if name is entryPoint
            index.push
              path: "#{base}/index.html"
              content: content

          path: "#{base}/#{name}.html"
          content: content
        .concat(index)

        Deferred().resolve(results)
