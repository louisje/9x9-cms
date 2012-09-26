/*jslint eqeq: true, sloppy: true, vars: true */
/*!
 * jQuery Title Card Player plugin
 *
 * @requires    jQuery Core v1.8 or later
 * @requires    jQuery UI v1.8.23 or later
 * @requires    9x9 SDK (nn-sdk.js)
 * @author      Chih-Wen Yang <chihwen@doubleservice.com>
 * @version     1.3.2
 *
 * - Change Log:
 *      1.3.2:  2012/09/13 - 1. Adjusted duration distribution feature by effect kind (drop).
 *                           2. Adjusted effect hide behavior (immediate disappear no animate).
 *      1.3.1:  2012/09/13 - 1. Improved cancel (stop) feature.
 *                           2. Some minor cleanup.
 *      1.3.0:  2012/09/12 - 1. Added startStandbySec and endingStandbySec feature.
 *                           2. Adjusted duration distribution feature by effect kind (blind, clip).
 *                           3. Added none, bounce, drop, explode, highlight, puff, pulsate, scale, shake, slide effect.
 *                           4. Some minor improvements and cleanup.
 *      1.2.1:  2012/09/12 - 1. Some minor cleanup to pass JSLint coding quality tool check (http://www.jslint.com/).
 *                           2. predefine global variables: jQuery nn.
 *                           3. JSLint Directive Options: jslint eqeq: true, sloppy: true, vars: true.
 *      1.2.0:  2012/09/12 - 1. Adjusted effect feature only act on font, not on background color and image.
 *                           2. Added text on textarea manual line feed feature.
 *                           3. Added optional width option (easter egg option).
 *                           4. Some minor improvements and cleanup.
 *      1.1.0:  2012/09/11 - 1. Added font radix feature, fontSize value between 6 and 48,
 *                              and default is 20. (player screen keep 16:9 ratio.)
 *                           2. Added effect feature, default is fade. (fade, blind, clip, fold.)
 *                           3. Added duration feature, duration value between 5 and 20,
 *                              and default is 7. (start 1.5 sec. + delay + ending 1.5 sec.)
 *                           4. Added played callback feature.
 *                           5. Added cancel callback feature.
 *                           6. Added param verify and normalize feature.
 *                           7. Added background image feature.
 *      1.0.0:  2012/09/10 - Initial release.
 *
 * -------------------------------------------
 * Example:
 * -------------------------------------------
 *
 * <script src="jquery.titlecard.js"></script>
 * <div id="canvas"></div>
 * <script>
 * $('#canvas').titlecard({
 *     text: 'My video',
 *     align: 'center',
 *     effect: 'clip',
 *     duration: 10,
 *     fontSize: 20,
 *     fontColor: 'white',
 *     fontStyle: 'italic',
 *     fontWeight: 'bold',
 *     backgroundColor: 'black',
 *     backgroundImage: 'http://ecample.com/sample.jpg'
 * }, function() {
 *     // call back after title card played
 * });
 * // cancel playing title card and release resources
 * $('#canvas').titlecard('cancel', function() {});
 * </script>
 *
 * -------------------------------------------
 * Lists of possible parameter combinations:
 * -------------------------------------------
 *
 * play with default values
 * $('#canvas').titlecard();
 *
 * play with parameters
 * $('#canvas').titlecard(parameters);
 *
 * play with parameters and calls callback function
 * $('#canvas').titlecard(parameters, callback);
 *
 * play with default values and calls callback function
 * $('#canvas').titlecard(callback);
 * $('#canvas').titlecard(null, callback);  // easter egg method overloading
 *
 * cancel playing title card and release resources
 * $('#canvas').titlecard('cancel');
 *
 * cancel playing title card, release resources, and calls callback function
 * $('#canvas').titlecard('cancel', callback);
 */

(function ($) {
    nn.initialize();

    $.fn.titlecard = function (options, callback) {
        nn.log(options, 'debug');
        nn.log(callback, 'debug');

        // param overloading check
        var playedCallback = null,
            cancelCallback = null;
        if ('undefined' === typeof options) {
            nn.log('play with default values');
            playedCallback = null;
        } else {
            var isPassParamCheck = false;
            if ('string' === typeof options) {
                if ('cancel' === options) {
                    isPassParamCheck = true;
                    if ('function' === typeof callback) {
                        nn.log('setup cancel callback');
                        cancelCallback = callback;
                    }
                    nn.log('cancel playing title card, release resources');
                    $(this)
                        .clearQueue()
                        .stop()
                        .children()
                            .clearQueue()
                            .stop()
                            .children()
                                .clearQueue()
                                .stop()
                            .end()
                            .hide('fast', cancelCallback);
                } else {
                    nn.log('param error nothing to do', 'error');
                }
                return;
            }
            if ('function' === typeof options || 'function' === typeof callback) {
                nn.log('setup played callback');
                if ('function' === typeof options) {
                    isPassParamCheck = true;
                    playedCallback = options;
                    options = {};
                } else {
                    playedCallback = callback;
                }
            }
            if ('object' === typeof options) {
                // include null object
                isPassParamCheck = true;
                nn.log('setup options');
            }
            if (!isPassParamCheck) {
                nn.log('param error nothing to do', 'error');
                return;
            }
        }

        // setup options
        var opts = $.extend({}, $.fn.titlecard.defaults, options || {});
        nn.log(opts, 'debug');
        nn.log(playedCallback, 'debug');

        return this.each(function () {
            var $this = $(this),
                width = (opts.width) ? parseInt(opts.width, 10) : $this.width(),    // easter egg option
                height = Math.round((width / 16) * 9),
                text = opts.text.replace(/\n/g, '<br />'),
                align = opts.align,
                fontRadix = parseInt(opts.fontSize, 10),
                fontSize = 0,
                fontStyle = opts.fontStyle,
                fontWeight = opts.fontWeight,
                wrapperId = (this.id) ? (this.id + '-') : '',
                wrapperOuter = wrapperId + 'wrapper-outer',
                wrapperInner = wrapperId + 'wrapper-inner',
                wrapperHtml = '';

            // basic options normalize
            if (fontRadix < $.fn.titlecard.allows.fontSize.min
                    || fontRadix > $.fn.titlecard.allows.fontSize.max) {
                fontRadix = $.fn.titlecard.defaults.fontSize;
            }
            fontSize = Math.round(width / fontRadix);
            if (-1 === $.inArray(align, $.fn.titlecard.allows.align)) {
                align = $.fn.titlecard.defaults.align;
            }
            if (-1 === $.inArray(fontStyle, $.fn.titlecard.allows.fontStyle)) {
                fontStyle = $.fn.titlecard.defaults.fontStyle;
            }
            if (-1 === $.inArray(fontWeight, $.fn.titlecard.allows.fontWeight)) {
                fontWeight = $.fn.titlecard.defaults.fontWeight;
            }

            // basic html structure and css style
            wrapperHtml = '<div class="' + wrapperOuter + '">';
            if ('' != opts.backgroundImage) {
                wrapperHtml += '<img src="' + opts.backgroundImage + '" style="width: 100%; height: 100%; border: none;" />';
            }
            wrapperHtml += '<div class="' + wrapperInner + '"></div></div>';
            $this.show().wrapInner(wrapperHtml).children('.' + wrapperOuter).hide().css({
                display: 'block',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 50,
                width: width + 'px',
                height: height + 'px',
                backgroundColor: opts.backgroundColor
            }).children('.' + wrapperInner).hide().html(text).css({
                display: 'block',
                position: 'absolute',
                width: '98%',
                height: 'auto',
                textAlign: align,
                fontSize: fontSize + 'pt',
                color: opts.fontColor,
                fontStyle: fontStyle,
                fontWeight: fontWeight
            });

            // vertical align
            var wrapWidth = $this.children('.' + wrapperOuter).width(),
                wrapHeight = $this.children('.' + wrapperOuter).height(),
                selfWidth = $this.children().children('.' + wrapperInner).width(),
                selfHeight = $this.children().children('.' + wrapperInner).height(),
                selfLeft = 0,
                selfTop = 0;
            if (wrapWidth > selfWidth) {
                selfLeft = (wrapWidth - selfWidth) / 2;
            }
            if (wrapHeight > selfHeight) {
                selfTop = (wrapHeight - selfHeight) / 2;
            }
            $this.children().children('.' + wrapperInner).css({
                top: selfTop + 'px',
                left: selfLeft + 'px'
            });

            // effect (play callback) and duration (start, delay, ending)
            var effect = opts.effect,
                duration = parseInt(opts.duration, 10),
                startStandbySec = 500,
                endingStandbySec = 500,
                startSec = 1500,
                endingSec = 1500,
                delaySec = 3000;
            if (-1 === $.inArray(effect, $.fn.titlecard.allows.effect)) {
                effect = $.fn.titlecard.defaults.effect;
            }
            if (duration < $.fn.titlecard.allows.duration.min
                    || duration > $.fn.titlecard.allows.duration.max) {
                duration = $.fn.titlecard.defaults.duration;
            }
            duration *= 1000;
            if (-1 !== $.inArray(effect, ['blind', 'clip', 'drop'])) {
                startSec = endingSec = 1000;
            }
            if ('none' === effect) {
                startStandbySec = endingStandbySec = startSec = endingSec = 0;
            }
            delaySec = (duration - startStandbySec - startSec - endingSec - endingStandbySec);

            switch (effect) {
            case 'blind':
            case 'clip':
            case 'fold':
            case 'drop':
            case 'bounce':
            case 'explode':
            case 'highlight':
            case 'puff':
            case 'pulsate':
            case 'scale':
            case 'shake':
            case 'slide':
                $this.children().show(startStandbySec).children('.' + wrapperInner).hide().show(effect, {}, startSec).delay(delaySec).hide(effect, {}, endingSec, function () {
                    $this.children().delay(endingStandbySec).hide(0, playedCallback);
                });
                break;
            case 'fade':
                $this.children().show(startStandbySec).children('.' + wrapperInner).hide().fadeIn(startSec).delay(delaySec).fadeOut(endingSec, function () {
                    $this.children().delay(endingStandbySec).hide(0, playedCallback);
                });
                break;
            default:
                // none
                $this.children().children().show(0).delay(duration).hide(0, function () {
                    $this.children().hide(0, playedCallback);
                });
                break;
            }

            var debug = [];
            debug.push('wrapWidth: ' + wrapWidth);
            debug.push('wrapHeight: ' + wrapHeight);
            debug.push('selfWidth: ' + selfWidth);
            debug.push('selfHeight: ' + selfHeight);
            debug.push('selfTop: ' + selfTop);
            debug.push('selfLeft: ' + selfLeft);
            debug.push('startSec: ' + startSec);
            debug.push('delaySec: ' + delaySec);
            debug.push('endingSec: ' + endingSec);
            nn.log(debug, 'debug');
        });
    };

    // default options
    $.fn.titlecard.defaults = {
        text: 'My video',
        align: 'center',
        effect: 'none',
        duration: 7,
        fontSize: 20,
        fontColor: 'white',
        fontStyle: 'normal',
        fontWeight: 'normal',
        backgroundColor: 'black',
        backgroundImage: ''
    };

    // allow options
    $.fn.titlecard.allows = {
        align: ['left', 'center', 'right'],
        effect: ['none', 'fade', 'blind', 'clip', 'fold', 'drop', 'bounce', 'explode', 'highlight', 'puff', 'pulsate', 'scale', 'shake', 'slide'],
        duration: { min: 5, max: 20 },
        fontSize: { min: 6, max: 48 },
        fontStyle: ['normal', 'italic'],
        fontWeight: ['normal', 'bold', 'bolder']
    };
}(jQuery));