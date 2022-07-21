import ReactDOM from "react-dom";
import { App } from "./App"

const root = document.querySelector('#root') as any

if (!root) throw new Error("Root not found");

ReactDOM.render(<App />, root)