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
// ------------------------------
// init basic modules:
// - form validate
// - ajax for forms
// - show popups


if (!window.module) {
    window.module = {};
}

/**
 * @module main
 */
module.main = (function () {
    "use strict";

    var controls = {
            Timer: null

        },
        core = {

            validateForm: function (form) {
                var i,
                    ok = true;

                clearTimeout(controls.Timer);

                $(form).find('[required]').each(function () {
                    if ($(this).val()=="") {
                        ok = false;
                        $(this).addClass("validate-invalid");
                    }
                });


                $(form).find('[type=email]').each(function () {
                    if (!$(this).hasClass("validate-invalid")) {
                        if (!/^\w+[a-zA-Z0-9_.-]*@{1}\w{1}[a-zA-Z0-9_.-]*\.{1}\w{2,4}$/.test($(this).val())) {
                            ok = false;
                            $(this).addClass("validate-invalid");
                        }
                    }
                });
                /*
                if (pass!==undefined) {
                    if (($(pass[0]).val()!==$(pass[1]).val())&& !$(pass[1]).hasClass("errorField") ) {
                        ok = false;
                        $(this).addClass("validate-invalid");
                    }
                }*/

                controls.Timer = setTimeout(function() {
                    $(".validate-invalid").removeClass("validate-invalid");
                }, 3000);

                return ok
            },

            ajaxAddContent: function (e) {
                var url = $(this).data("url"),
                    data = $(this).data("data"),
                    wrap = $(this).data("container");

                $.ajax({
                    url: url,
                    type: "post",
                    data: data,
                    dataType: 'json',
                    success: function (response) {
                        $(wrap).append(response.content);
                    },
                    error: function (xhr) {
                        console.log(xhr);
                    }
                });

            }


        },
        handlers = {

            /**
             * Processing to submit form
             *
             * @memberOf module:main
             * @param event
             */
            formSubmit: function (event) {
                var form = event.target,
                    activeElement = document.activeElement,
                    success = function (response) {

                        form.reset();



                        if (response.showmodal) {

                            handlers.showPopup(form, response.showmodal);
                        }

                    },
                    error = function (xhr) {
                        console.log(xhr);
                    },
                    request;


                if($(form).data("validate")==true) { // Требуется валидация

                    $(".validate-invalid").removeClass("validate-invalid");

                    var valid = core.validateForm(form);

                    if (!valid) {
                        event.preventDefault();
                        return false;
                    }
                }

                if($(form).data("ajax")==true) { // Форма отправляется аяксом
                    event.preventDefault();

                    request = {
                        url: form.getAttribute('action'),
                        type: form.getAttribute('method'),
                        data: $(form).serialize(),
                        dataType: 'json',
                        success: success,
                        error: error
                    };

                    $.ajax(request);

                }


            },

            // element - элемент дял которого показываем попап и откуда считаваем парамтеры для попапа
            // message - содержимое попапа
            showPopup: function (element, message) {

                var popupParametrs = element.getAttribute('data-type-popup');

                popupParametrs = JSON.parse(popupParametrs);

                module.popup.show({
                    element: element,
                    subClass: 'message',
                    message: message,
                    type: popupParametrs.type,
                    backgroundVisibility: popupParametrs.bgVis,
                    popupPos: popupParametrs.pos

                });

            },


            clickForPopup: function (event) {

                var elementClick = event.target,
                    idElem = elementClick.getAttribute('data-type-popup');

                idElem = JSON.parse(idElem);
                idElem = idElem.idTemplate;


                handlers.showPopup(elementClick, $('#'+ idElem));

            },


            moreGoods: function () {
                var data = $(controls.filterForm).serialize();
                core.getMoreCards(data);
            },

            preventDefault: function (event) {
                event.preventDefault();
            }
        };

    /**
     * Get page controls
     *
     * @memberOf module:main
     */
    function getControls() {
        var doc = document;

        controls.Html = $('html');

        // controls.sliderColumns = $('.slider-column');
        // controls.sliders= $('.slider');
        //
        // controls.sliderItem= $('.item .item-product-gallery__list');
        // controls.sliderItemBig= $('.item .item-product-gallery__big');

    }

    /**
     * Set listeners
     *
     * @memberOf module:main
     */
    function addEventList() {

        var body = document.body,
            jDoc = $(document),
            win = window;

        win.addEventListener('submit', handlers.formSubmit, false);

        // example for jQuery
        jDoc.on('click', '.show-popup', handlers.clickForPopup);

    }

    function pluginsInit () {

        $('.select-custom').customSelect();
        $(".quantity").quantityInit({ min: 1, max: 18, step: 1 });


        // layout waterfall init
        var $waterfall = $('.layout-list_waterfall');
        if ( !$waterfall.length ) return;

        wookmark();

        // update wookmark after window resize
        $( window ).resize(function() {
            wookmark();
        });

        function wookmark() {
            $waterfall.wookmark({
                offset: 50,
                align: 'left'  // чтобы на некоторых разрешениях не бросалось в глаза отступленяи от сетки
            });
        }

    }

    /**
     * Init this module
     *
     * @memberOf module:main
     */
    function init() {
        getControls();
        addEventList();

        pluginsInit();
    }

    return {
        init: init
    };
}());
/**
 * @author Valeriy Siestov
 */

/*global module, document, window, setTimeout, DocumentFragment */
/*jslint plusplus: true */

// ------------------------------
// возможности:
// - показ окна со вставкой содержимого из ajax ответа
// - скрытие окна (по кнопке close, esc, клик по фону)
// - показ с фоном или без (data-type-popup={"bgVis": true/false}. default - true
// - показ по центру экрана (data-type-popup={"pos": "center"}) или рядом с элементом (data-type-popup={"pos": "near"})
// - показ текстового содержимого data-type-popup={"type": "empty"}
// - показ содержимого статического html содержимого data-type-popup={"type": "htmlTemplate", "idTemplate": "example-popup-content"}



if (!window.module) {
    window.module = {};
}

/**
 * @module popup
 */
module.popup = (function () {
    "use strict";

    /**
     * Implementation functionality of popup window
     *
     * @class Popup
     * @memberOf module:popup
     */
    function Popup() {

        var self = this,
            queue = [];

        /**
         * @property {boolean} isVisible
         * @property {boolean} inDom
         * @type {object}
         */
        this.controls = {
            isVisible: false,
            inDom: false,
            handlers: null
        };

        /**
         * popup event handlers
         */
        this.handlers = {

            /**
             * show popup
             *
             * @method showPopup
             * @param popupBackground
             * @param popup
             * @memberOf module:popup.Popup
             */
            showPopup: function (popupBackground, popup) {
                self.controls.isVisible = true;

                popupBackground.classList.add('active');
                setTimeout(function () {
                    popupBackground.classList.add('animate');
                    popup.classList.add('active');
                }, 100);

            },

            /**
             * hide popup
             *
             * @method hidePopup
             * @param popupBackground
             * @param popup
             * @param controls
             * @memberOf module:popup.Popup
             */
            hidePopup: function (popupBackground, popup, controls) {

                var animateCallback = function () {
                    popupBackground.removeEventListener('transitionend', animateCallback);
                    popupBackground.removeEventListener('webkitTransitionEnd', animateCallback);
                    popupBackground.classList.remove('active');
                    popup.classList.remove('active');
                    popupBackground.classList.remove('active');
                    popupBackground.parentNode.removeChild(popupBackground);


                    // удаляем стили для случая если окно было без фона и/или позиционировалось относительно
                    // удялем это по завершению анимации скрытия
                    popupBackground.classList.remove('popup_without-background');

                    popup.classList.remove('popup-window_compact');
                    popup.style.left = 'auto';
                    popup.style.top = 'auto';

                };

                if (!controls.isVisible) {
                    controls.hideCallback = null;
                    controls.showCallback = null;
                }

                controls.isVisible = false;

                popupBackground.classList.remove('animate');

                popupBackground.addEventListener('transitionend', animateCallback);
                popupBackground.addEventListener('webkitTransitionEnd', animateCallback);

                if (document.all !== undefined && !window.atob) {
                    animateCallback();
                }


            },

            /**
             * Show popup
             *
             *
             * @method show
             * @param {(object|string)} data
             * @memberOf module:popup.Popup
             */
            show: function (data) {

                var controls = self.controls,
                    popupBackground = controls.background,
                    popup = controls.popup,
                    popupContent = controls.popupContent,
                    popupData = [],
                    showCallback = data.showCallback || function () { return false; },
                    handlers = data.handlers,
                    handlersCount,
                    i,
                    tempElement,
                    labels,
                    labelsCount,
                    tempAttribute,
                    tempInput;

                controls.handlers = handlers;

                controls.hideCallback = data.hideCallback || function () { return false; };

                if (data.type === undefined) {
                    data.type = '';
                }

                document.body.appendChild(controls.background);

                // if form attr data-type-popup="bgVis": false, than background hide
                if(!data.backgroundVisibility) {
                    popupBackground.setAttribute('class', 'popup popup_without-background');
                }

                if(data.popupPos != 'center') {

                    var pos = self.handlers.getPos(data.element);

                    popup.classList.add('popup-window_compact');
                    popup.style.left = pos.left + 'px';
                    popup.style.top = pos.top + 'px';
                }

                self.addEventList();


                if (data.bgClass) {
                    popupBackground.classList.add(data.bgClass);
                }

                popupContent.setAttribute('class', 'popup-content');


                if (!(data instanceof Object)) {
                    popupData = self.create.empty(data);
                } else {
                    switch (data.type) {
                    case 'confirm':
                        popupData = self.create.confirm(data);
                        break;
                    case 'htmlTemplate':
                        popupData = self.create.htmlTemplate(data);
                        break;
                    default:
                        popupData = self.create.empty(data.message);

                    }
                }

                if (data.message instanceof DocumentFragment) {
                    popupContent.innerHTML = '';
                    popupContent.appendChild(data.message);
                } else {
                    popupContent.innerHTML = popupData.join('');
                }

                labels = popupContent.querySelectorAll('label');
                labelsCount = labels.length;

                for (i = 0; i < labelsCount; i++) {
                    tempAttribute = labels[i].getAttribute('for');
                    labels[i].setAttribute('for', 'popup-' + tempAttribute);
                    tempInput = popupContent.querySelector('#' + tempAttribute);

                    if (tempInput) {
                        tempInput.setAttribute('id', 'popup-' + tempAttribute);
                    }
                }

                if (handlers) {
                    handlersCount = handlers.length;

                    for (i = 0; i < handlersCount; i++) {
                        tempElement = popupContent.querySelector(handlers[i].selector);
                        tempElement.addEventListener(handlers[i].event, handlers[i].handler, false);
                    }

                }

                self.controls.callback();

                self.handlers.showPopup(popupBackground, popup, popupContent, function () {
                    var queueData;

                    showCallback(popupContent);

                    if (queue.length) {
                        queueData = queue.splice(0, 1);
                        self.handlers.hide();
                        self.controls.callback = function () {
                            self.show(queueData[0]);
                        };
                    }
                });
            },

            // вычисление позиции для попаов, которые не центрируем
            getPos: function getOffsetRect(elem) {

                var box = elem.getBoundingClientRect(),

                    body = document.body,
                    docElem = document.documentElement,

                    clientTop = docElem.clientTop || body.clientTop || 0,
                    clientLeft = docElem.clientLeft || body.clientLeft || 0,

                    top  = box.top  - clientTop,
                    left = box.left - clientLeft;

                return { top: Math.round(top), left: Math.round(left) }
            },

            /**
             * Hide popup
             *
             * @method hide
             * @memberOf module:popup.Popup
             */
            hide: function (element) {

                var controls = self.controls,
                    popupBackground = controls.background,
                    popup = controls.popup;

                self.handlers.hidePopup(popupBackground, popup, controls, function () {

                    var handlers = controls.handlers,
                        handlersCount,
                        tempElement,
                        popupContent = controls.popupContent,
                        i;

                    if (controls.callback) {
                        controls.callback(element);
                    }

                    if (handlers) {
                        handlersCount = handlers.length;

                        for (i = 0; i < handlersCount; i++) {
                            tempElement = popupContent.querySelector(handlers[i].selector);
                            tempElement.removeEventListener(handlers[i].event, handlers[i].handler, false);
                        }

                    }

                    if (controls.hideCallback) {
                        controls.hideCallback(controls.popupContent);
                    }



                });
            },

            /**
             * Click by popup button
             *
             * @method buttonClick
             * @param event
             * @memberOf module:popup.Popup
             */
            buttonClick: function (event) {
                self.handlers.hide(event.target);
            },

            /**
             * Button key down
             *
             * @method buttonKeyDown
             * @memberOf module:popup.Popup
             */
            buttonKeyUp: function (event) {

                if (event.preventDefault) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }

                var keyCode = event.keyCode;



                switch (keyCode) {
                case 32:
                    this.click();
                    break;

                case 13:
                    this.click();
                    break;
                }
            },

            /**
             * @method popupClick
             * @param event
             * @memberOf module:popup.Popup
             */
            popupClick: function (event) {

                var element = this,
                    target = event.target,
                    list = element.querySelectorAll('.popup__button, .popup-close'),
                    count = list.length,
                    i;

                event.stopPropagation();

                for (i = 0; i < count; i++) {
                    if (list[i] === target) {
                        self.handlers.hide.call(self, event);
                    }
                }
            },
            keydown: function (event) {

                if( event.keyCode === 27 ) {
                    $('.popup-close').click();
                }
            },
            backClick: function (event) {

               $('.popup-close').click();

            }
        };

        /**
         * Create popup functions
         *
         */
        this.create = {
            /**
             * Public template of popup
             *
             * @method template
             * @memberOf module:popup.Popup
             */
            template: function () {

                var background = document.createElement('div'),
                    popup = document.createElement('div'),
                    popupContent = document.createElement('div'),
                    controls = self.controls,
                    header = document.createElement('div');

                background.setAttribute('class', 'popup');
                background.setAttribute('id', 'popup');
                popup.innerHTML = '<div class="popup-close close-icon"></div>';

                popup.setAttribute('class', 'popup__window');
                popup.setAttribute('id', 'popup__window');

                popupContent.setAttribute('class', 'popup__content');
                popupContent.appendChild(header);

                popup.appendChild(popupContent);

                background.appendChild(popup);

                controls.popupCloseButton = popup.querySelector('.popup-close');
                controls.popupContent = popupContent;
                controls.popup = popup;
                controls.background = background;
            },

            /**
             * empty popup content
             *
             * @method
             * @memberOf module:popup.Popup
             */
            empty: function (data) {
                var popupData = [];

                popupData.push(data);

                return popupData;
            },

            htmlTemplate: function (data) {

                var popupData = [];

                var temp = data.message.html();

                popupData.push(temp);

                return popupData;
            },

            /**
             * confirm popup content
             *
             * @method confirm
             * @param data
             * @returns {Array}
             * @memberOf module:popup.Popup
             */
            confirm: function (data) {

                var popupData = [],
                    message = data.message;

                if (!message) {
                    message = '';
                }

                popupData.push('<div class="popup__message">' + message + '</div>');
                popupData.push('</div>');

                return popupData;
            }
        };

        /**
         * Destroy popup (remove from DOM)
         *
         * @method destroy
         * @memberOf module:popup.Popup
         */
        this.destroy = function () {

            var controls = self.controls;

            document.body.removeChild(controls.background);
            controls.inDom = false;
        };

        /**
         * Show popup
         *
         * @public
         * @method show
         * @param data
         * @param callback
         * @memberOf module:popup.Popup
         */
        this.show = function (data, callback) {

            if (callback) {
                self.controls.callback = callback;
            } else {
                self.controls.callback = function () { return false; };
            }

            self.handlers.show(data);
        };

        /**
         * Hide popup
         *
         * @method hide
         * @memberOf module:popup.Popup
         */
        this.hide = function () {
            self.handlers.hide(null);
        };

        /**
         * add popup event listener
         *
         * @method addEventList
         * @memberOf module:popup.Popup
         */
        this.addEventList = function () {
            var handlers = self.handlers,
                controls = self.controls;

            controls.popup.addEventListener('click', handlers.popupClick, false);
            document.body.addEventListener('keydown', handlers.keydown, false);
            controls.background.addEventListener('click', handlers.backClick, false);
        };

        /**
         * init popup class
         *
         * @memberOf module:popup.Popup
         * @method init
         */
        this.init = function (data, callback) {
            self.create.template();
        };

        /**
         * Get popup status
         *
         * @memberOf module:popup.Popup
         * @method
         * @returns {boolean}
         */
        this.getVisible = function () {
            return self.controls.isVisible;
        };

        return self.init();
    }

    var popup = new Popup();

    return {
        /**
         * Show popup
         *
         * @memberOf module:popup
         * @method
         * @param {object} data - Popup parameters
         * @param {function} callback - Callback function
         */
        show: function (data, callback) {
            popup.show(data, callback);
        },

        /**
         * Hide popup
         *
         * @memberOf module:popup
         * @method
         * @param {function} callback - Callback function
         */
        hide: function (callback) {
            popup.controls.callback = callback;
            popup.hide();
        },

        /**
         * Get popup status
         *
         * @memberOf module:popup
         * @method
         * @return {boolean}
         */
        isVisible: popup.getVisible,

        /**
         * Get class instance
         *
         * @method
         * @memberOf module:popup
         * @returns {Popup}
         */
        self: function () {
            return popup;
        }
    };
}());