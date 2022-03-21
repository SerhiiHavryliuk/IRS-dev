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