import { GameOverStatus } from "../enums.ts";

export class GameOverEvent<
  T = (typeof GameOverStatus)[keyof typeof GameOverStatus],
> extends CustomEvent<T> {
  public static readonly name = "game-over";
  private readonly status;

  public constructor(detail: T) {
    super(GameOverEvent.name, {
      detail,
    });

    this.status = detail;
  }

  public isWin(): boolean {
    return this.status === GameOverStatus.WIN;
  }

  public isLose(): boolean {
    return this.status === GameOverStatus.LOSE;
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
