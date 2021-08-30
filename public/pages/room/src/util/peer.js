class PeerBuilder {
  constructor({ peerConfig }) {
    this.peerConfig = peerConfig;

    const defaultFunctionValue = () => {};
    this.onError = defaultFunctionValue;
    this.onCallReceived = defaultFunctionValue;
    this.onConnectionOpened = defaultFunctionValue;
    this.onPeerStreamReceived = defaultFunctionValue;
    this.onCallError = defaultFunctionValue;
    this.onCallClose = defaultFunctionValue;
  }

  setOnCallError(fn) {
    this.onCallError = fn;
    return this;
  }

  setOnCallClose(fn) {
    this.onCallClose = fn;
    return this;
  }

  setOnError(fn) {
    this.onError = fn;
    return this;
  }
  setOnCallReceived(fn) {
    this.onCallReceived = fn;
    return this;
  }

  setOnPeerStreamReceived(fn) {
    this.onPeerStreamReceived = fn;
    return this;
  }

  setOnConnectionOpened(fn) {
    this.onConnectionOpened = fn;
    return this;
  }

  _prepareCallEvent(call, returnAnswer) {
    call.on("stream", (stream) => this.onPeerStreamReceived(call, stream));
    call.on("error", (error) => this.onCallError(call, error));
    call.on("close", (_) => this.onCallClose(call));

    this.onCallReceived(call, returnAnswer);
  }

  _preparePeerCallInstanceFunction(peerModule) {
    class PeerCustomModule extends peerModule {}

    const peerCall = PeerCustomModule.prototype.call;
    const context = this;

    PeerCustomModule.prototype.call = function (
      id,
      stream,
      returnAnswer = true
    ) {
      const call = peerCall.apply(this, [id, stream]);

      console.log("calll", returnAnswer);
      context._prepareCallEvent(call, returnAnswer);

      return call;
    };

    return PeerCustomModule;
  }

  async build() {
    const PeerCustomInstance = this._preparePeerCallInstanceFunction(Peer);
    // const peer = new Peer(this.peerConfig.id, this.peerConfig.config);
    const peer = new PeerCustomInstance(
      this.peerConfig.id,
      this.peerConfig.config
    );

    peer.on("error", this.onError);
    peer.on("call", this._prepareCallEvent.bind(this));

    return new Promise((resolve) =>
      peer.on("open", (id) => {
        this.onConnectionOpened(peer);
        return resolve(peer);
      })
    );
  }
}
