Like a Doctor
=============

Document all of your literate code: files that end in `.md`.

Inspired by Docco. Designed for the browser environment.

First we convert a string of Markdown text into an array of sections.

    indent = /^([ ]{4}|\t)/
    blank = /^\s*$/

    parse = (source) ->
      Section = ->
        text: []
        code: []

      sections = [Section()]

      lastSection = ->
        sections.last()

      pushCode = (code) ->
        lastSection().code.push code

      pushText = (text) ->
        if lastSection().code.length
          section = Section()
          section.text.push text
          sections.push section
        else
          lastSection().text.push text
          
      truncateEmpties = (array) ->
        while (last = array.last())? and last is ""
          array.pop()
        
        return array

      pushEmpty = ->
        if lastWasCode
          pushCode("")
        else
          lastSection().text.push ""

      lastWasCode = false

      source.split("\n").each (line) ->
        if blank.exec(line)
          pushEmpty()
        else if match = indent.exec(line)
          lastWasCode = true
          pushCode line[match[0].length..]
        else
          lastWasCode = false
          pushText line

      sections.each (section) ->       
        section.text = truncateEmpties(section.text).join("\n")
        section.code = truncateEmpties(section.code).join("\n")

The sections can then be rendered into an html document.

Export our public api.

    module.exports =
      parse: parse
