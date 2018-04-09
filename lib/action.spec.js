"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var index_1 = require("./index");
describe("Action", function () {
    it("createAction() creates object with type", function () {
        var action = index_1.createAction();
        chai_1.expect(action).to.have.property("type");
    });
    it("createAction(description, from) creates action with meta", function () {
        var action = index_1.createAction("description", "from");
        var _a = index_1.getActionMeta(action), metaAction = _a.action, description = _a.description, from = _a.from;
        chai_1.expect(metaAction).to.equal(action);
        chai_1.expect(description).to.equal("description");
        chai_1.expect(from).to.equal("from");
    });
});
//# sourceMappingURL=action.spec.js.map