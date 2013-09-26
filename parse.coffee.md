Parse
=====

Parse a Markdown document into an array of sections that contain code and text.

Implementation
--------------

RegExes for detecting indentation, blank lines, and section breaks.

    indent = /^([ ]{4}|\t)/
    blank = /^\s*$/
    sectionBreak = /^(---+|===+)$/

Parsing converts a string of Markdown text into an array of sections.

    parse = (source) ->

A helper to create section objects. Each section contains text and code.

      Section = ->
        text: []
        code: []

Our array of sections that we will return.

      sections = [Section()]

A helper to get the last section in the array.

      lastSection = ->
        sections.last()

Whenever we encounter code we push it onto the last section.

      pushCode = (code) ->
        lastSection().code.push code

Pushing text is a little bit more complicated. If the last section has code in
it then we need to push a new section on and add the text to that.

If the last section is doesn't have any code yet we can push our text onto it.

If our text matches a `sectionbreak` then we push a new section after adding
our text to the previous section.

      pushText = (text) ->
        if lastSection().code.length
          section = Section()
          section.text.push text
          sections.push section
        else
          lastSection().text.push text

          sections.push Section() if sectionBreak.test text

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

    module.exports = parse

Helpers
-------

This helper removes empty strings from the end of our text and code arrays so
we're not left with extra newlines and things in between sections.

    truncateEmpties = (array) ->
      while (last = array.last())? and last is ""
        array.pop()
      
      return array
