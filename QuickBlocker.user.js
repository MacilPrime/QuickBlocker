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
    var prepareID = null;
    var blockedIDs = []

    function setupCSS() {
        var qbCSS = $("<style/>");
        qbCSS.html(".hide_poster_final_button {color: red;} .hide_poster_cancel_button {color: green;} .hide_poster_button, .hide_poster_final_button, .hide_poster_cancel_button {display: block;}");
        qbCSS.appendTo(document.head);
    }

    function removePost(post) {
        post.fadeOut();
    }

    function blockID(id) {
        blockedIDs[id] = true;

        $(".thread .replyContainer").each(function() {
            var post = $(this);
            var posteruid = $(".posteruid", post).first().text();
            if(blockedIDs[posteruid]) {
                removePost(post);
            }
        });
    }

    function resetBlockedIDs() {
        resetPrepares();
        var restored = 0;
        $(".thread .replyContainer").each(function() {
            var post = $(this);
            var posteruid = $(".posteruid", post).first().text();
            if(blockedIDs[posteruid]) {
                post.show();
                restored++;
            }
        });
        blockedIDs = [];
        alert("Restored "+restored+" posts");
    }

    function prepareBlock(id) {
        resetPrepares();
        prepareID = id;

        $(".thread .replyContainer").each(function() {
            var post = $(this);
            var posteruid = $(".posteruid", post).first().text();
            if(posteruid === id) {
                $(".post", post).css("background-color","red");
                $(".hide_poster_button", post).hide();
                $(".hide_poster_final_button", post).show();
                $(".hide_poster_cancel_button", post).show();
            }
        });
    }

    function resetPrepares() {
        if(prepareID == null)
            return;

        $(".thread .replyContainer").each(function() {
            var post = $(this);
            var posteruid = $(".posteruid", post).first().text();
            if(posteruid === prepareID) {
                $(".post", post).css("background-color","");
                $(".hide_poster_button", post).show();
                $(".hide_poster_final_button", post).hide();
                $(".hide_poster_cancel_button", post).hide();
            }
        });

        prepareID = null;
    }

    function addButton(postContainer) {
        var posteruid = $(".posteruid", postContainer).first().text();
        var hidePosterButton = $("<a/>")
            .text("[ -- ]")
            .addClass("hide_poster_button")
            .attr("href","javascript:;")
            .click(function() {
                prepareBlock(posteruid);
            });
        var hidePosterFinalButton = $("<a/>")
            .text("[ -! ]")
            .addClass("hide_poster_final_button")
            .attr("href","javascript:;")
            .hide()
            .click(function() {
                blockID(posteruid);
            });
        var hidePosterCancelButton = $("<a/>")
            .text("[ .. ]")
            .addClass("hide_poster_cancel_button")
            .attr("href","javascript:;")
            .hide()
            .click(function() {
                resetPrepares();
            });
        $(".hide_reply_button", postContainer)
            .append($("<br/>"), hidePosterButton, hidePosterFinalButton, hidePosterCancelButton);
    }

    function addButtons(context) {
        var resetButton = $("<a/>").text("Reset blocked IDs").attr("href","javascript:;").click(function() {
            resetBlockedIDs();
        });
        $("#delform").prepend(resetButton, $("<br/><br/>"));

        $(".thread .replyContainer").each(function() {
            addButton(this);
        });
    }

    function setupListener() {
        $(document).on("DOMNodeInserted", ".thread", function(event) {
            var tag = $(event.target);
            if(tag.hasClass("replyContainer")) {
                addButton(tag);
                var posteruid = $(".posteruid", tag).first().text();
                if(blockedIDs[posteruid]) {
                    tag.hide();
                }
            }
        });
    }

    setupCSS();
    addButtons();
    setupListener();
}

addJQuery(qbmain);
