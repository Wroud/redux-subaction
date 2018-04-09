"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var index_1 = require("./index");
describe("Reducer", function () {
    it("subreducer.name shoold be correct", function () {
        var counterReducer = index_1.createSubReducer("counter");
        var rootReducer = index_1.createRootReducer();
        chai_1.expect(counterReducer.name).to.equal("counter");
        chai_1.expect(rootReducer.name).to.equal("@root");
    });
    it("subreducer.path shoold be correct", function () {
        var drawerReducer = index_1.createSubReducer("drawer");
        var counterReducer = index_1.createSubReducer("counter").join(drawerReducer);
        var rootReducer = index_1.createRootReducer().join(counterReducer);
        chai_1.expect(drawerReducer.path).to.equal(counterReducer.path + ".drawer");
        chai_1.expect(counterReducer.path).to.equal(rootReducer.path + ".counter");
        chai_1.expect(rootReducer.path).to.equal("@root");
    });
    it("subreducer.reducer without join", function () {
        var initState = {
            count: 1,
        };
        var rootReducer = index_1.createRootReducer(initState);
        var result = rootReducer.reducer(undefined, { type: "@INIT" });
        chai_1.expect(result.count).to.equal(1);
    });
    it("subreducer.reducer with join correct", function () {
        var drawerState = {
            open: true,
        };
        var counterState = {
            count: 1,
        };
        var rootState = {
            message: "test",
        };
        var drawerReducer = index_1.createSubReducer("drawer", drawerState);
        var counterReducer = index_1.createSubReducer("counter", counterState).join(drawerReducer);
        var rootReducer = index_1.createRootReducer(rootState).join(counterReducer);
        var result = rootReducer.reducer(undefined, { type: "@INIT" });
        chai_1.expect(result.counter.count).to.equal(1);
        chai_1.expect(result.counter.drawer.open).to.equal(true);
        chai_1.expect(result.message).to.equal("test");
    });
    it("subreducer.reducer with simple state (number, string)", function () {
        var rootReducer = index_1.createRootReducer(1);
        var result = rootReducer.reducer(undefined, { type: "@INIT" });
        chai_1.expect(result).to.equal(1);
    });
    it("subreducer.stateSelector is correct", function () {
        var drawerState = {
            open: true,
        };
        var counterState = {
            count: 1,
        };
        var rootState = {
            message: "test",
        };
        var drawerReducer = index_1.createSubReducer("drawer", drawerState);
        var counterReducer = index_1.createSubReducer("counter", counterState).join(drawerReducer);
        var rootReducer = index_1.createRootReducer(rootState).join(counterReducer);
        var result = rootReducer.reducer(undefined, { type: "@INIT" });
        chai_1.expect(counterReducer.stateSelector(result).count).to.equal(1);
        chai_1.expect(drawerReducer.stateSelector(result).open).to.equal(true);
        chai_1.expect(result.message).to.equal("test");
    });
});
//# sourceMappingURL=reducer.spec.js.map