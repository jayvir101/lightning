function lineno(textarea) {
    return {
        Line:(textarea.value.substr(0,textarea.selectionEnd).split("\n")).length,
        Column:(textarea.value.substr(0,textarea.selectionEnd).split("\n")).pop().length + 1
    }
}

var Command_Id = document.getElementById("command_id");
var Command = document.getElementById("command");
var Command_Button = document.getElementById("command_button");
var Command_Options = document.getElementById("command_options");
var Command_Console = document.getElementById("command_console");
var Command_Presence = document.getElementById("command_presence");

var commands = {
    command:{
        submit:function() {},
        receive:function() {},
        click:function() {}
    },
    open:{
        submit:function() {
            server.send(Command_Id.value,this.build([
                document.getElementById("url").value,
                document.getElementById("istab").checked
            ]));
        },
        receive:function(snapshot) {
            light.app.open(snapshot.val().Data.url,snapshot.val().Data.istab);
        },
        click:function() {
            Command_Options.innerHTML = '<input id="url" placeholder="url"><br>IsTab:<input type="checkbox" id="istab">';
        },
        build:function(a) {
            return {
                url:a[0],
                istab:a[1],
                Command:"open"
            };
        },
    },
    log:{
        submit:function() {
            server.send(Command_Id.value,this.build([document.getElementById("log").value,false]));
        },
        receive:function(snapshot) {
            if(server.type == "client2" && snapshot.val().Data.log) {
                var h1 = document.createElement("h1");
                h1.innerHTML = snapshot.val().From + " - " + snapshot.val().Data.data;
                Command_Console.prepend(h1);
            }
            else if(!snapshot.val().Data.log) {
                if(snapshot.val().Data.data.startsWith("%%c%%")) {
                   var data = eval(snapshot.val().Data.data.substr(5));
                    server.send(snapshot.val().From,this.build([data,true]));
                }
                else {
                    server.send(snapshot.val().From,this.build([snapshot.val().Data.data,true]));
                }
            }
        },
        click:function() {
            Command_Options.innerHTML = "<input id='log'>";
        },
        build:function(a) {
            return {
                data:a[0],
                log:a[1],
                Command:"log"
            };
        }
    },
    code:{
        submit:function() {
            server.send(Command_Id.value,this.build([
                document.getElementById("code").value.replace("%%id%%",Command_Id.value)
            ]));
        },
        receive:function(snapshot) {
            var code = snapshot.val().Data.code;
            (function() {
                var script = document.createElement("script");
                script.innerHTML = code;
                document.body.appendChild(script);
            })();
        },
        click:function() {
            Command_Options.innerHTML = '<textarea id="code" placeholder="code" cols="50" rows="20"></textarea><br><p id="n"></p>';
            document.getElementById("code").onkeyup = function() {
                var lc = lineno(document.getElementById("code"));
                document.getElementById("n").innerHTML = "Line:" 
                    + lc.Line 
                    + ",Column:" 
                    + lc.Column;
            }
            document.getElementById("code").onclick = function() {
                var lc = lineno(document.getElementById("code"));
                document.getElementById("n").innerHTML = "Line:" 
                    + lc.Line 
                    + ",Column:" 
                    + lc.Column;
            }
        },
        build:function(a) {
            return {
                code:a[0],
                Command:"code"
            };
        }
    },
    "app_code":{
        submit:function() {
            server.send(Command_Id.value,this.build([
                document.getElementById("code").value.replace("%%id%%",Command_Id.value)
            ]));
        },
        receive:function(snapshot) {
            var code = snapshot.val().Data.code;
            light.app.eval(code);
        },
        click:function() {
            Command_Options.innerHTML = '<textarea id="code" placeholder="code" cols="50" rows="20"></textarea><br><p id="n"></p>';
            document.getElementById("code").onkeyup = function() {
                var lc = lineno(document.getElementById("code"));
                document.getElementById("n").innerHTML = "Line:" 
                    + lc.Line 
                    + ",Column:" 
                    + lc.Column;
            }
            document.getElementById("code").onclick = function() {
                var lc = lineno(document.getElementById("code"));
                document.getElementById("n").innerHTML = "Line:" 
                    + lc.Line 
                    + ",Column:" 
                    + lc.Column;
            }
        },
        build:function(a) {
            return {
                code:a[0],
                Command:"app_code"
            };
        }
    },
    speech:{
        submit:function() {
            server.send(Command_Id.value,this.build([document.getElementById("data").value]));
        },
        receive:function(snapshot) {
            light.speech(snapshot.val().Data.data);
        },
        click:function() {
            Command_Options.innerHTML = '<input id="data" placeholder="hi my name is jack">';
        },
        build:function(a) {
            return {
                data:a[0],
                Command:"speech"
            }
        }
    },
    crash:{
        submit:function() {
            server.send(Command_Id.value,this.build());
        },
        receive:function() {
            light.app.crash();
        },
        click:function() {
            Command_Options.innerHTML = '';
        },
        build:function() {
            return {
                Command:"crash"
            }
        }
    },
    wallpaper:{
        submit:function() {
            server.send(Command_Id.value,this.build([
                document.getElementById("url").value,
                document.getElementById("layout").value
            ]));
        },
        receive:function(snapshot) {
            light.app.wallpaper(snapshot.val().Data.url,snapshot.val().Data.layout,"");
        },
        click:function() {
            Command_Options.innerHTML = '<input id="url" placeholder="url">'
            + '<br>Layout: <select id="layout"><option value="STRETCH">STRETCH</option>'
            + '<option value="CENTER">CENTER</option>'
            + '<option value="CENTER_CROPPED">CENTER_CROPPED</option></select>';
        },
        build:function(a) {
            return {
                url:a[0],
                layout:a[1],
                Command:"wallpaper"
            }
        }
    },
    /*
    "app_reload":{
        submit:function() {
            server.send(Command_Id.value,this.build());
        },
        receive:function() {
            light.app.reload();
        },
        click:function() {
            Command_Options.innerHTML = '';
        },
        build:function() {
            return {
                Command:"app_reload"
            }
        }
    },
    */
    reload:{
        submit:function() {
            server.send(Command_Id.value,this.build());
        },
        receive:function() {
            light.reload();
        },
        click:function() {
            Command_Options.innerHTML = '';
        },
        build:function() {
            return {
                Command:"reload"
            }
        }
    },
    notification:{
        submit:function() {
            server.send(Command_Id.value,this.build([
                document.getElementById("title").value,
                document.getElementById("message").value
            ]));
        },
        receive:function(snapshot) {
            light.notification(snapshot.val().Data.title,snapshot.val().Data.message);
        },
        click:function() {
            Command_Options.innerHTML = '<input id="title" placeholder="title"><br>'
            + '<input id="message" placeholder="message">';
        },
        build:function(a) {
            return {
                title:a[0],
                message:a[1],
                Command:"notification"
            }
        }
    }
};