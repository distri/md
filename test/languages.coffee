languages = require "../languages"

describe "languages", ->
  it "should know of coffeescript and javascript", ->
    assert languages.js is "javascript"
    assert languages.coffee is "coffeescript"
