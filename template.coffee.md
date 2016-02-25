
Stole the template from Docco parallel style.

    Section = ({codeHtml, docsHtml}, i) -> """
      <li id="section-#{i + 1}">
        <div class="annotation">
          <div class="pilwrap">
            <a class="pilcrow" href="#section-#{i + 1}">&#182;</a>
          </div>
          #{docsHtml}
        </div>
        <div class="content">#{codeHtml}</div>
      </li>
    """


    template = ({title, sections, scripts}) -> 
      scripts ?= ""

      """
        <!DOCTYPE html>
  
        <html>
        <head>
          <title>#{title}</title>
          <meta http-equiv="content-type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, target-densitydpi=160dpi, initial-scale=1.0; maximum-scale=1.0; user-scalable=0;">
          <link rel="stylesheet" media="all" href="https://strd6.github.io/cdn/parallel/docco.css" />
        </head>
        <body>
          <div id="container">
            <div id="background"></div>
            <ul class="sections">
              #{sections.map(Section).join("\n")}
            </ul>
          </div>
          #{scripts}
        </body>
        </html>
      """

    module.exports = template
