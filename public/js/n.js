function __nodelog__() {
    
    var u = nodelog_clientid;
    var l = document.location;
    var r = (typeof(document.referrer) == 'undefined') ? '' : document.referrer;
    var w = screen.width;
    var h = screen.height;
    var a = navigator.userAgent;
    var hl = 0;
    if (typeof(history) != 'undefined' && typeof(history.length) != 'undefined')
        hl = history.length;
   
    var e = function (s) {
        try {
            return encodeURIComponent(s);
        } catch(e) {
            var e = escape(s);
            e = e.replace(/@/g,"%40");
            e = e.replace(/\//g,"%2f");
            e = e.replace(/\+/g,"%2b");
            return e;
        }
    };
    var args='';
    var img=new Image(1,1);
    args += '?u='+e(u); args += '&l='+e(l); args += '&r='+e(r);
    args += '&w='+e(w); args += '&h='+e(h); args += '&a='+e(a);
    args += '&hl='+e(hl); 
    img.src='http://nodelog-c9-etrusco.c9.io/nodelog'+args;
    //img.src='http://nodelogapp.herokuapp.com/nodelog'+args;
    img.onload = function() { return; };
    
}
__nodelog__();