export default class Game {
    private rafId: number | null = null;

    public play(startTime: number) {
        const endTime = Date.now();
        const deltaTime = endTime - startTime;

        this.rafId = requestAnimationFrame(() => {
            this.play(Date.now())
        });
    }
}