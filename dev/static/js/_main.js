/**
 * @description Main JS object of this site
 */
var APP = {
    browser: (function () {
        "use strict";

        var os = '',
            version,
            ua = window.navigator.userAgent,
            platform = window.navigator.platform,
            result = {
                /**
                 * Contain operation system
                 *
                 * @member {Object}
                 */
                os: {
                    win: false,
                    mac: false,
                    linux: false,
                    android: false,
                    ios: false
                },

                /**
                 * Contain current browser
                 *
                 * @member {Object}
                 */
                browser: {
                    opera: false,
                    ie: false,
                    firefox: false,
                    chrome: false,
                    safari: false,
                    android: false
                },
                version: 0
            };

        if (/MSIE/.test(ua)) {
            version = /MSIE \d+[.]\d+/.exec(ua)[0].split(' ')[1];
            result.browser.ie = true;
            result.version = parseInt(version, 10);
        } else if (/Android/.test(ua)) {
            result.os.android = true;
            result.browser.android = true;

            if (/Chrome/.test(ua)) {
                version = /Chrome\/[\d\.]+/.exec(ua)[0].split('/')[1];
                result.version = parseInt(version, 10);
                result.browser.chrome = true;

                result.browser.android = false;
            }

            if (/Firefox/.test(ua)) {
                version = /Firefox\/[\.\d]+/.exec(ua)[0].split('/')[1];
                result.browser.firefox = true;
                result.version = parseInt(version, 10);

                result.browser.android = false;
            }

        } else if (/Chrome/.test(ua)) {
            version = /Chrome\/[\d\.]+/.exec(ua)[0].split('/')[1];
            result.browser.chrome = true;
            result.version = parseInt(version, 10);
        } else if (/Opera/.test(ua)) {
            result.browser.opera = true;
        } else if (/Firefox/.test(ua)) {
            version = /Firefox\/[\.\d]+/.exec(ua)[0].split('/')[1];
            result.browser.firefox = true;
            result.version = parseInt(version, 10);
        } else if (/Safari/.test(ua)) {

            if ((/iPhone/.test(ua)) || (/iPad/.test(ua)) || (/iPod/.test(ua))) {
                result.os.ios = true;
            }

            result.browser.safari = true;
        }

        if (!version) {

            version = /Version\/[\.\d]+/.exec(ua);

            if (version) {

                if (version) {
                    version = version[0].split('/')[1];
                } else {
                    version = /Opera\/[\.\d]+/.exec(ua)[0].split('/')[1];
                }

                result.version = parseInt(version, 10);
            } else {

                if (document.all.length) {
                    result.version = 11;
                    result.browser.ie = true;
                }

            }
        }

        if (platform === 'MacIntel' || platform === 'MacPPC') {
            result.os.mac = true;
        } else if (platform === 'Win32' || platform === 'Win64') {
            result.os.win = true;
        } else if (!os && /Linux/.test(platform)) {
            result.os.linux = true;
        } else if (!os && /Windows/.test(ua)) {
            result.os.win = true;
        } else if (!os && /android/.test(ua)) {
            result.os.android = true;
        }

        return result;

    }()),

    viewport: (function () {
        var result={};

        result.refresh = function () {
            var wwSize = new Array();
            if (window.innerHeight !== undefined) wwSize= [window.innerWidth,window.innerHeight];
            else {
                wwSizeIE = (document.documentElement) ? document.documentElement : document.body;
                wwSize= [wwSizeIE.clientWidth, wwSizeIE.clientHeight];
            }
            result.width =  wwSize[0];
            result.height =  wwSize[1];

            if (result.width<749) result.device = 'mobile';
            else
                if (result.width<981) result.device = 'tablet';
                else result.device = 'desktop';

        };

        result.refresh();

        return result;
    }()),

    /**
     * Init functionality of this site
     *
     * @constructs
     * @method init
     * @memberOf APP
     */
    init: function () {
        "use strict";

        window.addEventListener('DOMContentLoaded', function () {
            module.main.init();
        });

        window.addEventListener('resize', function () {
            APP.viewport.refresh();
        });

    }
};

APP.init();