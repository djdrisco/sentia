require.config({
        deps: ['main'],
        paths:
        {
            jquery: '../../vendor/jquery/jquery',
            underscore: '../../vendor/underscore/underscore',
            backbone: '../../vendor/backbone/backbone',
            d3: '../../vendor/d3/d3',
            handlebars: '../../vendor/handlebars/handlebars',
            layoutmanager: '../../vendor/layoutmanager/backbone.layoutmanager',
            moment: '../../vendor/moment/moment',
            'klayjsd3': '../../vendor/klayjs-d3-requirejs/klayjs-d3-requirejs',
            'klay': '../../vendor/klayjs/klay',
            q: '../../vendor/q/q',
            colorbrewer: '../../vendor/colorbrewer/colorbrewer'
        },
        waitSeconds: 0,
        shim: {
            underscore: {
                exports: '_'
            },
            backbone: {
                deps: ['underscore', 'jquery'],
                exports: 'Backbone'
            },
            handlebars: {
                exports: 'Handlebars'
            },
            layoutmanager: {
                deps: ['backbone']
            },
            'klay': {
                exports: 'klay'
            },
            'klayjsd3': {
                exports: 'klayjsd3'
            },
            colorbrewer: {
                exports: 'colorbrewer'
            }
        },
        config: {
            moment: {
                noGlobal: true
            }
        }
    }
);