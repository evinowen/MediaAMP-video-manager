/* thePlatform Video Manager Wordpress Plugin
 Copyright (C) 2013-2014  thePlatform for Media Inc.
 
 This program is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License along
 with this program; if not, write to the Free Software Foundation, Inc.,
 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA. */
 
(function($) {

    function configure_metadata_fields() {
        var $optionsPageName = $('input[name=option_page]');
        var $table = $optionsPageName.siblings('table');
        $table.css('display', 'none');
        $table.after('<div id="drag-columns"></div>');
        var $dragColumnsContainer = $('#drag-columns');
        var $sortableFields = $table.find('.sortableField');
        var cols = {
            'write': [],
            'read': [],
            'hide': []
        };
        $sortableFields.each(function() {
            var name = $(this).parent().siblings('th').html();
            var value = $(this).val();
            if (!value.length)
                value = 'hide';
            cols[value].push({
                id: $(this).attr('id'),
                name: name,
                userfield: $(this).data('userfield')
            });
        });

        for (var colName in cols) {
            $dragColumnsContainer.append(
                '<div class="colContainer">' +
                '<h3>' + capitalize(colName) + '</h3>' +
                '<ul data-col="' + colName + '" class="sortable"></ul>' +
                '</div>'
            );
            var $col = $('ul[data-col=' + colName + ']');
            for (var i in cols[colName]) {
                var field = cols[colName][i];
                $col.append('<li data-id="' + field.id + '" data-userfield="' + field.userfield + '">' + field.name + '</li>');
            }
        }
        $dragColumnsContainer.append('<div class="clear"></div>');

        $(".sortable").sortable({
            items: "li:not([data-id=title])",
            connectWith: ".sortable",
            receive: function(e, ui) {
                var receiver = $(e.target).data('col');
                var itemId = $(ui.item).data('id');

                if (receiver == "write" && $(ui.item).data('userfield') == true) {
                    $(ui.sender).sortable('cancel');
                } else {
                    var $selectField = $('select[name="' + $optionsPageName.val() + '[' + itemId + ']"]');
                    $selectField.find('option:selected').attr('selected', false);
                    $selectField.find('option[value="' + receiver + '"]').attr('selected', true);
                }
            }
        }).disableSelection();
    }

    function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1);
    }

    function authenticate() {
        var usr = $("#mpx_username").val();
        var pwd = $("#mpx_password").val();        

        var hash = base64Encode(usr + ":" + pwd);

        var data = {
            action: 'verify_account',
            _wpnonce: tp_edit_upload_local.tp_nonce['verify_account'],
            auth_hash: hash
        };

        $.post(tp_edit_upload_local.ajaxurl, data, function(response) {
            if ($("#verification_image").length > 0) {
                $("#verification_image").remove();
            }

            if (response.success) {
                $('#verify-account-dashicon').removeClass('dashicons-no').addClass('dashicons-yes');
            } else {
                $('#verify-account-dashicon').removeClass('dashicons-yes').addClass('dashicons-no');
            }
        });
    }

    function base64Encode(data) {
        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
            ac = 0,
            enc = "",
            tmp_arr = [];

        if (!data) {
            return data;
        }

        do {
            o1 = data.charCodeAt(i++);
            o2 = data.charCodeAt(i++);
            o3 = data.charCodeAt(i++);

            bits = o1 << 16 | o2 << 8 | o3;

            h1 = bits >> 18 & 0x3f;
            h2 = bits >> 12 & 0x3f;
            h3 = bits >> 6 & 0x3f;
            h4 = bits & 0x3f;

            tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
        } while (i < data.length);

        enc = tmp_arr.join('');

        var r = data.length % 3;

        return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
    }

    function configure_pid_fields() {
        $('#mpx_account_pid').parent().parent().hide();
        $('#default_player_pid').parent().parent().hide();

        if ($('#mpx_account_id option:selected').length != 0) {

            $('#mpx_account_pid').val($('#mpx_account_id option:selected').val().split('|')[1]);
        } else
            $('#mpx_account_id').parent().parent().hide();

        if ($('#default_player_name option:selected').length != 0) {
            $('#default_player_pid').val($('#default_player_name option:selected').val().split('|')[1]);
        } else
            $('#default_player_name').parent().parent().hide();

        if ($('#mpx_server_id option:selected').length == 0) {
            $('#mpx_server_id').parent().parent().hide();
        }

        //Set up the PID for the MPX account on change in the Settings page 
        $('#mpx_account_id').change(function(e) {
            $('#mpx_account_pid').val($('#mpx_account_id option:selected').val().split('|')[1]);
        })

        //Set up the PID for the Player on change in the Settings page
        $('#default_player_name').change(function(e) {
            $('#default_player_pid').val($('#default_player_name option:selected').val().split('|')[1]);
        })
    }

    $(document).ready(function() {
        var TP_PAGE_KEY = $('#TP_PAGE_KEY').text();
        var current_page_key = $('input[name=option_page]').val();

        if (TP_PAGE_KEY == 'TP_FIELDS') {
            configure_metadata_fields();
        }

        if (TP_PAGE_KEY == 'TP_PREFERENCES') {
            configure_pid_fields()

            // Validate account information in plugin settings fields by logging in to MPX
            $("#verify-account-button").click(authenticate);
        }
    });
})(jQuery)