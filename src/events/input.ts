export class KeyDownEvent extends CustomEvent<KeyboardEvent> {
  public static readonly name = "keydown";

  public constructor(ev: KeyboardEvent) {
    super(KeyDownEvent.name, {
      detail: ev,
    });
  }
}

export class KeyUpEvent extends CustomEvent<KeyboardEvent> {
  public static readonly name = "keyup";

  public constructor(ev: KeyboardEvent) {
    super(KeyUpEvent.name, {
      detail: ev,
    });
  }
}
