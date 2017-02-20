### This fork adds : 

* CommonJS & Browser Compatibility
* URI templating & Pattern Matching extension : URI.pattern-templating.js

Extract data from uri using template :

```
  URI(uri).extract(template)
```

Generate uri from template and data : 

```
  URI.generate(template, data)
```

```javascript

> URI("https://twitter.com/Evangenieur/status/143512989688008704")
    .extract("https://twitter.com/{nickanme}/status/{status_id}")
{ nickanme: 'Evangenieur',
  status_id: '143512989688008704' }


> URI("http://www.youtube.com/watch?feature=youtube_gdata_player&v=S23owdOuLjc")
   .extract("http://www.youtube.com/watch?v={video_id}")
{ video_id: 'S23owdOuLjc' }

// More Complex
> uri = 'http://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=14&size=512x512&maptype=roadmap&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318&markers=color:red%7Ccolor:red%7Clabel:C%7C40.718217,-73.998284&sensor=false'

> template = 'http://maps.googleapis.com/maps/api/{map}?sensor={sensor}&center={center}&size={width}x{height}&markers=color:{markers.color}|label:{markers.label}|{markers.long},{markers.lat}'

> result = URI(uri).extract(template)
{ sensor: 'false',
  center: 'Brooklyn Bridge,New York,NY',
  width: '512',
  height: '512',
  map: 'staticmap',
  markers: 
   [ { color: 'blue',
       label: 'S',
       long: '40.702147',
       lat: '-74.015794' },
     { color: 'green',
       label: 'G',
       long: '40.711614',
       lat: '-74.012318' },
     { color: 'red|color:red',
       label: 'C',
       long: '40.718217',
       lat: '-73.998284' } ] }

// Generating an uri from template and data

> URI.generate(template, result)
"http://maps.googleapis.com/maps/api/staticmap?sensor=false&center=Brooklyn+Bridge%2CNew+York%2CNY&size=512x512&markers=color%3Ablue%7Clabel%3AS%7C40.702147%2C-74.015794&markers=color%3Agreen%7Clabel%3AG%7C40.711614%2C-74.012318&markers=color%3Ared%7Ccolor%3Ared%7Clabel%3AC%7C40.718217%2C-73.998284"

```
  

# URI.js #

[![CDNJS](https://img.shields.io/cdnjs/v/URI.js.svg)](https://cdnjs.com/libraries/URI.js)
* [About](http://medialize.github.io/URI.js/)
* [Understanding URIs](http://medialize.github.io/URI.js/about-uris.html)
* [Documentation](http://medialize.github.io/URI.js/docs.html)
* [jQuery URI Plugin](http://medialize.github.io/URI.js/jquery-uri-plugin.html)
* [Author](http://rodneyrehm.de/en/)
* [Changelog](./CHANGELOG.md)

---

> **NOTE:** The npm package name changed to `urijs`

---

I always want to shoot myself in the head when looking at code like the following:

```javascript
var url = "http://example.org/foo?bar=baz";
var separator = url.indexOf('?') > -1 ? '&' : '?';

url += separator + encodeURIComponent("foo") + "=" + encodeURIComponent("bar");
```

Things are looking up with [URL](https://developer.mozilla.org/en/docs/Web/API/URL) and the [URL spec](http://url.spec.whatwg.org/) but until we can safely rely on that API, have a look at URI.js for a clean and simple API for mutating URIs:

```javascript
var url = new URI("http://example.org/foo?bar=baz");
url.addQuery("foo", "bar");
```

URI.js is here to help with that.


## API Example ##

```javascript
// mutating URLs
URI("http://example.org/foo.html?hello=world")
  .username("rodneyrehm")
    // -> http://rodneyrehm@example.org/foo.html?hello=world
  .username("")
    // -> http://example.org/foo.html?hello=world
  .directory("bar")
    // -> http://example.org/bar/foo.html?hello=world
  .suffix("xml")
    // -> http://example.org/bar/foo.xml?hello=world
  .query("")
    // -> http://example.org/bar/foo.xml
  .tld("com")
    // -> http://example.com/bar/foo.xml
  .query({ foo: "bar", hello: ["world", "mars"] });
    // -> http://example.com/bar/foo.xml?foo=bar&hello=world&hello=mars

// cleaning things up
URI("?&foo=bar&&foo=bar&foo=baz&")
  .normalizeQuery();
    // -> ?foo=bar&foo=baz

// working with relative paths
URI("/foo/bar/baz.html")
  .relativeTo("/foo/bar/world.html");
    // -> ./baz.html

URI("/foo/bar/baz.html")
  .relativeTo("/foo/bar/sub/world.html")
    // -> ../baz.html
  .absoluteTo("/foo/bar/sub/world.html");
    // -> /foo/bar/baz.html

// URI Templates
URI.expand("/foo/{dir}/{file}", {
  dir: "bar",
  file: "world.html"
});
// -> /foo/bar/world.html
```

See the [About Page](http://medialize.github.io/URI.js/) and [API Docs](http://medialize.github.io/URI.js/docs.html) for more stuff.

## Using URI.js ##

URI.js (without plugins) has a gzipped weight of about 7KB - if you include all extensions you end up at about 13KB. So unless you *need* second level domain support and use URI templates, we suggest you don't include them in your build. If you don't need a full featured URI mangler, it may be worth looking into the much smaller parser-only alternatives [listed below](#alternatives).

URI.js is available through [npm](https://www.npmjs.com/package/urijs), [bower](http://bower.io/search/?q=urijs), [bowercdn](http://bowercdn.net/package/urijs), [cdnjs](https://cdnjs.com/libraries/URI.js) and manually from the [build page](http://medialize.github.io/URI.js/build.html):

```bash
# using bower
bower install uri.js

# using npm
npm install urijs
```

### Browser ###

I guess you'll manage to use the [build tool](http://medialize.github.io/URI.js/build.html) or follow the [instructions below](#minify) to combine and minify the various files into URI.min.js - and I'm fairly certain you know how to `<script src=".../URI.min.js"></script>` that sucker, too.

### Node.js and NPM ###

Install with `npm install urijs` or add `"urijs"` to the dependencies in your `package.json`.

```javascript
// load URI.js
var URI = require('urijs');
// load an optional module (e.g. URITemplate)
var URITemplate = require('urijs/src/URITemplate');

URI("/foo/bar/baz.html")
  .relativeTo("/foo/bar/sub/world.html")
    // -> ../baz.html
```

### RequireJS ###

Clone the URI.js repository or use a package manager to get URI.js into your project. 

```javascript
require.config({
  paths: {
    urijs: 'where-you-put-uri.js/src'
  }
});

require(['urijs/URI'], function(URI) {
  console.log("URI.js and dependencies: ", URI("//amazon.co.uk").is('sld') ? 'loaded' : 'failed');
});
require(['urijs/URITemplate'], function(URITemplate) {
  console.log("URITemplate.js and dependencies: ", URITemplate._cache ? 'loaded' : 'failed');
});
```

## Minify ##

See the [build tool](http://medialize.github.io/URI.js/build.html) or use [Google Closure Compiler](http://closure-compiler.appspot.com/home):

```
// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// @output_file_name URI.min.js
// @code_url http://medialize.github.io/URI.js/src/IPv6.js
// @code_url http://medialize.github.io/URI.js/src/punycode.js
// @code_url http://medialize.github.io/URI.js/src/SecondLevelDomains.js
// @code_url http://medialize.github.io/URI.js/src/URI.js
// @code_url http://medialize.github.io/URI.js/src/URITemplate.js
// ==/ClosureCompiler==
```


## Resources ##

Documents specifying how URLs work:

* [URL - Living Standard](http://url.spec.whatwg.org/)
* [RFC 3986 - Uniform Resource Identifier (URI): Generic Syntax](http://tools.ietf.org/html/rfc3986)
* [RFC 3987 - Internationalized Resource Identifiers (IRI)](http://tools.ietf.org/html/rfc3987)
* [RFC 2732 - Format for Literal IPv6 Addresses in URL's](http://tools.ietf.org/html/rfc2732)
* [RFC 2368 - The `mailto:` URL Scheme](https://www.ietf.org/rfc/rfc2368.txt)
* [RFC 2141 - URN Syntax](https://www.ietf.org/rfc/rfc2141.txt)
* [IANA URN Namespace Registry](http://www.iana.org/assignments/urn-namespaces/urn-namespaces.xhtml)
* [Punycode: A Bootstring encoding of Unicode for Internationalized Domain Names in Applications (IDNA)](http://tools.ietf.org/html/rfc3492)
* [application/x-www-form-urlencoded](http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type) (Query String Parameters) and [application/x-www-form-urlencoded encoding algorithm](http://www.whatwg.org/specs/web-apps/current-work/multipage/association-of-controls-and-forms.html#application/x-www-form-urlencoded-encoding-algorithm)
* [What every web developer must know about URL encoding](http://blog.lunatech.com/2009/02/03/what-every-web-developer-must-know-about-url-encoding)

Informal stuff

* [Parsing URLs for Fun and Profit](http://tools.ietf.org/html/draft-abarth-url-01)
* [Naming URL components](http://tantek.com/2011/238/b1/many-ways-slice-url-name-pieces)

How other environments do things

* [Java URI Class](http://docs.oracle.com/javase/7/docs/api/java/net/URI.html)
* [Java Inet6Address Class](http://docs.oracle.com/javase/1.5.0/docs/api/java/net/Inet6Address.html)
* [Node.js URL API](http://nodejs.org/docs/latest/api/url.html)

[Discussion on Hacker News](https://news.ycombinator.com/item?id=3398837)

### Forks / Code-borrow ###

* [node-dom-urls](https://github.com/passy/node-dom-urls) passy's partial implementation of the W3C URL Spec Draft for Node
* [urlutils](https://github.com/cofounders/urlutils) cofounders' `window.URL` constructor for Node

### Alternatives ###

If you don't like URI.js, you may like one of the following libraries. (If yours is not listed, drop me a line…)

#### Polyfill ####

* [DOM-URL-Polyfill](https://github.com/arv/DOM-URL-Polyfill/) arv's polyfill of the [DOM URL spec](https://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#interface-urlutils) for browsers
* [inexorabletash](https://github.com/inexorabletash/polyfill/#whatwg-url-api) inexorabletash's [WHATWG URL API](http://url.spec.whatwg.org/)

#### URL Manipulation ####

* [The simple <a> URL Mutation "Hack"](http://jsfiddle.net/rodneyrehm/KkGUJ/) ([jsPerf comparison](http://jsperf.com/idl-attributes-vs-uri-js))
* [URL.js](https://github.com/ericf/urljs)
* [furl (Python)](https://github.com/gruns/furl)
* [mediawiki Uri](https://svn.wikimedia.org/viewvc/mediawiki/trunk/phase3/resources/mediawiki/mediawiki.Uri.js?view=markup) (needs mw and jQuery)
* [jurlp](https://github.com/tombonner/jurlp)
* [jsUri](https://github.com/derek-watson/jsUri)

#### URL Parsers ####

* [The simple <a> URL Mutation "Hack"](http://jsfiddle.net/rodneyrehm/KkGUJ/) ([jsPerf comparison](http://jsperf.com/idl-attributes-vs-uri-js))
* [URI Parser](http://blog.stevenlevithan.com/archives/parseuri)
* [jQuery-URL-Parser](https://github.com/allmarkedup/jQuery-URL-Parser)
* [Google Closure Uri](https://google.github.io/closure-library/api/class_goog_Uri.html)
* [URI.js by Gary Court](https://github.com/garycourt/uri-js)

#### URI Template ####

* [uri-template](https://github.com/rezigned/uri-template.js) (supporting extraction as well) by Rezigne
* [uri-templates](https://github.com/geraintluff/uri-templates) (supporting extraction as well) by Geraint Luff
* [uri-templates](https://github.com/marc-portier/uri-templates) by Marc Portier
* [uri-templates](https://github.com/geraintluff/uri-templates) by Geraint Luff (including reverse operation)
* [URI Template JS](https://github.com/fxa/uritemplate-js) by Franz Antesberger
* [Temple](https://github.com/brettstimmerman/temple) by Brett Stimmerman
* ([jsperf comparison](http://jsperf.com/uri-templates/2))

#### Various ####

* [TLD.js](https://github.com/oncletom/tld.js) - second level domain names
* [Public Suffix](http://mxr.mozilla.org/mozilla-central/source/netwerk/dns/effective_tld_names.dat?raw=1) - second level domain names
* [uri-collection](https://github.com/scivey/uri-collection) - underscore based utility for working with many URIs

## Authors ##

* [Rodney Rehm](https://github.com/rodneyrehm)
* [Various Contributors](https://github.com/medialize/URI.js/graphs/contributors)


## Contains Code From ##

* [punycode.js](http://mths.be/punycode) - Mathias Bynens
* [IPv6.js](http://intermapper.com/support/tools/IPV6-Validator.aspx) - Rich Brown - (rewrite of the original)


## License ##

URI.js is published under the [MIT license](http://www.opensource.org/licenses/mit-license). Until version 1.13.2 URI.js was also published under the [GPL v3](http://opensource.org/licenses/GPL-3.0) license - but as this dual-licensing causes more questions than helps anyone, it was dropped with version 1.14.0.


## Changelog ##

moved to [Changelog](./CHANGELOG.md)
