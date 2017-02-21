var fs = require ('fs');
var path = require ('path');
var _ = require ('lodash');
var fspath = require ('fs-path');
var xmlParser = require ('xml2json');
var packageJson = require('./package.json');

compileSnippet('./templates/javascript', './snippets/javascript.json');
compileSnippet('./templates/html', './snippets/html.json');
compileSnippet('./templates/translation', './snippets/translation.json');


function compileSnippet(srcDirectory, output, prefixName) {
    var sourceFolder = path.resolve(srcDirectory);

    var lang = srcDirectory.replace(/.*\//, '');

    prefixName = lang + " " + (prefixName ? prefixName : packageJson.name) + " ";

    var files = fs.readdirSync (sourceFolder);
    var snippets = _(files)
        .chain()
        .map(function (name) {
            return getSnippet (path.join(srcDirectory, name));
        })
        .filter()
        .reduce (function (result, snippet) {
            return _.merge (result, snippet);
        }, {})
        .value();

    fspath.writeFileSync (output || 'snippets/javascript.json', JSON.stringify (snippets, null, '\t'));

    function getSnippet(snippetName){
        var result = {};
        if(path.parse(snippetName).ext !== '.xml'){
            return;
        }
        var xml = fs.readFileSync (path.resolve (snippetName), 'utf8');
        var snippet = xmlParser.toJson (xml, {
            object: true,
            sanitize: false
        }).snippet;

        snippet.body = (_.isString(snippet.body) ? snippet.body: '').split('\n');
        snippet.prefix = _.isArray(snippet.prefix) ? snippet.prefix : [snippet.prefix]
        _.forEach(snippet.prefix, function(prefix) {
            result[prefixName + prefix] = _.clone(snippet);
            result[prefixName + prefix].prefix = prefix;
        });

        return result;
    }
}