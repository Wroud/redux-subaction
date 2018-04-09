import { expect } from "chai";
import "mocha";
import { createRootReducer, createSubReducer } from "./index";
describe("Reducer", () => {
    it("subreducer.name shoold be correct", () => {
        const counterReducer = createSubReducer("counter");
        const rootReducer = createRootReducer();
        expect(counterReducer.name).to.equal("counter");
        expect(rootReducer.name).to.equal("@root");
    });
    it("subreducer.path shoold be correct", () => {
        const drawerReducer = createSubReducer("drawer");
        const counterReducer = createSubReducer("counter").join(drawerReducer);
        const rootReducer = createRootReducer().join(counterReducer);
        expect(drawerReducer.path).to.equal(`${counterReducer.path}.drawer`);
        expect(counterReducer.path).to.equal(`${rootReducer.path}.counter`);
        expect(rootReducer.path).to.equal(`@root`);
    });
    it("subreducer.reducer without join", () => {
        const initState = {
            count: 1,
        };
        const rootReducer = createRootReducer(initState);
        const result = rootReducer.reducer(undefined, { type: "@INIT" });
        expect(result.count).to.equal(1);
    });
    it("subreducer.reducer with join correct", () => {
        const drawerState = {
            open: true,
        };
        const counterState = {
            count: 1,
        };
        const rootState = {
            message: "test",
        };
        const drawerReducer = createSubReducer("drawer", drawerState);
        const counterReducer = createSubReducer("counter", counterState).join(drawerReducer);
        const rootReducer = createRootReducer(rootState).join(counterReducer);
        const result = rootReducer.reducer(undefined, { type: "@INIT" });
        expect(result.counter.count).to.equal(1);
        expect(result.counter.drawer.open).to.equal(true);
        expect(result.message).to.equal("test");
    });
    it("subreducer.reducer with simple state (number, string)", () => {
        const rootReducer = createRootReducer(1);
        const result = rootReducer.reducer(undefined, { type: "@INIT" });
        expect(result).to.equal(1);
    });
    it("subreducer.stateSelector is correct", () => {
        const drawerState = {
            open: true,
        };
        const counterState = {
            count: 1,
        };
        const rootState = {
            message: "test",
        };
        const drawerReducer = createSubReducer("drawer", drawerState);
        const counterReducer = createSubReducer("counter", counterState).join(drawerReducer);
        const rootReducer = createRootReducer(rootState).join(counterReducer);
        const result = rootReducer.reducer(undefined, { type: "@INIT" });
        expect(counterReducer.stateSelector(result).count).to.equal(1);
        expect(drawerReducer.stateSelector(result).open).to.equal(true);
        expect(result.message).to.equal("test");
    });
});
