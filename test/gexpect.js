(function(root) {

var hasOwn = Object.prototype.hasOwnProperty.call;
var initial = collect();
var expected = {
    gexpect: true
};

function isArray(obj) {
    return String(Object.prototype.toString.call(obj)) === "[object Array]";
}

function collect() {
    var globals = {};
    
    for (var key in root) {
        try {
            globals[key] = true;
        } catch(ex) {}
    }
    
    return globals;
}

window.gexpect = {
    jQuery: ['$', 'jQuery'],
    QUnit: ["urlParams", "isLocal", "module", "asyncTest", "test", "expect", "start", "stop", "assert", "ok", "equal", "notEqual", "deepEqual", "notDeepEqual", "strictEqual", "notStrictEqual", "throws", "raises", "equals", "same", "QUnit"],
    add: function(key) {
        if (arguments.length > 1) {
            this.add.call(this, Array.prototype.slice.call(arguments, 0));
        } else if (isArray(key)) {
            for (var i = 0, l = key.length; i < l; i++) {
                expected[key[i]] = true;
            }
        } else if (typeof key === "string") {
            expected[key] = true;
        } else {
            throw new Error('gexpect.add() expects string or array of strings!');
        }
        
        return this;
    },
    find: function() {
        var globals = collect();
        var unexpected = [];
        for (var key in globals) {
            if (initial[key] || expected[key]) {
                continue;
            }
            
            unexpected.push(key);
        }
        
        return unexpected;
    },
    verify: function(name) {
        var unexpected = this.find();
        if (unexpected.length) {
            console.warn('Unexpected global variables after ' + name + ': ' + unexpected.join(', '));
        }
    }
};

})(this);