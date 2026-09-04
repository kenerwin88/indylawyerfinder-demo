// main proxy function
// c=cfc id, m=cfc method, a=cfc arguments, scb=onsuccess callback, ecb=onerror callback, to=timeout, tocb=ontimeout callback
function TS_AJX(c,m,a,scb,ecb,to,tocb) {
    var url = '/?event=proxy.ts_json&c=' + c + '&m=' + m;

    // intercept functions
    var ts_scb = function(r) { 
        try {
            if (typeof(scb)=="function") scb(r);
        } catch(e) { 
            if (typeof(ecb)=="function") ecb(r,e.message,e.description);
        }
    };
    var ts_ecb = function(r) { 
        if (typeof(ecb)=="function") ecb(r);
    };
    var ts_tcb = function(r) { 
        if (typeof(tocb)=="function") tocb(r);
        else if (typeof(ecb)=="function") ecb(r);
    };

    var data = TS_AJX_PrepareParams(a);

     $.ajax({
        url: url,
        timeout: to,
        type: 'POST',
        dataType: 'json',
        data: data,
        complete: function(xhr,s) { 
            try { 
                var r = TS_AJX_KeysToLowerCase(JSON.parse(xhr.responseText)); 
                if(r.success !== undefined) r.success = r.success.toString();
            } catch(e) { 
                var r = new Object();
                r.success = "false";
                r.errmsg = "Some error occured while parsing response.";
            }

            if (s == 'success') ts_scb(r); 
            else if (s == 'timeout') ts_tcb(r);
            else ts_ecb(r);
        }
    });
}

/* JQUERY AJAX SYNC SUPPORT */
// c=cfc id, m=cfc method, a=cfc arguments, scb=onsuccess callback, ecb=onerror callback, to=timeout, tocb=ontimeout callback 
function TS_AJX_SYNC(c,m,a,scb,ecb,to,tocb) {
    var url = '/?event=proxy.ts_json&c=' + c + '&m=' + m;

    // intercept functions
    var ts_scb = function(r) { 
        try {
            if (typeof(scb)=="function") scb(r);
        } catch(e) { 
            if (typeof(ecb)=="function") ecb(r,e.message,e.description);
        }
    };
    var ts_ecb = function(r) { 
        if (typeof(ecb)=="function") ecb(r);
    };
    var ts_tcb = function(r) { 
        if (typeof(tocb)=="function") tocb(r);
        else if (typeof(ecb)=="function") ecb(r);
    };

    var data = TS_AJX_PrepareParams(a);

    $.ajax({
        url: url,
        async: false,
        cache: false,
        timeout: to,
        type: 'POST',
        dataType: 'json',
        data: data,
        complete: function(xhr,s) { 
            try { 
                var r = TS_AJX_KeysToLowerCase(JSON.parse(xhr.responseText)); 
                if(r.success !== undefined) r.success = r.success.toString();
            } catch(e) { 
                var r = new Object();
                r.success = "false";
                r.errmsg = "Some error occured while parsing response.";
            }

            if (s == 'success') ts_scb(r); 
            else if (s == 'timeout') ts_tcb(r);
            else ts_ecb(r);
        }
    });
}

function TS_AJX_PrepareParams(obj) {
    for(var i in obj) {
        if (obj[i] === undefined || obj[i] === null) obj[i] = '';
        else if (obj[i] instanceof Array) {
            obj[i + '~[]~'] = obj[i].join('^~~~^');
            delete obj[i];
        }
    }
    return obj;
}

function TS_AJX_KeysToLowerCase(obj) {
    if (obj === null) return null;
    else if(obj instanceof Array) {
        for (var i in obj) {
            obj[i] = TS_AJX_KeysToLowerCase(obj[i]);
        }
    }
    if (!typeof(obj) === "object" || typeof(obj) === "string" || typeof(obj) === "number" || typeof(obj) === "boolean") {
        return obj;
    }
    var keys = Object.keys(obj);
    var n = keys.length;
    var lowKey;
    while (n--) {
        var key = keys[n];
        if (key === (lowKey = key.toLowerCase()))
            continue;
        obj[lowKey] = TS_AJX_KeysToLowerCase(obj[key]);
        delete obj[key];
    }
    return obj;
}