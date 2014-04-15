module.exports = function(grunt) {
  'use strict';

  var jshintOptions = grunt.file.readJSON('.jshintrc');
  jshintOptions.reporter = require('jshint-stylish');

  grunt.initConfig({
    jshint: {
      options: jshintOptions,
      target: [
        'Gruntfile.js',
        'src/*.js',
        'test/*.js',
        '!src/*.min.js',
        '!src/punycode.js'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('lint', 'jshint');
};
