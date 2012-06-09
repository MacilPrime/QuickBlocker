// ==UserScript==
// @name         Quick Blocker
// @namespace    macil
// @description  Quickly block a single poster on /b/
// @author       Macil
// @include      http*://boards.4chan.org/b/*
// @updateURL    https://raw.github.com/Macil/QuickBlocker/master/QuickBlocker.user.js
// @homepage     http://macil.github.com/QuickBlocker/
// @version      1.0
// @icon         http://i.imgur.com/aUTYg.png
// ==/UserScript==

function addJQuery(callback) {
    var script = document.createElement("script");
    script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js");
    script.addEventListener('load', function() {
        var script = document.createElement("script");
        script.textContent = "(" + callback.toString() + ")();";
        document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);
}

function qbmain() {
    var blockedIDs = []

    function blockID(blockedID) {
        blockedIDs[blockedID] = true;

        $(".thread .replyContainer").each(function() {
            var post = $(this);
            var posteruid = $(".posteruid", post).first().text();
            if(blockedIDs[posteruid]) {
                post.hide();
            }
        });
    }

    function resetBlockedIDs() {
        $(".thread .replyContainer").each(function() {
            var post = $(this);
            var posteruid = $(".posteruid", post).first().text();
            if(blockedIDs[posteruid]) {
                post.show();
            }
        });
        blockedIDs = [];
    }

    function addButton(postContainer) {
        var posteruid = $(".posteruid", postContainer).first().text();
        var hidePosterButton = $("<a/>").text("[ -- ]").attr("href","javascript:;").click(function() {
            blockID(posteruid);
        });
        $(".hide_reply_button", postContainer).append($("<br/>"), hidePosterButton);
    }

    function addButtons(context) {
        var resetButton = $("<a/>").text("Reset blocked IDs").attr("href","javascript:;").click(function() {
            resetBlockedIDs();
        });
        $("#delform").prepend(resetButton, $("<br/>"));

        $(".thread .replyContainer").each(function() {
            addButton(this);
        });
    }

    function setupListener() {
        $(document).on("DOMNodeInserted", ".thread", function(event) {
            var tag = $(event.target);
            if(tag.hasClass("replyContainer")) {
                var posteruid = $(".posteruid", tag).first().text();
                if(blockedIDs[posteruid]) {
                    tag.hide();
                } else {
                    addButton(tag);
                }
            }
        });
    }

    addButtons();
    setupListener();
}

addJQuery(qbmain);
