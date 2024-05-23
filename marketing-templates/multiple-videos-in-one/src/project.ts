import {makeProject} from '@revideo/core';

import example from './scenes/example?scene';


export default makeProject({
  scenes: [example],
  variables: { backgroundColor: "#FDCFE5", texts: ["gift cards", "discounts", "+ more!!"]} // ["gift cards", "discounts", "+ more!!"] ["events", "special offers", "and more..."]
});
