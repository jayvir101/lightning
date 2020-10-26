(function(window,Math,firebase) {
    if(!window || !Math || !firebase) throw "Server: Some dependencies missing.";
    if(window.Server) throw "Server: Server variable already defined.";
    firebase.initializeApp({
        apiKey: "AIzaSyCaJpc43ToCINhcydIBMucwkxsLNmJ3rSM",
        authDomain: "lightning-1d2c1.firebaseapp.com",
        databaseURL: "https://lightning-1d2c1.firebaseio.com",
        projectId: "lightning-1d2c1",
        storageBucket: "lightning-1d2c1.appspot.com",
        messagingSenderId: "512217392825"
    });
    var database = firebase.database();
    window.database = firebase.database();
    var Presence = database.ref("Presence");
    window.Server = function(options) {
        if(this === window) throw "Server: Please use new keyword.";
        this.version = "1";
        this.email = "guest";
        this.type = "default";
        this.permission = false;
        this.id = Math.floor(Math.random() * 90000) + 10000;
        if(typeof options === "object" && options) {
            if(options.email) this.email = options.email;
            if(options.type) this.type = options.type;
            if(options.id) this.id = options.id;
            if(options.permission !== undefined) this.permission = options.permission;
        }
        this.connected = false;
        this.onreceive = null;
        this.onpresence_removed = null;
        this.onpresence_added = null;
        this.onpresence_changed = null;
        this.ondisconnect = null;
        this.onconnect = null;
        this.onsend = null;
    };
    Server.onauth = function(callback) {
        firebase.auth().onAuthStateChanged(function(user) {
            if(callback) callback(user);
        });
    };
    Server.login = function(email,password) {return firebase.auth().signInWithEmailAndPassword(email,password)};
    Server.logout = function() {return firebase.auth().signOut()};
    Server.base = firebase;
    Server.database = database;
    Server.prototype.send = function(to,data) {
        if(this === window) throw "Server: Please use new keyword.";
        if(!this.connected) throw "Server: Please connect to the server first.";
        if(typeof this.onsend === 'function') this.onsend(to,data);
        database.ref("ClientData").set({
            From:this.id,
            To:to,
            Data:data,
            TimeStamp:Date.now(),
        });
    };

    Server.prototype.connect = function() {
        if(this === window) throw "Server: Please use new keyword.";
        if(this.connected) throw "Server: Already connected to the server.";
        var This = this;
        this.connected = true;
        if(typeof This.onconnect === 'function') This.onconnect();
        Presence.on("child_removed", function(snapshot) {
            if(typeof This.onpresence_removed === 'function') This.onpresence_removed(snapshot);
        });
        Presence.on("child_added", function(snapshot) {
            if(typeof This.onpresence_added === 'function') This.onpresence_added(snapshot);
        });
        Presence.on("child_changed", function(snapshot) {
            if(typeof This.onpresence_changed === 'function') This.onpresence_changed(snapshot);
        });
        database.ref("Presence/" + This.id).onDisconnect().remove();
        database.ref("Presence/" + This.id).set({id:This.id,email:This.email,type:This.type});
        database.ref().on("child_changed",function(snapshot) {
            if(snapshot.key == "ClientData") {
                var To = snapshot.val().To;
                if(To == This.id || To == "all" || To == This.type || To == This.email) {
                    if(This.permission) {
                        if(typeof This.onreceive === 'function') This.onreceive(snapshot);
                    }
                    else if(snapshot.val().Data.privilege) {
                        if(typeof This.onreceive === 'function') This.onreceive(snapshot);
                    }
                    else {
                        if(typeof This.onreceiveError === 'function') This.onreceiveError(snapshot);
                    }
                }
            }
        });
    };

    Server.prototype.disconnect = function() {
        if(this === window) throw "Server: Please use new keyword.";
        if(!this.connected) throw "Server: Can't disconnect from server becuase you are not connected.";
        var Presence = database.ref("Presence");
        Presence.off("child_removed");
        Presence.off("child_added");
        Presence.off("child_changed");
        Presence = null;
        database.ref("Presence/" + this.id).remove();
        database.ref().off("child_changed");
        this.connected = false;
        if(typeof this.ondisconnect === 'function') this.ondisconnect();
    };

    Server.prototype.reconnect = function() {
        if(this === window) throw "Server: Please use new keyword.";
        if(this.connected) this.disconnect();
        if(!this.connected) this.connect();
    }
})(window,Math,firebase);