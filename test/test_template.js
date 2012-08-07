// http://tools.ietf.org/html/rfc6570#section-1.2
var levels = {
    "Level 1" : {
        expressions : {
            'Simple string expansion' : {
                "{var}" : "value",
                "{hello}" : "Hello%20World%21"
            }
        },
        values : {
            "var" : "value",
            "hello" : "Hello World!"
        }
    },
    "Level 2" : {
        expressions : {
            'Reserved string expansion' : {
                "{+var}" : "value",
                "{+hello}" : "Hello%20World!",
                "{+path}/here" : "/foo/bar/here",
                "here?ref={+path}" : "here?ref=/foo/bar"
            },
            'Fragment expansion, crosshatch-prefixed' : {
                "X{#var}" : "X#value",
                "X{#hello}" : "X#Hello%20World!"
            }
        },
        values : {
            "var" : "value",
            "hello" : "Hello World!",
            "path" : "/foo/bar"
        }
    },
    "Level 3" : {
        expressions : {
            "String expansion with multiple variables" : {
                "map?{x,y}" : "map?1024,768",
                "{x,hello,y}" : "1024,Hello%20World%21,768"
            },
            "Reserved expansion with multiple variables" : {
                "{+x,hello,y}" : "1024,Hello%20World!,768",
                "{+path,x}/here" : "/foo/bar,1024/here"
            },
            "Fragment expansion with multiple variables" : {
                "{#x,hello,y}" : "#1024,Hello%20World!,768",
                "{#path,x}/here" : "#/foo/bar,1024/here"
            },
            "Label expansion, dot-prefixed" : {
                "X{.var}" : "X.value",
                "X{.x,y}" : "X.1024.768"
            },
            "Path segments, slash-prefixed" : {
                "{/var}" : "/value",
                "{/var,x}/here" : "/value/1024/here"
            },
            "Path-style parameters, semicolon-prefixed" : {
                "{;x,y}" : ";x=1024;y=768",
                "{;x,y,empty}" : ";x=1024;y=768;empty"
            },
            "Form-style query, ampersand-separated" : {
                "{?x,y}" : "?x=1024&y=768",
                "{?x,y,empty}" : "?x=1024&y=768&empty="
            },
            "Form-style query continuation" : {
                "?fixed=yes{&x}" : "?fixed=yes&x=1024",
                "{&x,y,empty}" : "&x=1024&y=768&empty="
            }
        },
        values : {
            "var" : "value",
            "hello" : "Hello World!",
            "empty" : "",
            "path" : "/foo/bar",
            "x" : "1024",
            "y" : "768"
        }
    },
    "Level 4" : {
        expressions : {
            "String expansion with value modifiers" : {
                "{var:3}" : "val",
                "{var:30}" : "value",
                "{list}" : "red,green,blue",
                "{list*}" : "red,green,blue",
                "{keys}" : "semi,%3B,dot,.,comma,%2C",
                "{keys*}" : "semi=%3B,dot=.,comma=%2C"
            },
            "Reserved expansion with value modifiers" : {
                "{+path:6}/here" : "/foo/b/here",
                "{+list}" : "red,green,blue",
                "{+list*}" : "red,green,blue",
                "{+keys}" : "semi,;,dot,.,comma,,",
                "{+keys*}" : "semi=;,dot=.,comma=,"
            },
            "Fragment expansion with value modifiers" : {
                "{#path:6}/here" : "#/foo/b/here",
                "{#list}" : "#red,green,blue",
                "{#list*}" : "#red,green,blue",
                "{#keys}" : "#semi,;,dot,.,comma,,",
                "{#keys*}" : "#semi=;,dot=.,comma=,"
            },
            "Label expansion, dot-prefixed" : {
                "X{.var:3}" : "X.val",
                "X{.list}" : "X.red,green,blue",
                "X{.list*}" : "X.red.green.blue",
                "X{.keys}" : "X.semi,%3B,dot,.,comma,%2C",
                "X{.keys*}" : "X.semi=%3B.dot=..comma=%2C"
            },
            "Path segments, slash-prefixed" : {
                "{/var:1,var}" : "/v/value",
                "{/list}" : "/red,green,blue",
                "{/list*}" : "/red/green/blue",
                "{/list*,path:4}" : "/red/green/blue/%2Ffoo",
                "{/keys}" : "/semi,%3B,dot,.,comma,%2C",
                "{/keys*}" : "/semi=%3B/dot=./comma=%2C"
            },
            "Path-style parameters, semicolon-prefixed" : {
                "{;hello:5}" : ";hello=Hello",
                "{;list}" : ";list=red,green,blue",
                "{;list*}" : ";list=red;list=green;list=blue",
                "{;keys}" : ";keys=semi,%3B,dot,.,comma,%2C",
                "{;keys*}" : ";semi=%3B;dot=.;comma=%2C"
            },

            "Form-style query, ampersand-separated" : {
                "{?var:3}" : "?var=val",
                "{?list}" : "?list=red,green,blue",
                "{?list*}" : "?list=red&list=green&list=blue",
                "{?keys}" : "?keys=semi,%3B,dot,.,comma,%2C",
                "{?keys*}" : "?semi=%3B&dot=.&comma=%2C"
            },
            "Form-style query continuation" : {
                "{&var:3}" : "&var=val",
                "{&list}" : "&list=red,green,blue",
                "{&list*}" : "&list=red&list=green&list=blue",
                "{&keys}" : "&keys=semi,%3B,dot,.,comma,%2C",
                "{&keys*}" : "&semi=%3B&dot=.&comma=%2C"
            }
        },
        values : {
            "var" : "value",
            "hello" : "Hello World!",
            "path" : "/foo/bar",
            "list" : ["red", "green", "blue"],
            "keys" : [
                {"semi" : ";"}, 
                {"dot" : "."},
                {"comma" : ","}
            ]
        }
    }
};

module("URITemplate");
// [].forEach() no IE, lacking interest in polyfilling this...
for (var i in levels) {
    (function(level, data){
        test(level, function() {
            var template, expression, expansion;
            for (type in data.expressions) {
                for (expression in data.expressions[type]) {
                    template = new URITemplate(expression);
                    expansion = template.expand(data.values);
                    equal(expansion, data.expressions[type][expression], type + ": " + expression);
                }
            }
        });
    })(i, levels[i]);
};
