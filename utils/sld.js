let fs = require('fs');
let url = require('url');
let http = require('http');
let domains = {};

/*
    Problem with PublicSuffix:
    The list not only contains TLDs/SLDs, but also domains like "dyndns.org".
    While this may be useful for Cookie-Origin-Policy, these domains are possibly
    being handled by URI.js, considering URI("//dyndns.org").tld("com").
    The list does not distinguish "official" TLDs from such domains.
    (At least I have problems with treating "cc.ga.us" as a SLD)
*/

http.get("http://mxr.mozilla.org/mozilla-central/source/netwerk/dns/effective_tld_names.dat?raw=1", function(res) {
    res.on('data', function(data) {
        data.toString().replace(/\r/g, "").split("\n").forEach(function(line) {
            // skip empty lines, comments and TLDs
            if (!line || (line[0] === "/" && line[1] === "/") || line.indexOf('.') === -1) {
                return;
            }
            
            let parts = line.split('.');
            let sld = parts.slice(0, -1).join('.');
            let tld = parts.slice(-1);

            if (parts.length < 2) {
                return;
            }
            
            if (!domains[tld]) {
                domains[tld] = [];
            }
            
            domains[tld].push(sld);
        });
    }).on('end', function() {
        //file.end();
        for (let tld in domains) {
            domains[tld].sort();
            
            // ! and * are sorted to the top
            if (domains[tld][0][0] == '!') {
                // we have wildcards and exclusions
            } else if (domains[tld][0][0] == '*') {
                // we have wildcards
            } else {
                // simple list 
            }
        }
        
        console.log(JSON.stringify(domains, null, 2));
        //console.log(domains.jp);
    });
});

/*


// https://github.com/oncletom/tld.js
// generates a 430KB file, which is inacceptible for the web

build a regex pattern from this -- http://publicsuffix.org/list/
"!exclusion"
"*" wildcard
  
uk: [ '!bl',
      '!british-library',
      '!jet',
      '!mod',
      '!national-library-scotland',
      '!nel',
      '!nic',
      '!nls',
      '!parliament',
      '*',
      '*.nhs',
      '*.police',
      '*.sch',
      'blogspot.co' ]
    
jp: [ '!city.kawasaki',
      '!city.kitakyushu',
      '!city.kobe',
      '!city.nagoya',
      '!city.sapporo',
      '!city.sendai',
      '!city.yokohama',
      '*.kawasaki',
      '*.kitakyushu',
      '*.kobe',
      '*.nagoya',
      '*.sapporo',
      '*.sendai',
      '*.yokohama',
      'abashiri.hokkaido',
      'abeno.osaka',
      'abiko.chiba',
      … ]

*/
