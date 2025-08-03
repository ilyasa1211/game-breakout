import { render } from "preact";
import "./css/index.css";
import { App } from "./app.tsx";

render(<App />, document.getElementById("app") as HTMLDivElement);
