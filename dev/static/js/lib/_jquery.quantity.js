// =============================================================================
// quantity plugin
// depends: jquery.js
// parametrs:
//  - min - min possible value  (default = 1)
//  - max - max passible value  (default = none)
//  - step - value of step  (default = 1)

// example init -  $(".quantity").quantityInit();
// example init with parametrs
// $(".quantity").quantityInit({ min: 1, max: 18, step: 1 });
// =============================================================================

(function($){

    $.fn.quantityInit = function(options) {

        $('.button').click(function() {

            // default parametrs
            var min = 1,
                max = 'none',
                step = 1;

            var jQuantityParent = $(this).parent(),
                jQuantityNumeric = jQuantityParent.find('.quantity__numeric').eq(0),
                numeric = parseInt(jQuantityNumeric.text());

            if(options.step) step = parseInt(options.step);
            if(options.min) min = parseInt(options.min);
            if(options.max) max = parseInt(options.max);

            if($(this).hasClass('quantity__add')) { // if type button = add, then it's need to add

                numeric += step;

                if(numeric <= max || max == 'none') {
                    jQuantityNumeric.text(numeric);
                }

            }
            else {

                numeric -= step;

                if(numeric >= min) {
                    jQuantityNumeric.text(numeric);
                }
            }


        });


    };

})($);