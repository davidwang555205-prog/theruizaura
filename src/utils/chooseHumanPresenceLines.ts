import {
  chooseHumanRealismLines,
  type HumanRealismInput,
  type HumanRealismSelection
} from "./chooseHumanRealismLines";

export type HumanPresenceInput = HumanRealismInput;
export type HumanPresenceSelection = HumanRealismSelection;

export function chooseHumanPresenceLines(input: HumanPresenceInput): HumanPresenceSelection {
  return chooseHumanRealismLines(input);
}
