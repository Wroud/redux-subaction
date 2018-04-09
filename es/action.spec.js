import { expect } from "chai";
import "mocha";
import { createAction, getActionMeta } from "./index";
describe("Action", () => {
    it("createAction() creates object with type", () => {
        const action = createAction();
        expect(action).to.have.property("type");
    });
    it("createAction(description, from) creates action with meta", () => {
        const action = createAction("description", "from");
        const { action: metaAction, description, from } = getActionMeta(action);
        expect(metaAction).to.equal(action);
        expect(description).to.equal("description");
        expect(from).to.equal("from");
    });
});
