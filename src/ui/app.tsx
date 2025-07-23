import { useState } from "preact/hooks";
import "./css/app.css";
import LevelDescriptor from "../levels/index.json" with { type: "json" };
import Canvas from "./components/Canvas.tsx";
import MainMenu from "./components/MainMenu.tsx";
import {
  CurrentLevelContext,
  LevelDescriptorContext,
} from "./contexts/LevelContext.ts";
import { entry } from "../states.ts";

export function App() {
  const [entryState, setEntryState] = useState<
    (typeof entry)[keyof typeof entry]
  >(entry.IN_MENU);
  const [level, setLevel] = useState<number>(1);

  return (
    <LevelDescriptorContext value={LevelDescriptor}>
      {entryState === entry.IN_MENU && (
        <MainMenu setState={setEntryState} setLevel={setLevel} />
      )}
      {entryState === entry.IN_GAME && (
        <CurrentLevelContext value={level}>
          <Canvas />
        </CurrentLevelContext>
      )}
    </LevelDescriptorContext>
  );
}
