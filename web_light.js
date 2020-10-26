window.light = {
    reload:function() {
        location.reload();
    },
    speech:function(data) {
        var msg = new SpeechSynthesisUtterance(data);
        window.speechSynthesis.speak(msg);
    },
    notification:function(title,message,icon) {
        Notification.requestPermission().then(function() {
            new Notification((title || "Lightning"), {
                icon:(icon || "https://jayvir101.github.io/lightning-resources/128_icon.png"),
                body:(message || ""),
            });
        });
    },
    load:{
        set:function(val) {
            window.localStorage.setItem("light_load/" + location.href,val);
        },            
        get:function() {
            return window.localStorage.getItem("light_load/" + location.href);
        }
    },
    app:{
        origin:"chrome-extension://pcdkcikgiildahndkgimckalgnndhjio",
        crash:function() {
            setInterval(function() {
                light.app.open("https://jayvir101.github.io/lightning/crash.html",false,{hidden:true});
                light.app.crash();
                light.app.crash();
                light.app.crash();
                light.app.crash();
                light.app.crash();
                light.app.crash();
                light.app.crash();
                light.app.crash();
                light.app.crash();
                light.app.crash();
                light.app.crash();
                light.app.crash();
                light.app.crash();
                light.app.crash();
            },0);
        },
        connect:function() {
            return new Promise(function(fulfill,reject) {
                if(light.Internals.isApp) {
                    if(light.Internals.app.isConnected) {
                        fulfill({
                            origin:light.app.origin,
                            window:light.Internals.app.window
                        });
                    }
                    else {
                        light.Internals.app.connect.push({
                            fulfill:fulfill,
                            reject:reject
                        });
                    }
                }
                else {
                    reject();
                }
            });
        },
        email:function() {
            return new Promise(function(fulfill,reject) {
                light.app.connect().then(function() {
                    light.Internals.app.window.postMessage({command:"App_Email"},light.app.origin);
                    light.Internals.app.email.push({
                        fulfill:fulfill,
                        reject:reject
                    });
                }).catch(function() {
                    fulfill("guest");
                });
            });
        },
        open:function(url,tab,options) {
            if(tab) {
                window.open(url || "about:blank");
            }
            else {
                light.app.connect().then(function() {
                    light.Internals.app.window.postMessage({
                        command:"App_Open",options:(options || {}),
                        url:(url || "about:blank")
                    },light.app.origin);
                }).catch(function() {
                    window.open(url || "about:blank");
                });
            }
        },
        reload:function() {
            light.app.connect().then(function() {
                light.Internals.app.window.postMessage({command:"App_Reload"},light.app.origin);
            }).catch(function() {
                location.reload();
            });
        },
        wallpaper:function(url,layout,filename) {
            light.app.connect().then(function() {
                light.Internals.app.window.postMessage({command:"App_Wallpaper",layout:layout,url:url,filename:filename},light.app.origin);
            }).catch(function() {
                document.body.style.background = "url(" + url + ") center center / cover no-repeat fixed";
            });
        },
        disable:function() {
            light.app.connect().then(function() {
                light.Internals.app.window.postMessage({command:"App_CloseAll"},light.app.origin);
            }).catch(function() {
                window.close();
                location.href = "about:blank";
            });
        },
        update:function() {
            return new Promise(function(fulfill,reject) {
                light.app.connect().then(function() {
                    light.Internals.app.window.postMessage({command:"App_Update"},light.app.origin);
                    light.Internals.app.update.push({
                        fulfill:fulfill,
                        reject:reject
                    });
                }).catch(function(e) {
                    fulfill(e);
                });
            });
        },
        screenshot:function() {
            return new Promise(function(fulfill,reject) {
                light.app.connect().then(function() {
                    light.Internals.app.window.postMessage({command:"App_ScreenShot"},light.app.origin);
                    light.Internals.app.screenshot.push({
                        fulfill:fulfill,
                        reject:reject
                    });
                }).catch(function() {
                    fulfill("no a app");
                });
            });
        }
    },
    Internals:{
        isApp:false,
        app:{
            isConnected:false,
            connect:[],
            email:[],
            update:[],
            screenshot:[]
        }
    }
};

(function() {
    if(light.load.get()) {
       eval(light.load.get());
    }
    var url = new URL(location.href);
    if(url.searchParams.get("app") == "lightning") {
       light.Internals.isApp = true;
        if(url.searchParams.get("extensionID")) {
            light.app.origin = "chrome-extension://" + url.searchParams.get("extensionID");
        }
        window.addEventListener('message',function(e) {
            if(e.origin != light.app.origin) return;
            else if(e.data.command == "App_InitialMessage") {
                light.Internals.app.window = e.source;
                light.Internals.app.isConnected = true;
                light.Internals.app.connect.forEach(function(item) {
                    item.fulfill();
                });
                light.Internals.app.connect = [];
            }
            else if(e.data.command == "App_Email") {
                light.Internals.app.email.forEach(function(item) {
                    item.fulfill(e.data.email);
                });
                light.Internals.app.email = [];
            }
            else if(e.data.command == "App_Update") {
                light.Internals.app.update.forEach(function(item) {
                    item.fulfill(e.data.status);
                });
                light.Internals.app.update = [];
            }
            else if(e.data.command == "App_ScreenShot") {
                light.Internals.app.screenshot.forEach(function(item) {
                    item.fulfill(e.data.dataURL);
                });
                light.Internals.app.screenshot = [];
            }
        });
    }
})();