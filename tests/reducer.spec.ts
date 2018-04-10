import { expect } from "chai";
import "mocha";
import { createRootReducer, createSubReducer } from "../src/index";

describe("Reducer", () => {

    it("subreducer.name shoold be correct", () => {
        interface IDrawer {
            open: boolean;
        }
        interface ICounter {
            count: number;
            drawer: IDrawer;
        }
        interface IRoot {
            counter: ICounter;
        }

        const counterReducer = createSubReducer<IRoot, ICounter>("counter");
        const rootReducer = createRootReducer<IRoot>();

        expect(counterReducer.name).to.equal("counter");
        expect(rootReducer.name).to.equal("@root");
    });

    it("subreducer.path shoold be correct", () => {
        interface IDrawer {
            open: boolean;
        }
        interface ICounter {
            count: number;
            drawer: IDrawer;
        }
        interface IRoot {
            counter: ICounter;
        }

        const drawerReducer = createSubReducer<ICounter, IDrawer>("drawer");
        const counterReducer = createSubReducer<IRoot, ICounter>("counter").join(drawerReducer);
        const rootReducer = createRootReducer<IRoot>().join(counterReducer);

        expect(drawerReducer.path).to.equal(`${counterReducer.path}.drawer`);
        expect(counterReducer.path).to.equal(`${rootReducer.path}.counter`);
        expect(rootReducer.path).to.equal(`@root`);
    });

    it("subreducer.reducer without join", () => {
        interface IRoot {
            count: number;
        }
        const initState: IRoot = {
            count: 1,
        };

        const rootReducer = createRootReducer<IRoot>(initState);
        const result = rootReducer.reducer(undefined, { type: "@INIT" });

        expect(result.count).to.equal(1);
    });

    it("subreducer.reducer with join correct", () => {
        interface IDrawer {
            open: boolean;
        }
        interface ICounter {
            count: number;
            drawer: IDrawer;
        }
        interface IRoot {
            counter: ICounter;
            message: string;
        }

        const drawerState: IDrawer = {
            open: true,
        };
        const counterState: Partial<ICounter> = {
            count: 1,
        };
        const rootState: Partial<IRoot> = {
            message: "test",
        };

        const drawerReducer = createSubReducer<ICounter, IDrawer>("drawer", drawerState);
        const counterReducer = createSubReducer<IRoot, ICounter>("counter", counterState).join(drawerReducer);
        const rootReducer = createRootReducer<IRoot>(rootState).join(counterReducer);

        const result = rootReducer.reducer(undefined, { type: "@INIT" });

        expect(result.counter.count).to.equal(1);
        expect(result.counter.drawer.open).to.equal(true);
        expect(result.message).to.equal("test");
    });

    it("subreducer.reducer with simple state (number, string)", () => {
        const rootReducer = createRootReducer<number>(1);

        const result = rootReducer.reducer(undefined, { type: "@INIT" });

        expect(result).to.equal(1);
    });

    it("subreducer.stateSelector is correct", () => {
        interface IDrawer {
            open: boolean;
        }
        interface ICounter {
            count: number;
            drawer: IDrawer;
        }
        interface IRoot {
            counter: ICounter;
            message: string;
        }

        const drawerState: IDrawer = {
            open: true,
        };
        const counterState: Partial<ICounter> = {
            count: 1,
        };
        const rootState: Partial<IRoot> = {
            message: "test",
        };

        const drawerReducer = createSubReducer<ICounter, IDrawer>("drawer", drawerState);
        const counterReducer = createSubReducer<IRoot, ICounter>("counter", counterState).join(drawerReducer);
        const rootReducer = createRootReducer<IRoot>(rootState).join(counterReducer);

        const result = rootReducer.reducer(undefined, { type: "@INIT" });

        expect(counterReducer.stateSelector(result).count).to.equal(1);
        expect(drawerReducer.stateSelector(result).open).to.equal(true);
        expect(result.message).to.equal("test");
    });
});
