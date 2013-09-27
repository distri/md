(function() {
  var doctor, highlight, marked;

  marked = require("./lib/marked");

  highlight = require("./lib/highlight");

  marked.setOptions({
    highlight: function(code, lang) {
      if (highlightjs.LANGUAGES[lang]) {
        return highlightjs.highlight(lang, code).value;
      } else {
        console.warn("couldn't highlight code block with unknown language '" + lang + "' in " + source);
        return code;
      }
    },
    smartypants: true
  });

  module.exports = doctor = {
    parse: require('./parse'),
    template: require('./template'),
    compile: function(content) {
      return doctor.parse(content).map(function(_arg) {
        var code, text;
        text = _arg.text, code = _arg.code;
        return {
          docsHtml: marked(text),
          codeHtml: marked("<div class='highlight'><pre>" + code + "</pre></div>")
        };
      });
    },
    documentAll: function(pkg) {
      var base, branch, default_branch, documentableFiles, entryPoint, promises, repository, source;
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
      promises = documentableFiles.map(function(name) {
        return Deferred().resolve(doctor.compile(source[name].content));
      });
      return Deferred.when(promises).then(function(results) {
        var index;
        index = [];
        return results.map(function(result, i) {
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
      });
    }
  };

}).call(this);
