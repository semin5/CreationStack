import React, { useEffect, useState } from "react";
import { CreatorListSectionWrapper } from "./CreatorListSectionWrapper";
import { searchCreator } from "../../../../api/search";
import "./CreatorListSection.css";

export const CreatorListSection = ({creators}) => {
  return (
    <CreatorListSectionWrapper
      className="creator-list-section-instance"
      creators={creators}
    />
  );
};
