module.exports = function(grunt) {
    grunt.initConfig( {
        uglify : {
            build : {
                files   : [
                    {
                        expand  : true,
                        cwd     : 'source/js',
                        src     : '**/*.js',
                        dest    : 'js/',
                    }
                ]
            }
        },
        cssmin : {
            options : {
                report  : 'gzip'
            },
            build : {
                files   : [
                    {
                        expand  : true,
                        cwd     : 'source/css',
                        src     : '**/*.css',
                        dest    : 'css/',
                    }
                ]
            }
        },
        htmlmin : {
            options : {
                removeComments      : true,
                collapseWhitespace  : true,
                minifyCSS           : true,
                minifyJS            : true
            },
            build : {
                files   : [
                    {
                        expand  : true,
                        cwd     : 'source/',
                        src     : '*.html',
                        dest    : './',
                    }
                ]
            }
        },
        compress : {
            options : {
                mode    : 'gzip'
            },
            build : {
                files : [
                    {
                        expand  : true,
                        cwd     : './',
                        src     : '*.html',
                        dest    : './',
                    }, 
                    {
                        expand  : true,
                        cwd     : './js',
                        src     : '*.js',
                        dest    : './js',
                    },    
                    {
                        expand  : true,
                        cwd     : './css',
                        src     : '*.css',
                        dest    : './css',
                    }
                ]
            }
        },
        imagemin    : {
            png     : {
                options     : {
                    optimizationLevel   : 7
                },
                files       : [ 
                    {
                        expand  : true,
                        cwd     : 'source/img',
                        src     : '**/*.png',
                        dest    : './img'
                    }
                ]
            },
            jpg     : {
                options     : {
                    progressive     : true
                },
                files   : [
                    {
                        expand  : true,
                        cwd     : 'source/img',
                        src     : '**/*.jpg',
                        dest    : './img'
                    }
                ]
            }
        },
        copy : {
            build : {
                files   : [
                   {
                        expand  : true,
                        cwd     : 'source/',
                        src     : '*.html',
                        dest    : './',
                    },
                    {
                        expand  : true,
                        cwd     : 'source/css',
                        src     : '**/*.css',
                        dest    : 'css/',
                    },
                    {
                        expand  : true,
                        cwd     : 'source/js',
                        src     : '**/*.js',
                        dest    : 'js/',
                    }
                ]
            }
        }  
                                 
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-imagemin');

    if(grunt.option("dev")) {
        grunt.registerTask('default', ['copy']);
    }
    else {
        grunt.registerTask('default', ['uglify', 'cssmin', 'htmlmin', 'imagemin']);
    }
}