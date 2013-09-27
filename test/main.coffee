md = require "../main"
marked = require "../lib/marked"

describe "marked markdown generation", ->
  it "should compile markdown", ->
    assert marked 'I am using __markdown__.'

describe "Parsing", ->
  it "should return an array of sections", ->
    sections = md.parse """
      A sample text + code section

          I'm the code
    """

    assert sections.length is 1
    assert sections.first().text is "A sample text + code section"
    assert sections.first().code is "I'm the code"

describe "Stuff spanning multiple lines", ->
  it "should be split by newline characters", ->
    sections = md.parse """
      1
      2
      3

          Code1
          Code2
    """

    assert sections.length is 1
    assert sections.first().text is "1\n2\n3"
    assert sections.first().code is "Code1\nCode2"

describe "A normal markdown paragraph", ->
  it "should keep newlines within", ->
    sections = md.parse """
      I'm talking about stuff.
      
      Paragraph two is rad!
    """
    
    assert sections.first().text.match("\n\n")

describe "Headers", ->
  it "should split sections", ->
    sections = md.parse """
      Intro
      -----
      
      Some other stuff
    """
    
    assert sections.length is 2

describe "Many code text sequences", ->
  it "should add text in new sections after code", ->
    sections = md.parse """
      Some description

          Code

      Another description

          More code

      Hey
    """
    
    assert sections.length is 3
