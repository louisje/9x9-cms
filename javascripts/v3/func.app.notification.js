/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, sub: true, vars: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;
        $page.isNotifyAvailable = false;

    $page.chkNotifyForm = function () {
        // to do
        if(!$page.isNotifyAvailable){
            location.href = "app-notification.html";
            return false;
        }
        $("#channel-sub-name").text(" > " + nn._([cms.global.PAGE_ID, 'title-func', 'Create a app notification']));

        $('#content-main-wrap .constrain').html('');
        $('#notify-form-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
        $('#overlay-s').fadeOut("slow");
    };

    $page.NotifySave = function() {
        var inMessage = $("#NotifyMessage").val().trim(),
            tmpContent = $common.playerUrlParser($("#NotifyContent").val().trim()),
            inContent = "",
            inDate = "NOW",
            errMsg = "",
            chkScheduled = $('input[name=scheduleun-app]:checked').val(),
            nid = $("#notifyId").val();

        $(".notifyMsg").text("");
        if (inMessage === "") {
            errMsg = 'Please fill in all required fields.';
        }

        if ('checked' === $("#run-app2").attr("checked")) {
            if (true === tmpContent.isAllow && undefined !== tmpContent.chId) {
                inContent = cms.global.MSOINFO.name + ":" + tmpContent.chId;
                if (undefined !== tmpContent.epId) {
                    inContent += ":" + tmpContent.epId;
                }
            } else {
                if ($("#NotifyContent").val().trim() === '') {
                    errMsg = 'Please fill in all required fields.';
                } else {
                    errMsg = 'Invalid URL, please try again.';
                }

            }
        }
        if ("Scheduled" == chkScheduled) {
            // to do list
            inDate = "1403258106641";
        }

        if ("" === errMsg) {
            if (nid > 0) {
                nn.api('PUT', cms.reapi('/api/push_notifications/{push_notificationId}', {
                    push_notificationId: nid
                }), {
                    message: inMessage,
                    content: inContent,
                    scheduleDate: inDate
                }, function( ret) {
                    $page.initNotify();
                    $('body').removeClass('has-change');
                    location.replace("app-notification.html#EOK");
                });
            } else {
                nn.api('POST', cms.reapi('/api/mso/{msoId}/push_notifications', {
                    msoId: cms.global.MSO
                }), {
                    msoId: cms.global.MSO,
                    message: inMessage,
                    content: inContent,
                    scheduleDate: inDate
                }, function (ret) {
                    $page.initNotify();
                    $('body').removeClass('has-change');
                    location.replace("app-notification.html#OK");
                });
            }
        } else {
            // 輸入錯誤
            $(".notifyMsg").text(nn._([cms.global.PAGE_ID, 'notification', errMsg]));
        }
    };

    $page.editNotify = function(nid) {
        if (nid > 0) {
            nn.api('GET', cms.reapi('/api/push_notifications/{push_notificationId}', {
                push_notificationId: nid
            }), null, function (notify) {

                $("#channel-sub-name").text(" > " + nn._([cms.global.PAGE_ID, 'title-func', 'Edit app notification']));

                $('#content-main-wrap .constrain').html('');
                $('#notify-form-tmpl').tmpl().appendTo('#content-main-wrap .constrain');

                $("#NotifyMessage").val(notify.message);
                $("#notifyId").val(notify.id);

                // to do
                // set scheduled date time

                $('#overlay-s').fadeOut("slow");
                nn.log(notify);
            });


        } else {
            location.href = "app-notification.html"
        }

    };

    $page.newNotify = function () {
        if(!$page.isNotifyAvailable){
            location.href = "app-notification.html";
            return false;
        }
        $("#channel-sub-name").text(" > " + nn._([cms.global.PAGE_ID, 'title-func', 'Create a app notification']));

        $('#content-main-wrap .constrain').html('');
        // $('#notify-comm-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
        $('#notify-form-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
        $('#overlay-s').fadeOut("slow");
    };

    $page.getNotifyAvailable = function () {
        var isNotifyiOS = cms.global.MSOINFO.apnsEnabled || false,
            isNotifyAndroid = cms.global.MSOINFO.gcmEnabled || false,
            retVal = "You don't have been authorized to send notifications to the iOS app Android app users.";

        if (isNotifyiOS === true && isNotifyAndroid === true) {
            retVal = "You have been authorized to send notifications to the iOS app and Android app users.";
        } else if (isNotifyiOS === true) {
            retVal = "You have been authorized to send notifications to the iOS app users.";
        } else if (isNotifyAndroid === true) {
            retVal = "You have been authorized to send notifications to the Android app users.";
        }
        return nn._([cms.global.PAGE_ID, 'notification', retVal]);
    }

    $page.getNotifySchedule = function () {
        var strDisableFix = "";
        if (!$page.isNotifyAvailable) {
            strDisableFix = 'disable';
        }

        $('#content-main-wrap .constrain').html('');
        $('#notify-comm-tmpl').tmpl([{extMsg: $page.getNotifyAvailable(), disableFix: strDisableFix}]).appendTo('#content-main-wrap .constrain');

        nn.api('GET', cms.reapi('/api/mso/{msoId}/push_notifications', {
            msoId: cms.global.MSO
        }), {
            type: "schedule"
        }, function(HistoryLists) {
            var cntList = HistoryLists.length;

            $("#channel-sub-name").text(" > "+nn._([cms.global.PAGE_ID, 'title-func', 'Schedule']));
            $('#notify-list-wrap-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
            if (cntList < 1) {
                $('#notify-empty-msg-tmpl').tmpl([{extMsg: 'You have no scheduled notification'}]).appendTo('.list-outline');
                // $page.getEmptyUI(true);
            } else {
                $('#notify-list-item-schedule-tmpl').tmpl(HistoryLists).appendTo('#list-history');
            }
            $("#notifySchedule").parent().addClass('on');
            $(".notify-list-wrap").show();
            $('#overlay-s').fadeOut("slow");
        });
    };


    $page.getNotifyHistory = function () {
        var strDisableFix = "";
        if (!$page.isNotifyAvailable) {
            strDisableFix = 'disable';
        }

        $('#content-main-wrap .constrain').html('');
        $('#notify-comm-tmpl').tmpl([{extMsg: $page.getNotifyAvailable(), disableFix: strDisableFix}]).appendTo('#content-main-wrap .constrain');

        nn.api('GET', cms.reapi('/api/mso/{msoId}/push_notifications', {
            msoId: cms.global.MSO
        }), {
            type: "history"
        }, function(HistoryLists) {
            var cntList = HistoryLists.length;

            $("#channel-sub-name").text(" > "+nn._([cms.global.PAGE_ID, 'title-func', 'History']));
            $('#notify-list-wrap-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
            if (cntList < 1) {
                $('#notify-empty-msg-tmpl').tmpl([{extMsg: 'You have no history notification'}]).appendTo('.list-outline');
                // $page.getEmptyUI(true);
            } else {
                $('#notify-list-item-history-tmpl').tmpl(HistoryLists).appendTo('#list-history');
            }
            $("#notifyHistory").parent().addClass('on');
            $(".notify-list-wrap").show();
            $('#overlay-s').fadeOut("slow");
        });
    };


    $page.getEmptyUI = function (newEnable) {
        var strDisableFix = "";

        if (!$page.isNotifyAvailable) {
            strDisableFix = 'disable';
        }

        $('#content-main-wrap .constrain').html('');
        $('#notify-comm-tmpl').tmpl([{extMsg: $page.getNotifyAvailable(), disableFix: strDisableFix}]).appendTo('#content-main-wrap .constrain');
        $('#notify-intro-image-tmpl').tmpl().appendTo('#content-main-wrap .constrain');

        if (true === newEnable) {
            $("#newNotify").removeClass("disable");
        }
    };

    $page.initNotify = function () {

        $common.showProcessingOverlay();

        if ($page.isNotifyAvailable === true) {
            $page.getNotifySchedule();
        } else {
            $page.getEmptyUI($page.isNotifyAvailable);
            $('#overlay-s').fadeOut("slow");
        }
    };

    cms.global.notifyInit = function () {
        if (null === cms.global.MSOINFO || null === cms.global.MSOINFO.gcmEnabled) {
            setTimeout(cms.global.notifyInit, 500);
        } else {
            var isNotifyiOS = cms.global.MSOINFO.apnsEnabled || false,
                isNotifyAndroid = cms.global.MSOINFO.gcmEnabled || false;

            if (isNotifyiOS === true || isNotifyAndroid === true) {
                $page.isNotifyAvailable = true;
            }

            if ("#add" === location.hash) {
                $page.newNotify();
            } else if ("#edit" === location.hash) {
                location.href = "app-notification.html";
            } else {
                $page.initNotify();
            }
        }
    };

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {

        $common.showProcessingOverlay();

        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: app-notification',
            options: options
        }, 'debug');

        var msoId = cms.global.MSO,
            inURL = $.url(location.href);

        if (msoId < 1) {
            location.href = "./";
        } else {
            cms.global.notifyInit();

            $('#func-nav .langkey').each(function() {
                $(this).text(nn._([cms.global.PAGE_ID, 'func-nav', $(this).data('langkey')]));
            });
            $('#title-func .langkey').each(function() {
                $(this).text(nn._([cms.global.PAGE_ID, 'title-func', $(this).data('langkey')]));
            });
            $('.intro .langkey').each(function() {
                $(this).text(nn._([cms.global.PAGE_ID, 'title-func', $(this).data('langkey')]));
            });

            $('#content-main-wrap').perfectScrollbar({
                marginTop: 25,
                marginBottom: 63
            });
        }

    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('app-notification')));