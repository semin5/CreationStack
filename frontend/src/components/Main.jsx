import React from "react";
import styles from "../styles/layout.module.css";

const Main = ({ children }) => (
  <main className={styles.main}>
    {children}
  </main>
);

export default Main;