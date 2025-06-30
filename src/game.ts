export default class Game {
    private rafId: number | null = null;
    private lastTime: number = 0;

    private play(now: number) {
        if (this.lastTime === 0) this.lastTime = now;

        const deltaTime = now - this.lastTime;
        this.lastTime = now;

        

        this.rafId = requestAnimationFrame(this.play);
    }

    public start() {
        this.rafId = requestAnimationFrame(this.play);
    }
}