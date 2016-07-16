/**
 * Created by plter on 7/13/16.
 */

(()=> {

    const http = require("http");
    const express = require("express");
    const socket = require("socket.io");

    const Config = com.plter.smd.server.Config;

    class Server extends com.plter.smd.share.ca.CommandHandler {

        constructor(ca) {
            super(ca);

            this._running = false;
            this._jqSelf = $(this);
        }

        isRunning() {
            return this._running;
        }

        start() {
            if (!this.isRunning()) {

                //http server
                this.app = express();
                this.httpServer = http.createServer(this.app);
                this.httpServer.listen(Config.SERVER_PORT, ()=> {
                    this._running = true;
                    this._jqSelf.trigger(Server.EventTypes.START);
                });
                this.httpServer.on("error", ()=> {
                    this._jqSelf.trigger(Server.EventTypes.ERROR);
                });

                this.app.use(express.static("./static"));

                //socket server
                this._io = socket(this.httpServer);
                this._io.on("connection", (sock)=> {
                    new com.plter.smd.server.net.SocketClient(this.getCommandAdapter(), sock);
                });
            }
        }

        stop() {
            if (this.isRunning()) {
                this.httpServer.close(()=> {
                    this._running = false;
                    this._jqSelf.trigger(Server.EventTypes.CLOSE);
                });
            }
        }
    }

    Server.EventTypes = {
        START: "start",
        ERROR: "error",
        CLOSE: "close"
    };

    com.plter.smd.server.net.Server = Server;
})();