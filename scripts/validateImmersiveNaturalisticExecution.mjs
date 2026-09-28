import { readFile } from "node:fs/promises";
import { resolve, join } from "node:path";

const root = resolve(import.meta.dirname, "..");
const previous = join(root, "artifacts/immersive-structured-execution-v1-acceptance");
const current = join(root, "artifacts/immersive-naturalistic-execution-v1-acceptance");
const cases = ["A-cafe", "B-after-work-home", "C-weekend-walk", "D-bookstore"];
const text = async (base, name, file) => readFile(join(base, name, file), "utf8");
const json = async (base, name, file) => JSON.parse(await text(base, name, file));
const oldData = {};
const newData = {};
for (const name of cases) {
  oldData[name] = {
    state: await json(previous, name, "state-timeline.json"),
    takes: await json(previous, name, "take-plan.json"),
    events: await json(previous, name, "mandatory-visual-events.json"),
    final: await json(previous, name, "final-state.json"),
    script: await text(previous, name, "compiled-final-script.txt"),
  };
  newData[name] = {
    state: await json(current, name, "state-timeline.json"),
    takes: await json(current, name, "take-plan.json"),
    events: await json(current, name, "mandatory-visual-events.json"),
    final: await json(current, name, "final-state.json"),
    script: await text(current, name, "compiled-final-script.txt"),
  };
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const all = (fn) => cases.every((name) => fn(oldData[name], newData[name]));
const cafe = newData["A-cafe"];
const home = newData["B-after-work-home"];
const walk = newData["C-weekend-walk"];
const shop = newData["D-bookstore"];
const checks = [];
const check = (id, name, pass) => checks.push({ id, name, status: pass ? "PASS" : "FAIL" });

check("01", "adjacent non-stop moments have no body reset", walk.script.includes("[ONE CONTINUOUS ACTION FLOW]") && !/\bBODY:|MOMENT [1-5] ·/.test(walk.script));
check("02", "state order holds while physical actions overlap", home.script.includes("hand, torso, and weight may overlap without reversing the required event order") && home.events.map((e) => e.id).join(",") === "FIND_KEY,UNLOCK_DOOR,OPEN_DOOR,CROSS_THRESHOLD");
check("03", "mandatory transition does not create a pause", cafe.script.includes("It needs no dedicated shot, held pause") && cafe.state[2].after.facts["character.motion"] === "WALKING");
check("04", "mandatory transition does not create a camera setup", cafe.events.length > cafe.takes.length && cafe.script.includes("no dedicated shot") && !cafe.script.includes("dedicated camera setup"));
check("05", "product never changes the body action", all((_, n) => !n.script.includes("PRODUCT:") && n.script.includes("Product readability is incidental to the existing walk, turn, sit, or threshold crossing")));
check("06", "camera never recovers visibility for the product", all((_, n) => n.script.includes("Never recenter, rush, or recover the subject or product for visibility")));
check("07", "moment boundary alone never stops the walk", walk.takes.length === 1 && walk.state.every((m) => m.after.facts["character.motion"] === "WALKING") && !walk.script.includes("comes to a settled stop"));
check("08", "real structured stop survives the translation", shop.state[2].after.facts["character.motion"] === "STOPPED" && shop.script.includes("The last approaching step eases into this real stop") && shop.script.includes("MOMENT 3 · WINDOW STOP"));
check("09", "overlap keeps every mandatory visual transition", all((_, n) => n.events.every((event) => n.script.includes(event.statement))));
check("10", "final closure retains its state and prohibition", all((o, n) => same(o.final, n.final) && n.script.includes("Once this final state is reached, do not add a new task")));
check("11", "state timeline is identical", all((o, n) => same(o.state, n.state)));
check("12", "Take Plan is identical", all((o, n) => same(o.takes, n.takes)));
check("13", "four case inputs and mandatory events are identical", all((o, n) => same(o.events, n.events) && same(o.state[0].before, n.state[0].before) && o.script !== n.script));

const failures = checks.filter((item) => item.status === "FAIL");
console.log(JSON.stringify({ status: failures.length ? "FAIL" : "PASS", checks, failures }, null, 2));
if (failures.length) process.exitCode = 1;
