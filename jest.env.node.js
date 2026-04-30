// Custom Jest environment extending node that injects Node 18+ fetch API globals.
// jest-environment-node creates a vm.createContext() sandbox that does not
// automatically inherit globalThis.Response, Request, etc. even when they
// exist on the outer Node.js global. This environment copies them in.
const { TestEnvironment } = require("jest-environment-node");

class NodeFetchEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();
    if (typeof this.global.Response === "undefined") {
      // globalThis here is the outer Node.js scope, NOT the sandbox
      this.global.Response = globalThis.Response;
      this.global.Request = globalThis.Request;
      this.global.Headers = globalThis.Headers;
      this.global.FormData = globalThis.FormData;
      this.global.File = globalThis.File;
      this.global.Blob = globalThis.Blob;
      this.global.fetch = globalThis.fetch;
    }
  }
}

module.exports = NodeFetchEnvironment;
