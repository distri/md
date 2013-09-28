(function() {
  var doctor, highlight, languages, marked;

  marked = require("./lib/marked");

  highlight = require("./lib/highlight");

  languages = require("./languages");

  marked.setOptions({
    highlight: function(code, lang) {
      if (highlight.LANGUAGES[lang]) {
        return highlight.highlight(lang, code).value;
      } else {
        console.warn("couldn't highlight code block with unknown language '" + lang + "' in " + source);
        return code;
      }
    }
  });

  module.exports = doctor = {
    parse: require('./parse'),
    template: require('./template'),
    compile: function(content, language) {
      if (language == null) {
        language = "coffeescript";
      }
      return doctor.parse(content).map(function(_arg) {
        var code, text;
        text = _arg.text, code = _arg.code;
        return {
          docsHtml: marked(text),
          codeHtml: marked("```" + language + "\n" + code + "\n```")
        };
      });
    },
    documentAll: function(pkg) {
      var base, branch, default_branch, documentableFiles, entryPoint, index, repository, results, source;
      entryPoint = pkg.entryPoint, source = pkg.source, repository = pkg.repository;
      branch = repository.branch, default_branch = repository.default_branch;
      if (branch === default_branch) {
        base = "docs";
      } else {
        base = "" + branch + "/docs";
      }
      documentableFiles = Object.keys(source).select(function(name) {
        return name.extension() === "md";
      });
      results = documentableFiles.map(function(name) {
        return doctor.compile(source[name].content);
      });
      index = [];
      results = results.map(function(result, i) {
        var content, name;
        name = documentableFiles[i].withoutExtension().withoutExtension();
        content = doctor.template({
          title: name,
          sections: result,
          scripts: ""
        });
        if (name === entryPoint) {
          index.push({
            path: "" + base + "/index.html",
            content: content
          });
        }
        return {
          path: "" + base + "/" + name + ".html",
          content: content
        };
      }).concat(index);
      return Deferred().resolve(results);
    }
  };

}).call(this);
