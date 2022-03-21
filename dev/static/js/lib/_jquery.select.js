// =============================================================================
// custom select plugin
// depends: jquery.js
// example init -  $(".select-custom").customSelect();
// =============================================================================

(function($){

    $.fn.customSelect = function(options) {

        this.each(function(){

            var sel =$(this);
            if(sel.attr('disabled'))
                sel.wrap("<div class='custom-select-wrap custom-select-wrap_disabled'></div>");
            else
                sel.wrap("<div class='custom-select-wrap'></div>");

            sel.before("<div class='custom-select-text'></div>");

            var o = sel.parent(".custom-select-wrap"),
                txt = o.find(".custom-select-text");

            txt.text(sel.find("option:selected").text());

            $(this).change(function() {
                txt.text(sel.find("option:selected").text());
            });

            $(this).focus(function() {
                o.addClass("focus");
            });

            $(this).blur(function() {
                o.removeClass("focus");
            });
        });

        return this;

    };

})($);