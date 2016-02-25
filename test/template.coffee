template = require "../template"

describe "template", ->
  it "should exist", ->
    assert template

  it "should render html when given a title and sections", ->
    result = template
      scripts: ""
      title: "Test"
      sections: [{
        docsHtml: "<h1>Hello</h1>"
        codeHtml: "<pre>1 + 1 == 2</pre>"
      }, {
        docsHtml: "<h2>Yolo</h2>"
        codeHtml: "world"
      }]

    console.log result
    assert result
