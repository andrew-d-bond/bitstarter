#!/usr/bin/env node
/* jslint node: true */
/**
 * @author Startup Engineering course staff
 * @author Andrew D. Bond <andrew.d.bond@gmail.com>
 */
 /*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var util = require('util');
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        util.log(util.format("%s does not exist. Exiting.", instr));
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtml = function(html) {
    return cheerio.load(html);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    checkHtml(cheerioHtml(fs.readFileSync(htmlfile)), checksfile);

    return;
};

function checkHtml(jQuery, checksfile) {
  $ = jQuery;
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for(var ii in checks) {
      var present = $(checks[ii]).length > 0;
      out[checks[ii]] = present;
  }

  var outJson = JSON.stringify(out, null, 4);
  console.log(outJson);
}

var checkUrl = function(url, checksfile) {
  var rest = require('restler');
  var util = require('util');

  rest.get(url).on('complete', function(result) {
    if (result instanceof Error) {
      util.error('Error: ' + result.message);
    } else {
      checkHtml(cheerioHtml(result), checksfile);
    }
  });

  return;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to json checks file', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to HTML file', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL')
        .parse(process.argv);
    var checkJson;
    if (program.url)
    {
      checkUrl(program.url, program.checks);
    }
    else
    {
      checkHtmlFile(program.file, program.checks);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}