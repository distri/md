(function() {
  var blank, indent, parse, sectionBreak, truncateEmpties;

  indent = /^([ ]{4}|\t)/;

  blank = /^\s*$/;

  sectionBreak = /^(---+|===+)$/;

  parse = function(source) {
    var Section, lastSection, lastWasCode, pushCode, pushEmpty, pushText, sections;
    Section = function() {
      return {
        text: [],
        code: []
      };
    };
    sections = [Section()];
    lastSection = function() {
      return sections.last();
    };
    pushCode = function(code) {
      return lastSection().code.push(code);
    };
    pushText = function(text) {
      var section;
      if (lastSection().code.length) {
        section = Section();
        section.text.push(text);
        return sections.push(section);
      } else {
        lastSection().text.push(text);
        if (sectionBreak.test(text)) {
          return sections.push(Section());
        }
      }
    };
    pushEmpty = function() {
      if (lastWasCode) {
        return pushCode("");
      } else {
        return lastSection().text.push("");
      }
    };
    lastWasCode = false;
    source.split("\n").each(function(line) {
      var match;
      if (blank.exec(line)) {
        return pushEmpty();
      } else if (match = indent.exec(line)) {
        lastWasCode = true;
        return pushCode(line.slice(match[0].length));
      } else {
        lastWasCode = false;
        return pushText(line);
      }
    });
    return sections.each(function(section) {
      section.text = truncateEmpties(section.text).join("\n");
      return section.code = truncateEmpties(section.code).join("\n");
    });
  };

  module.exports = {
    parse: parse
  };

  truncateEmpties = function(array) {
    var last;
    while (((last = array.last()) != null) && last === "") {
      array.pop();
    }
    return array;
  };

}).call(this);
