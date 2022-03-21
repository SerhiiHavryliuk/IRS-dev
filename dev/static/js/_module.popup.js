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