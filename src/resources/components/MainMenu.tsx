import {
  type Dispatch,
  type StateUpdater,
  useCallback,
  useContext,
  useState,
} from "preact/hooks";
import { entry } from "../../states.ts";
import { LevelDescriptorContext } from "../contexts/LevelContext.ts";

export default function MainMenu(props: {
  setState: Dispatch<StateUpdater<(typeof entry)[keyof typeof entry]>>;
  setLevel: Dispatch<StateUpdater<number>>;
}) {
  const { setLevel, setState } = props;

  const [isLevelSelection, setIsLevelSelection] = useState<boolean>(false);
  const levelDescriptor = useContext(LevelDescriptorContext);

  const showLevelSelection = useCallback((e: MouseEvent) => {
    setIsLevelSelection(true);
  }, []);

  const handleSelectLevel = useCallback((level: number) => {
    setLevel(level);
    setState(entry.IN_GAME);
  }, []);

  return (
    <>
      <h1>Welcome to Breakout!</h1>
      <button type="button" onClick={showLevelSelection}>
        Play
      </button>
      {isLevelSelection &&
        levelDescriptor.map((level) => (
          <button
            type="button"
            key={level.path}
            onClick={() => handleSelectLevel(level.level)}
          >
            <div>Level {level.level}</div>
          </button>
        ))}
      {/* <div>Setting</div> */}
      {/* <div>Custom Level</div> */}
    </>
  );
}
