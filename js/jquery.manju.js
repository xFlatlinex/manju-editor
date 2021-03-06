/*
Manju editor is licensed under the MIT license:

Copyright (c) 2012 Luciano Longo

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function($)
{
    $.manju = {
        defaults: {
            toolbars: {
                font: [
                    { title: 'Font', class:'manju-font dropdown-button', html:'Choose a font', cmd: {
                        command: 'fontname',
                        callback: function( btn )
                        {
                            var api = this,
                                pos = btn.offset(),
                                dropdown = this.ui.wrap.find('#font-dropdown');

                            if( ! dropdown.length )
                            {
                                dropdown = $('<ul id="font-dropdown" class="dropdown-list">').appendTo( this.ui.wrap );

                                var lis = '';

                                for( var i in $.manju.fonts )
                                {
                                    var f = $.manju.fonts[i];

                                    lis += '<li data-value="'+f+'"><span style="font-family: '+f+'">'+f+'<i class="icon-ok check"></i></span></li>';
                                }
                                dropdown.html( lis ).find('li').click(function()
                                {
                                    // Apply font to selection
                                    api.cmd( 'fontname', $(this).data('value') );

                                    // Hide the dropdown
                                    dropdown.fadeOut('fast');
                                });

                                this.ui.wrap.bind('click.font-dropdown', function(e)
                                {
                                    if( ! $(e.target).parent().hasClass('manju-font') )
                                    {
                                        dropdown.fadeOut('fast');
                                    }
                                });

                                // Run a check for all the commands to mark the
                                // correct item as selected
                                this.checkCommands();
                            }

                            dropdown.css({
                                top: 10 + btn.outerHeight(),
                                left: pos.left - this.ui.wrap.offset().left - 1
                            });

                            if( dropdown.is(':visible') )
                                dropdown.fadeOut('fast');
                            else
                                dropdown.fadeIn('fast');
                        }
                    } },
                    { title:'Font color', html:'Color', class:'manju-color picker-button', cmd: {
                        command: 'forecolor',
                        callback: function( btn )
                        {
                            var api = this,
                                pos = btn.offset(),
                                picker = this.ui.wrap.find('#forecolor-picker');

                            if( ! picker.length )
                            {
                                picker = $('<div id="forecolor-picker" class="picker">').appendTo( this.ui.wrap );

                                // Create a table
                                var t = '<table class="items">';

                                for( var group in $.manju.colors )
                                {
                                    var line = $.manju.colors[group];

                                    t += '<tr class="'+group+'">';
                                    for( var i in line )
                                    {
                                        var rgb = line[i];
                                        t += '<td><div class="item" data-value="rgb('+rgb+')" style="background: rgb('+rgb+');" title="RGB ('+rgb+')"><i class="icon-ok"></i></div></td>';
                                    }
                                    t += '</tr>';
                                }

                                picker.html( t ).find('.item').click(function(e)
                                {
                                    // Apply forecolor to selection
                                    api.cmd( 'forecolor', $(this).data('value') );

                                    // Hide the picker
                                    picker.fadeOut('fast');
                                });

                                this.ui.wrap.click(function(e)
                                {
                                    if( ! $(e.target).parent().hasClass('manju-color') )
                                    {
                                        picker.fadeOut('fast');
                                    }
                                });

                                // Run a check for all the commands to mark the
                                // correct item as selected
                                this.checkCommands();
                            } // End picker creation

                            picker.css({
                                top: 10 + btn.outerHeight(),
                                left: pos.left - this.ui.wrap.offset().left - 1
                            });

                            if( picker.is(':visible') )
                                picker.fadeOut('fast');
                            else
                                picker.fadeIn('fast');
                        }
                    } }
                ],
                style: [
                    { title:'Bold', html:'<i class="icon-bold"></i>', class:'manju-bold', cmd: 'bold' },
                    { title:'Italic', html:'<i class="icon-italic"></i>', class:'manju-italic', cmd: 'italic' },
                    { title:'Underline', html:'<i class="icon-underline"></i>', class:'manju-underline', cmd: 'underline' },
                    { title:'Strikethrough', html:'<i class="icon-strikethrough"></i>', class:'', cmd: 'strikethrough' }
                ],
                alignment: [
                    { title:'left', html:'<i class="icon-align-left"></i>', class:'manju-bold', cmd: 'justifyleft' },
                    { title:'center', html:'<i class="icon-align-center"></i>', class:'manju-bold', cmd: 'justifycenter' },
                    { title:'right', html:'<i class="icon-align-right"></i>', class:'manju-bold', cmd: 'justifyright' },
                    { title:'justify', html:'<i class="icon-align-justify"></i>', class:'manju-bold', cmd: 'justifyfull' },
                ],
                linking: [
                    { title:'Hyperlink', html:'<i class="icon-link"></i>', class:'manju-link', cmd: {
                        command: 'createlink',
                        callback: function() {
                            var url = prompt('Enter URL (leave blank to unlink)', '');

                            if( url == '' )
                                this.cmd('unlink');
                            else
                            {
                                if( url.match('^\/\/') )
                                    url = 'http:'+url;

                                this.cmd('createlink', url);
                            }
                        }
                    } },
                    { title: 'Insert image', html:'<i class="icon-picture"></i>', class:'manju-image', cmd: function()
                        {
                            var url = prompt('Enter image URL', '');

                            if( url.match('^\/\/') )
                                url = 'http:'+url;

                            this.cmd('insertimage', url);
                        }
                    }
                ],
                lists: [
                    { title:'Unordered list', html:'<i class="icon-list-ul"></i>', class:'manju-list', cmd: 'insertUnorderedList' },
                    { title:'Ordered list', html:'<i class="icon-list-ol"></i>', class:'manju-list', cmd: 'insertOrderedList' }
                ],
                indentation: [
                    { title:'Quote', html:'<i class="icon-quote-left"></i>', class:'manju-list', cmd: 'formatblock', value: 'blockquote' },
                    { title:'Outdent / Un-quote', html:'<i class="icon-indent-left"></i>', class:'manju-list', cmd: 'outdent' },
                    { title:'Indent', html:'<i class="icon-indent-right"></i>', class:'manju-list', cmd: 'indent' }
                ],
                clipboard: [
                    { title:'Cut', html:'<i class="icon-cut"></i>', class:'manju-cut', cmd: 'cut' },
                    { title:'Copy', html:'<i class="icon-copy"></i>', class:'manju-copy', cmd: 'copy' },
                    { title:'Paste', html:'<i class="icon-paste"></i>', class:'manju-paste', cmd: 'paste' }
                ],
                history: [
                    { title:'Undo', html:'<i class="icon-undo"></i>', class:'manju-undo', cmd: 'undo' },
                    { title:'redo', html:'<i class="icon-repeat"></i>', class:'manju-redo', cmd: 'redo' }
                ],
                misc: [
                    { title:'Source', html:'<i class="icon-code"></i>', class:'manju-viewsource', cmd: function() { this.sourceToggle(); } }
                ]
            }
        },
        colors: {
            grays: [
                '0, 0, 0', '68, 68, 68', '102, 102, 102', '153, 153, 153',
                '204, 204, 204', '238, 238, 238', '243, 243, 243', '255, 255, 255'
            ],
            misc: [
                '255, 0, 0', '255, 153, 0', '255, 255, 0', '0, 255, 0',
                '0, 255, 255', '0, 0, 255', '153, 0, 255', '255, 0, 255',
            ],
            sw1: [
                '244, 204, 204', '252, 229, 205', '255, 242, 204', '217, 234, 211',
                '208, 224, 227', '207, 226, 243', '217, 210, 233', '234, 209, 220'
            ],
            sw2: [
                '234, 153, 153', '249, 203, 156', '255, 229, 153', '182, 215, 168',
                '162, 196, 201', '159, 197, 232', '180, 167, 214', '213, 166, 189'
            ],
            sw3: [
                '224, 102, 102', '246, 178, 107', '255, 217, 102', '147, 196, 125',
                '118, 165, 175', '111, 168, 220', '142, 124, 195', '194, 123, 160'
            ],
            sw4: [
                '204, 0, 0', '230, 145, 56', '241, 194, 50', '106, 168, 79',
                '69, 129, 142', '61, 133, 198', '103, 78, 167', '166, 77, 121'
            ],
            sw5: [
                '153, 0, 0', '180, 95, 6', '191, 144, 0', '56, 118, 29',
                '19, 79, 92', '11, 83, 148', '53, 28, 117', '116, 27, 71'
            ],
            sw6: [
                '102, 0, 0', '120, 63, 4', '127, 96, 0', '39, 78, 19',
                '12, 52, 61', '7, 55, 99', '32, 18, 77', '76, 17, 48'
            ]
        },
        fonts: [
            'Sans-serif',
            'Serif',
            'Arial',
            'Helvetica',
            'Courier New',
            'Garamond',
            'Georgia',
            'Tahoma',
            'Trebuchet MS',
            'Verdana'
        ]
    }

    var Manju = function( elem, options )
    {
        if( $(elem).data('{{manju}}') ) return; // Already converted

        var _this = this,
            o = $.extend( {}, $.manju.defaults, options || {});

        var $wrap = $('<div class="manju-wrap">').insertBefore( elem ),
            $tbwrap = $('<div class="manju-toolbar-wrap">'),
            $ta, $e
            $fs = $('<div class="manju-fullscreen"></div>').click(function() { _fullscreen(); });

        if( elem.tagName == 'TEXTAREA' )
        {
            $ta = $(elem).appendTo($wrap);
            $e  = $('<div>').insertBefore($ta).html( $ta.val() );
        }
        else
        {
            $e  = $(elem).appendTo($wrap);
            $ta = $('<textarea>').insertAfter( $e ).val( $.trim( $e.html() ) );
        }
        $e.addClass('editable-area').attr('contenteditable', true);
        $ta.addClass('manju-source');

        _cmd('styleWithCss');

        // Render toolbars

        $tbwrap.insertBefore( $e );
        
        $.each( o.toolbars, function( name, buttons )
        {
            if (typeof o.activeToolbars != 'undefined' && $.inArray(name, o.activeToolbars) == -1) {
                return;
            }

            // Add a toolbar div
            var $tbar = $('<div class="manju-toolbar manju-toolbar-'+name+'">'), content;
            for( var i in buttons )
            {
                var b = buttons[i];

                $b = $('<div class="manju-toolbar-button '+b.class+'" title="'+b.title+'">')
                    .appendTo( $tbar );

                if( typeof b.cmd !== 'function' )
                    $b.data('manju-command', typeof b.cmd.command == 'string' ? b.cmd.command : b.cmd );

                if( typeof b.values == 'object' )
                {
                    var sel = '<select class="'+b.class+'"><option selected>'+b.title+'</option>';

                    for( var i in b.values )
                    {
                        var val = b.values[i];
                            arg = i;

                        if( ! isNaN( parseInt(arg) ) )
                            arg = val;

                        sel += '<option value="'+arg+'">'+val+'</option>';
                    }
                    sel += '</select>';

                    $(sel).appendTo($b).change(function()
                    {
                        if( $(this).val() )
                            _cmd( $(this).parent().data('manju-command'), $(this).val() );
                    });
                }
                else
                {
                    $b.html('<button type="button" class="'+b.class+'">'+ ( b.html || '&nbsp;' ) +'</button>');

                    $b.click( (function( cmd, value )
                    {
                        return function(e)
                        {
                            if( typeof cmd == 'function' )
                            {
                                cmd.apply( _this, [$(this)] );
                                return;
                            }
                            else if( typeof cmd.callback == 'function' )
                            {
                                cmd.callback.apply( _this, [$(this)] );
                                return;
                            }

                            if( ! $.isArray( cmd ) ) {
                                console.log(value);
                                cmd = [cmd, value];
                            }

                            _cmd.apply( _this, cmd );
                        }
                    })( b.cmd, b.value || null ) );
                }
            }
            $tbwrap.append( $tbar );
        });

        // Append fullscreen button
        $fs.appendTo($wrap);

        // Public vars
        this.config = o;
        this.ui = {
            wrap: $wrap,
            toolbar: $tbwrap,
            textarea: $ta,
            editarea: $e,
            fs: $fs
        };

        // Keep areas sync'ed when sending the form
        var $form = $e.parents('form');
        if( $form.length )
        {
            $form.submit(function(e) { _syncTextarea(); });
        }

        // Query command states/values
        $e.keydown( _checkCommands ).click( _checkCommands );

        function _checkCommands()
        {
            $tbwrap.find('.manju-toolbar-button').each(function()
            {
                var cmd = $(this).data('manju-command');

                if( typeof cmd !== 'undefined' )
                {
                    $(this).removeClass('active');

                    var select = $(this).children('select');

                    if( select.length )
                    {
                        var cmdval = document.queryCommandValue( cmd ),
                            opt    = $(select[0]).find('[value="'+cmdval+'"]');

                        select[0].selectedIndex = 0;

                        if( opt.length )
                            select[0].selectedIndex = opt.index();
                    }
                    else if( $.isArray( cmd ) || select.length )
                    {
                        var cmdval = document.queryCommandValue( cmd[0] ).replace(/[\s]+/ig, ''),
                            val    = cmd[1].replace(/[\s]+/ig, '');

                        if( cmdval == val )
                            $(this).addClass('active');
                    }
                    else if( $(this).hasClass('picker-button') || $(this).hasClass('dropdown-button') )
                    {
                        var val = document.queryCommandValue( cmd );

                        if( $(this).hasClass('picker-button') )
                        {
                            var picker = $('.picker');

                            picker.find('.item').removeClass('active');

                            if( picker.length )
                                picker.find('.item[data-value="'+val+'"]').addClass('active');
                        }
                        else if( $(this).hasClass('dropdown-button') )
                        {
                            var dropdown = $('.dropdown-list');

                            dropdown.find('li:not(.separator)').removeClass('active');

                            if( dropdown.length )
                                dropdown.find('li[data-value="'+val+'"]').addClass('active');
                        }
                    }
                    else
                    {
                        if( document.queryCommandState(cmd) )
                            $(this).addClass('active');
                    }
                }
            });
        }
        this.checkCommands = _checkCommands;

        function _fullscreen() {
            var wrap = $wrap.get(0);

            if (!isFullscreen()) {
                if (wrap.requestFullScreen) {
                    wrap.requestFullScreen();
                } else if (wrap.mozRequestFullScreen) {
                    wrap.mozRequestFullScreen();
                } else if (wrap.webkitRequestFullScreen) {
                    wrap.webkitRequestFullScreen();
                }
            } else {
                if (document.cancelFullScreen) {
                    document.cancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }
            }
        }

        function isFullscreen () {
            var fs = document.fullScreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            console.log(fs, document.webkitFullScreenElement);
            return $wrap.get(0) == fs;
        }


        /* API */

        function _cmd( cmd, value )
        {
            $e.focus();
            document.execCommand( cmd, null, value );
            _checkCommands();
            $e.focus();
        }
        this.cmd = _cmd;

        /**
         * Syncs textarea contents with editable area's if in design mode
         */
        function _syncTextarea()
        {
            if (_getCurrentMode() == 'design') {
                $ta.val( $.trim( $e.html() ) );
            }
        }
        this.syncTextarea = _syncTextarea;

        /**
         * Syncs editable area with textarea
         */
        function _syncEditableArea()
        {
            $e.html( $ta.val() );
        }
        this.syncEditableArea = _syncEditableArea;

        function _sourceToggle()
        {
            switch( _getCurrentMode() )
            {
                case 'design':
                    _syncTextarea();
                    _disableButtons();
                    $ta.show().height( $e.height() ).focus();
                    $e.hide();
                    $tbwrap.addClass('disabled');
                break;

                case 'source':
                    _syncEditableArea();
                    _enableButtons();
                    $ta.hide();
                    $e.show().focus();
                    $tbwrap.removeClass('disabled');
                break;
            }
        }
        this.sourceToggle = _sourceToggle;

        function _getCurrentMode()
        {
            return $ta.is(':visible') ? 'source' : 'design';
        }
        this.getCurrentMode = _getCurrentMode;

        function _enableButtons()
        {
            $tbwrap.find(':input').attr('disabled', false);
        }

        function _disableButtons()
        {
            $tbwrap.find(':input:not(.manju-viewsource)').attr('disabled', true);
        }
    }

    $.fn.manju = function( options )
    {
        var api = $(this).data('{{manju}}');

        if( api && api instanceof Manju )
            return api;

        return $(this).each(function()
        {
            $(this).data('{{manju}}', new Manju(this, options) );
        });
    };
})(jQuery);