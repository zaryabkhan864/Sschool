import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './i18n';
import 'dayjs/locale/tr'
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import './index.css';
import { Provider } from "react-redux";
import { store } from "./redux/store";

// 👇 NEW: registers dayjs's relativeTime plugin app-wide, so any
// dayjs(...).fromNow() call (e.g. Comment.jsx's comment timestamps)
// works without crashing. Must come after all imports (ESLint import/first).
dayjs.extend(relativeTime);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);