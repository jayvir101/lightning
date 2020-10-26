var server = new Server({type:"client1",permission:false});

Server.prototype.s = function(to,c,val) {
    if(commands[c]) server.send(to,commands[c].build(val));
}

window.ononline = function() {
    server.reconnect();
};

light.app.email().then(function(email) {
    server.email = email;
    server.onreceive = function(snapshot) {
        if(commands[snapshot.val().Data.Command]) {
            commands[snapshot.val().Data.Command].receive(snapshot);
        }
    }
    server.onreceiveError = function(snapshot) {
        if(snapshot.val().Data.data != "<code style='color:red;'>ha you idiot upgrade</code>") {
            server.s(snapshot.val().From,"log",["<code style='color:red;'>ha you idiot upgrade</code>",true]);
        }
    }
    server.connect();
    
    window.addEventListener("error",function(e) {
        server.s("client2","log",["<code style='color:red;'>" 
                              + e.message + " at " 
                              + e.filename + ":" 
                              + e.lineno + ":" 
                              + e.colno 
                              + "</code>",true]);
    });
});
