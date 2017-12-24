import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

import Hive from "./Hive";
import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(<Hive />, document.getElementById("root"));
registerServiceWorker();
