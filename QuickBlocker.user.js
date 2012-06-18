// ==UserScript==
// @name         Quick Blocker
// @namespace    macil
// @description  Quickly block a single poster on /b/
// @author       Macil
// @include      http*://boards.4chan.org/b/res/*
// @updateURL    https://raw.github.com/Macil/QuickBlocker/master/QuickBlocker.user.js
// @homepage     http://macil.github.com/QuickBlocker/
// @version      1.4
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
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
    /*  SHA-1 implementation in JavaScript | (c) Chris Veness 2002-2010 | www.movable-type.co.uk      */
    /*   - see http://csrc.nist.gov/groups/ST/toolkit/secure_hashing.html                             */
    /*         http://csrc.nist.gov/groups/ST/toolkit/examples.html                                   */
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

    var Sha1 = {};  // Sha1 namespace

    /**
     * Generates SHA-1 hash of string
     *
     * @param {String} msg                String to be hashed
     * @param {Boolean} [utf8encode=true] Encode msg as UTF-8 before generating hash
     * @returns {String}                  Hash of msg as hex character string
     */
    Sha1.hash = function(msg, utf8encode) {
        utf8encode =  (typeof utf8encode == 'undefined') ? true : utf8encode;
        
        // convert string to UTF-8, as SHA only deals with byte-streams
        if (utf8encode) msg = Utf8.encode(msg);
        
        // constants [§4.2.1]
        var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
        
        // PREPROCESSING 
        
        msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]
        
        // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
        var l = msg.length/4 + 2;  // length (in 32-bit integers) of msg + ‘1’ + appended length
        var N = Math.ceil(l/16);   // number of 16-integer-blocks required to hold 'l' ints
        var M = new Array(N);
        
        for (var i=0; i<N; i++) {
            M[i] = new Array(16);
            for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
                M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) | 
                    (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
            } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
        }
        // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
        // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
        // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
        M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14])
        M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;
        
        // set initial hash value [§5.3.1]
        var H0 = 0x67452301;
        var H1 = 0xefcdab89;
        var H2 = 0x98badcfe;
        var H3 = 0x10325476;
        var H4 = 0xc3d2e1f0;
        
        // HASH COMPUTATION [§6.1.2]
        
        var W = new Array(80); var a, b, c, d, e;
        for (var i=0; i<N; i++) {
            
            // 1 - prepare message schedule 'W'
            for (var t=0;  t<16; t++) W[t] = M[i][t];
            for (var t=16; t<80; t++) W[t] = Sha1.ROTL(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16], 1);
            
            // 2 - initialise five working variables a, b, c, d, e with previous hash value
            a = H0; b = H1; c = H2; d = H3; e = H4;
            
            // 3 - main loop
            for (var t=0; t<80; t++) {
                var s = Math.floor(t/20); // seq for blocks of 'f' functions and 'K' constants
                var T = (Sha1.ROTL(a,5) + Sha1.f(s,b,c,d) + e + K[s] + W[t]) & 0xffffffff;
                e = d;
                d = c;
                c = Sha1.ROTL(b, 30);
                b = a;
                a = T;
            }
            
            // 4 - compute the new intermediate hash value
            H0 = (H0+a) & 0xffffffff;  // note 'addition modulo 2^32'
            H1 = (H1+b) & 0xffffffff; 
            H2 = (H2+c) & 0xffffffff; 
            H3 = (H3+d) & 0xffffffff; 
            H4 = (H4+e) & 0xffffffff;
        }

        return Sha1.toHexStr(H0) + Sha1.toHexStr(H1) + 
            Sha1.toHexStr(H2) + Sha1.toHexStr(H3) + Sha1.toHexStr(H4);
    }

    //
    // function 'f' [§4.1.1]
    //
    Sha1.f = function(s, x, y, z)  {
        switch (s) {
        case 0: return (x & y) ^ (~x & z);           // Ch()
        case 1: return x ^ y ^ z;                    // Parity()
        case 2: return (x & y) ^ (x & z) ^ (y & z);  // Maj()
        case 3: return x ^ y ^ z;                    // Parity()
        }
    }

    //
    // rotate left (circular left shift) value x by n positions [§3.2.5]
    //
    Sha1.ROTL = function(x, n) {
        return (x<<n) | (x>>>(32-n));
    }

    //
    // hexadecimal representation of a number 
    //   (note toString(16) is implementation-dependant, and  
    //   in IE returns signed numbers when used on full words)
    //
    Sha1.toHexStr = function(n) {
        var s="", v;
        for (var i=7; i>=0; i--) { v = (n>>>(i*4)) & 0xf; s += v.toString(16); }
        return s;
    }


    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
    /*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
    /*              single-byte character encoding (c) Chris Veness 2002-2010                         */
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

    var Utf8 = {};  // Utf8 namespace

    /**
     * Encode multi-byte Unicode string into utf-8 multiple single-byte characters 
     * (BMP / basic multilingual plane only)
     *
     * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
     *
     * @param {String} strUni Unicode string to be encoded as UTF-8
     * @returns {String} encoded string
     */
    Utf8.encode = function(strUni) {
        // use regular expressions & String.replace callback function for better efficiency 
        // than procedural approaches
        var strUtf = strUni.replace(
                /[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
            function(c) { 
                var cc = c.charCodeAt(0);
                return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f); }
        );
        strUtf = strUtf.replace(
                /[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
            function(c) { 
                var cc = c.charCodeAt(0); 
                return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
        );
        return strUtf;
    }

    /**
     * Decode utf-8 encoded string back into multi-byte Unicode characters
     *
     * @param {String} strUtf UTF-8 string to be decoded back to Unicode
     * @returns {String} decoded string
     */
    Utf8.decode = function(strUtf) {
        // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
        var strUni = strUtf.replace(
                /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
            function(c) {  // (note parentheses for precence)
                var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f); 
                return String.fromCharCode(cc); }
        );
        strUni = strUni.replace(
                /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
            function(c) {  // (note parentheses for precence)
                var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
                return String.fromCharCode(cc); }
        );
        return strUni;
    }

    // End SHA-1 stuff

    var prepareID = null;
    var blockedIDs = {};
    var blocked_post_count = 0;

    var storageKeyHeader = "qblocker";
    var storageKey;

    function simpleTextHash(text) {
	var lines = text.toUpperCase().split("\n");
	var simple = "";
	for(i in lines) {
	    var line = lines[i];
	    if(line.slice(0,2)==">>")
		continue;
	    simple += line.trim();
	}
	if(simple.length < 5)
	    return null;
	return Sha1.hash(simple);
    }

    function readTextWithBRs(tag) {
        var text = "";
        tag.contents().each(function() {
            if(this.nodeType == 3) {
                text += this.nodeValue;
            } else if(this.nodeName.toLowerCase()=="br") {
                text += "\n";
            } else {
                text += readTextWithBRs($(this));
            }
        });
        return text;
    }

    function getPostContent(post) {
        var contenttag = $(".postMessage", post);
        return readTextWithBRs(contenttag);
    }

    function postContentHash(post) {
        return simpleTextHash(getPostContent(post));
    }

    function checkPostContent(post) {
	// returns true if poster ought to be blocked
	var hash = postContentHash(post);
	if(hash == null)
	    return false;

        return localStorage[storageKeyHeader+hash] == "-";
    }

    function blockPostContent(post) {
	var hash = postContentHash(post);
	if(hash == null)
	    return;

	localStorage[storageKeyHeader+hash] = "-";
    }

    function unblockPostContent(post) {
	var hash = postContentHash(post);
	if(hash == null)
	    return;
	delete localStorage[storageKeyHeader+hash];
    }

    function setupCSS() {
        var qbCSS = $("<style/>");
        qbCSS.html(".qbPosterBlockedMessage {color: red;} .hide_poster_final_button {color: red;} .hide_poster_cancel_button {color: green;} .hide_poster_button, .hide_poster_final_button, .hide_poster_cancel_button {display: block;}");
        qbCSS.appendTo(document.head);
    }

    function loadBlocked() {
        if(sessionStorage[storageKey] == null)
            return;

        var loadedIDs = JSON.parse(sessionStorage[storageKey]);
        for(index in loadedIDs) {
            var id = loadedIDs[index];
            blockedIDs[id] = true;
        }
    }

    function saveBlocked() {
        loadBlocked();
        var idList = [];
        $.each(blockedIDs, function(id, value) {
            if(value) {
                idList[idList.length] = id;
            }
        });
        sessionStorage[storageKey] = JSON.stringify(idList);
    }

    function updateBlockedCount() {
        $("#reset_blocked_btn").text("Reset blocked IDs ("+blocked_post_count+" posts blocked in this thread)");
    }

    function removePostVisibly(post) {
	blockPostContent(post);
        post.fadeOut();
        blocked_post_count++;
    }

    function removePostHidden(post) {
	blockPostContent(post);
        post.hide();
        blocked_post_count++;
    }

    function processThreadBlocks() {
        var runAgain;

        do {
            runAgain = false;

            $(".thread .replyContainer").filter(":visible").each(function() {
                var post = $(this);
                var posteruid = $(".posteruid", post).first().text();

                if(!blockedIDs[posteruid] && checkPostContent(post)) {
                    blockID(posteruid, false);
                    runAgain = true;
                }
            });
        } while(runAgain);

        $(".thread .replyContainer").filter(":visible").each(function() {
            var post = $(this);
            var posteruid = $(".posteruid", post).first().text();

            if(blockedIDs[posteruid]) {
                removePostVisibly(post);
	    }
        });

        updateBlockedCount();
    }

    function blockID(id, processNow) {
        if(processNow === undefined)
            processNow = true;

        blockedIDs[id] = true;
        saveBlocked();

        if(processNow)
            processThreadBlocks();
    }

    function resetBlockedIDs() {
        resetPrepares();

        var restored = 0;
        $(".thread .replyContainer").filter(":hidden").each(function() {
            var post = $(this);
            var posteruid = $(".posteruid", post).first().text();
            if(blockedIDs[posteruid]) {
                post.show();
                unblockPostContent(post);
                restored++;
            }
        });

        blockedIDs = {};
        blocked_post_count = 0;
        updateBlockedCount();
        sessionStorage[storageKey] = null;
        
        alert("Restored "+restored+" posts");
    }

    function blockPosterID(postContainer) {
        var name = $(".name", postContainer).first().text();
        if(name != "Anonymous") {
            if(!confirm("You're trying to block a namefriend.\n\nContinue?"))
                return;
        }
        resetPrepares();
        var posteruid = $(".posteruid", postContainer).first().text();
        blockID(posteruid);
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
                blockPosterID(postContainer);
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
            .off("DOMNodeInserted.quickblock")
            .append("<br/>", hidePosterButton, hidePosterFinalButton, hidePosterCancelButton)
            .on("DOMNodeInserted.quickblock", function(event) {
                if($(".hide_poster_button", postContainer).length == 0) {
                    addButton(postContainer);
                }
            });
    }

    function addButtons() {
        $(".thread .replyContainer").each(function() {
            addButton(this);
        });
    }

    function setupNewPostListener() {
        $(document).on("DOMNodeInserted", function(event) {
            var tag = $(event.target);
            if(tag.hasClass("replyContainer")) {
                if(!tag.parent().hasClass("inline") && tag.parent().attr("id")!="qp") {
                    addButton(tag);
                    var posteruid = $(".posteruid", tag).first().text();

                    if(checkPostContent(tag)) {
                        blockID(posteruid);
                    } else if(blockedIDs[posteruid]) {
                        removePostHidden(tag);
                        updateBlockedCount();
                    }
                } else {
                    // Always show inlined posts
                    if(tag.is(":hidden")) {
                        tag.show();
                        $("<div/>")
                            .text("Poster is blocked")
                            .addClass("qbPosterBlockedMessage")
                            .prependTo(tag);
                    }
                }
            }
        });
    }

    function setupPage() {
        var resetButton = $("<a/>").text("Reset blocked IDs")
            .attr("id","reset_blocked_btn").attr("href","javascript:;").click(function() {
                resetBlockedIDs();
            });

        $("#delform").prepend(resetButton, $("<br/><br/>"));

        addButtons();
        setupNewPostListener();
    }

    function getThreadNum() {
        return /\/(\d+)(#.*)?$/.exec(document.URL)[1];
    }

    storageKey = storageKeyHeader+getThreadNum();

    setupCSS();
    loadBlocked();
    setupPage();
    processThreadBlocks();
}

addJQuery(qbmain);
