/**
 * Created by Serhii on 27.11.2016.
 */
// http://jsfiddle.net/pqQZG/

var targetOffset = $(".irs__system").offset().top;

var $w = $(window).scroll(function(){
    if ( $w.scrollTop() > (targetOffset) ) {

        // var metka = false;
        for (var i = 0; i < 6; i++) {
            $('#irs__system-face-' + (i+1)).delay(700*i).fadeIn(700);
            if(5 == i) {
                metka = true;
            }
        }


        // if(metka) {
            for (var j = 0; j < 6; j++) {
                $('#irs__system-face-' + (j+1)).addClass('animated').addClass('bounceIn');
            }

        // }
    }
});