Like a Doctor
=============

Document all of your literate code: files that end in `.md`.

Inspired by Docco. Designed for the browser environment.

We use marked for generating the markdown.

    marked = require "./lib/marked"
    highlight = require "./lib/highlight"
    
    marked.setOptions
      highlight: (code, lang) ->
        if highlightjs.LANGUAGES[lang]
          highlightjs.highlight(lang, code).value
        else
          console.warn "couldn't highlight code block with unknown language '#{lang}' in #{source}"
          
          code
      smartypants: true

Export our public api.

    module.exports = doctor =
      parse: require('./parse')
      
      template: require('./template')
      

Document one file.

      compile: (content) ->
        doctor.parse(content).map ({text, code}) ->
          # TODO: Add syntax highlighting

          docsHtml: marked(text)
          codeHtml: marked("<div class='highlight'><pre>#{code}</pre></div>")

      documentAll: (pkg) ->
        {entryPoint, source, repository} = pkg
        {branch, default_branch} = repository

        if branch is default_branch
          base = "docs"
        else
          base = "#{branch}/docs"

        documentableFiles = Object.keys(source).select (name) ->
          name.extension() is "md"
        
        promises = documentableFiles.map (name) ->
          Deferred().resolve(doctor.compile(source[name].content))

        Deferred.when(promises).then (results) ->
          index = []

          results.map (result, i) ->
            # Assuming .*.md so we should strip the extension twice
            name = documentableFiles[i].withoutExtension().withoutExtension()
            
            content = doctor.template
              title: name
              sections: result
              scripts: ""

            # Add an index.html if our file is the entry point
            if name is entryPoint
              index.push
                path: "#{base}/index.html"
                content: content

            path: "#{base}/#{name}.html"
            content: content
          .concat(index)
