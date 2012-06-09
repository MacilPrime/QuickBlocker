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
    var blockedIDs = {};
    var blocked_post_count = 0;

    function setupCSS() {
        var qbCSS = $("<style/>");
        qbCSS.html(".hide_poster_final_button {color: red;} .hide_poster_cancel_button {color: green;} .hide_poster_button, .hide_poster_final_button, .hide_poster_cancel_button {display: block;}");
        qbCSS.appendTo(document.head);
    }

    function loadBlocked() {
    }

    function saveBlocked() {
    }

    function updateBlockedCount() {
        $("#reset_blocked_btn").text("Reset blocked IDs ("+blocked_post_count+" posts blocked in this thread)");
    }

    function removePostVisibly(post) {
        post.fadeOut();
        blocked_post_count++;
    }

    function removePostHidden(post) {
        post.hide();
        blocked_post_count++;
    }

    function processThreadBlocks() {
        $(".thread .replyContainer").filter(":visible").each(function() {
            var post = $(this);
            var posteruid = $(".posteruid", post).first().text();
            if(blockedIDs[posteruid]) {
                removePostVisibly(post);
            }
        });

        updateBlockedCount();
    }

    function blockID(id) {
        blockedIDs[id] = true;
        processThreadBlocks();
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

        blockedIDs = {};
        blocked_post_count = 0;
        updateBlockedCount();
        
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

        $(".sideArrows", postContainer)
            .append("<br/>", hidePosterButton, hidePosterFinalButton, hidePosterCancelButton);
    }

    function addButtons() {
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
                    removePostHidden(tag);
                    updateBlockedCount();
                }
            }
        });
    }

    function is4chanXloaded() {
        var settingsButton = $("#navbotr a").first();
        return settingsButton.text() == "4chan X Settings";
    }

    function setupPageEarly() {
        var resetButton = $("<a/>").text("Reset blocked IDs")
            .attr("id","reset_blocked_btn").attr("href","javascript:;").click(function() {
                resetBlockedIDs();
            });

        $("#delform").prepend(resetButton, $("<br/><br/>"));
    }

    var setupTries = 0;
    // Runs things that have to be run after 4chan X is loaded
    function setupPageLate() {
        if(is4chanXloaded()) {
            addButtons();
            setupListener();
        } else {
            if(setupTries++ < 10) {
                setTimeout(setupPageLate, 100);
            } else {
                alert("QuickBlocker requires 4chan X!");
            }
        }
    }

    setupCSS();
    loadBlocked();
    setupPageEarly();
    processThreadBlocks();
    setupPageLate();
}

addJQuery(qbmain);
