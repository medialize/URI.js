(function($, undefined){
    window.URL = window.webkitURL || window.URL;
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

function build(files) {
    var $out = $('#output'),
        $progress = $('#prog'),
        sources = [],
        connections = [],
        source;

    $out.parent().hide();
    $progress.show().prop('value', 1).text('Loading Files');

    for (var i = 0, length = files.length; i < length; i++) {
        sources.push("");
        (function(i, file){
            connections.push($.get("src/" + file, function(data) {
                sources[i] = data;
            }, "text"));
        })(i, files[i]);
    }

    $.when.apply($, connections).done(function() {
        $progress.prop('value', 2).text('Compiling Scripts');
        $.post('https://closure-compiler.appspot.com/compile', {
            js_code: sources.join("\n\n"),
            compilation_level: "SIMPLE_OPTIMIZATIONS",
            output_format: "text",
            output_info: "compiled_code"
        }, function(data) {
            var code = "/*! URI.js v1.19.8 http://medialize.github.io/URI.js/ */\n/* build contains: " + files.join(', ') + " */\n" + data;
            $progress.hide();
            $out.val(code).parent().show();
            $out.prev().find('a').remove();
            $out.prev().prepend(download(code));
        }).error(function() {
            alert("Your browser is incapable of cross-domain communication.\nPlease see instructions for manual build below.");
        });
    });
};

function download(code) {
    var blob = new Blob([code], {type: 'text\/javascript'});

    var a = document.createElement('a');
    a.download = 'URI.js';
    a.href = window.URL.createObjectURL(blob);
    a.textContent = 'Download';
    a.dataset.downloadurl = ['text/javascript', a.download, a.href].join(':');

    return a;
};

$(function(){
    $('#builder').on('submit', function(e) {
        var $this = $(this),
            $files = $this.find('input:checked'),
            files = [];

        e.preventDefault();
        e.stopImmediatePropagation();

        if (!$files.length) {
            alert("please choose at least one file!");
            return;
        }

        $files.each(function() {
            var val = $(this).val();
            val.length && files.push(val);
        });

        build(files);
    });
});

})(jQuery);
