import { createContext } from "preact";
import LevelDescriptor from "../../levels/level.metadata.json";

export const CurrentLevelContext = createContext<number>(1);
export const LevelDescriptorContext =
  createContext<typeof LevelDescriptor>(LevelDescriptor);
