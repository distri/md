Documenter
==========

This is a stopgap documenter until we get a nicer one.

It documents Markdown files using a Github API compatible markdown service.

The content of our stylesheet for rendering inline.

    style = require "./style/markdown"

Export a constructor that when given a markdown service returns a documenter.

    module.exports = (markdownService) ->
      documenter =

Returns a promise that will be fulfilled with html when the markdown source is 
converted.

        document: (source) ->
          markdownService(source)

Document all source files in a package.

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
            documenter.document source[name].content
          
          Deferred.when(promises).then (results) ->
            index = []

            results.map (result, i) ->
              # Assuming .*.md so we should strip the extension twice
              name = documentableFiles[i].withoutExtension().withoutExtension()
              
              content = documenter.template name, result.first()
              
              # Add an index.html if our file is the entry point
              if name is entryPoint
                index.push
                  path: "#{base}/index.html"
                  content: content

              path: "#{base}/#{name}.html"
              content: content
            .concat(index)

A super simple template with inline CSS.

        template: (title, html) ->
          """
            <html>
            <head>
            <title>#{title}</title>
            <style>
            #{style}
            </style>
            </head>
            <body>
            #{html}
            </body>
            </html>
          """