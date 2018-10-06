const DatArchiveWeb = require('@sammacbeth/dat-archive-web');
const TCPTransport = require('@sammacbeth/discovery-swarm/webext/tcp-transport');
const LanDiscovery = require('@sammacbeth/discovery-swarm/webext/service-discovery');
const PeerDiscovery = require('@sammacbeth/discovery-swarm/web/peer-discovery');
const resolveName = require('./dns');
const Swarm = require('./network');

const swarmConfig = {
  debug: true,
  sparse: true,
  introducers: [
    new LanDiscovery({ announce: true }),
    new PeerDiscovery('https://discovery-server-xtvckisgjh.now.sh'),
  ],
  transport: {
    tcp: new TCPTransport(),
  },
}

const swarm = new Swarm(swarmConfig);
swarm.listen();
window.addEventListener('unload', () => {
  swarm.destroy();
});

const DefaultManager = DatArchiveWeb.DefaultManager;

class Manager extends DefaultManager {
  constructor(library) {
    super();
    this.port = 443;
    this.library = library;
  }

  async getStorage(key, secretKey) {
    return this.library.getStorage(key, secretKey);
  }

  onAddArchive(key, secretKey, options) {
    console.log('add archive', key, secretKey, options);
  }

  replicate (key) {
  }

  async resolveName(url) {
    return resolveName(url);
  }

  construct(args) {
    return new DatArchive(args);
  }

}

class DatArchive extends DatArchiveWeb {
  _replicate () {
    swarm.add(this._archive);
  }

  static async resolveName(url) {
    return resolveName(url);
  }

  close() {
    this.closed = true;
    swarm.remove(this._archive);
    this._archive.close();
  }
}

module.exports = {
  DatArchive,
  initManager: (library) => {
    const manager = new Manager(library);
    DatArchive.setManager(manager);
  }
};