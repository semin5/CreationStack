import React from "react";
import { SearchingWrapper } from "./SearchingWrapper";
import "./Searching.css";

export const Searching = ({inputValue, setInputValue, setKeyword, setPage}) => {
  return (
    <SearchingWrapper
      className="searching-instance"
      inputValue={inputValue}
      setInputValue={setInputValue}
      setKeyword={setKeyword}
      setPage={setPage}
    />
  );
};
