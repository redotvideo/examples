import { makeProject } from "@revideo/core";

import basic3D from "./scenes/basic3D?scene";
import "./global.css";

export default makeProject({
  scenes: [basic3D],
});
