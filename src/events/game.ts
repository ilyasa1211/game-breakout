const GameOver = {
  LOSE: 0,
  WIN: 1,
};

export class GameOverEvent extends CustomEvent<
  (typeof GameOver)[keyof typeof GameOver]
> {
  public static readonly name = "game-over";
  public constructor() {
    super(GameOverEvent.name);
  }
}

export class GameStartEvent extends CustomEvent<void> {
  public static readonly name = "game-start";
  public constructor() {
    super(GameStartEvent.name);
  }
}

export class GameReadyEvent extends CustomEvent<void> {
  public static readonly name = "game-ready";
  public constructor() {
    super(GameReadyEvent.name);
  }
}
