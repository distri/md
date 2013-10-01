(function() {
  var dependencyScripts, doctor, highlight, languages, makeScript, marked, unique;

  marked = require("./lib/marked");

  highlight = require("./lib/highlight");

  languages = require("./languages");

  marked.setOptions({
    highlight: function(code, lang) {
      if (highlight.LANGUAGES[lang]) {
        return highlight.highlight(lang, code).value;
      } else {
        console.warn("couldn't highlight code block with unknown language '" + lang + "'");
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
      var base, branch, default_branch, documentableFiles, entryPoint, index, repository, results, scripts, source;
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
        var language;
        language = name.withoutExtension().extension();
        language = languages[language] || language;
        return doctor.compile(source[name].content, language);
      });
      index = [];
      scripts = dependencyScripts(unique(["//code.jquery.com/jquery-1.10.1.min.js", "//cdnjs.cloudflare.com/ajax/libs/coffee-script/1.6.3/coffee-script.min.js", "http://strd6.github.io/interactive/v0.8.0.js", "http://strd6.github.io/require/v0.2.1.js"].concat(pkg.remoteDependencies || [])));
      results = results.map(function(result, i) {
        var content, name;
        name = documentableFiles[i].withoutExtension().withoutExtension();
        content = doctor.template({
          title: name,
          sections: result,
          scripts: "" + scripts + "\n<script>\n  (function(pkg) {\n    // Expose a require for our package so scripts can access our modules\n    window.require = Require.generateFor(pkg);\n  })(" + (JSON.stringify(pkg, null, 2)) + ");\n<\/script>"
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

  makeScript = function(src) {
    var script;
    script = document.createElement("script");
    script.src = src;
    return script.outerHTML;
  };

  dependencyScripts = function(remoteDependencies) {
    if (remoteDependencies == null) {
      remoteDependencies = [];
    }
    return remoteDependencies.map(makeScript).join("\n");
  };

  unique = function(array) {
    return array.reduce(function(results, item) {
      if (results.indexOf(item) === -1) {
        results.push(item);
      }
      return results;
    }, []);
  };

}).call(this);
