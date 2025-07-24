import React from "react";
import { CreatorSearchingWrapper } from "./CreatorSearchingWrapper";
import "./CreatorSearching.css";

export const CreatorSearching = ({
  inputValue,
  setInputValue,
  setKeyword,
  setPage,
}) => {
  return (
    <CreatorSearchingWrapper
      className="creator-searching-section"
      inputValue={inputValue}
      setInputValue={setInputValue}
      setKeyword={setKeyword}
      setPage={setPage}
    />
  );
};
