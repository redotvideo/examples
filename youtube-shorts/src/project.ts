import {makeProject} from '@revideo/core';
import example from './scenes/example?scene';
import metadata from './metadata.json'
import "./global.css";

export default makeProject({
  scenes: [example],
  variables: metadata
});
