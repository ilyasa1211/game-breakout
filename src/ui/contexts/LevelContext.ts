import { createContext } from "preact";
import LevelDescriptor from "../../levels/metadata.json" with { type: "json" };

export const CurrentLevelContext = createContext<number>(1);
export const LevelDescriptorContext =
  createContext<typeof LevelDescriptor>(LevelDescriptor);
