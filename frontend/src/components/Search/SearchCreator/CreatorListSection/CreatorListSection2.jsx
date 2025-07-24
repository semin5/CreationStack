import React, { useEffect, useState } from "react";
import { CreatorListSectionWrapper2 } from "./CreatorListSectionWrapper2";
import { searchCreator } from "../../../../api/search";
import "./CreatorListSection2.css";

export const CreatorListSection2 = ({creators}) => {
    console.log(creators);
  return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">이 크리에이터 어떠신가요?</h2>
        </div>
       <CreatorListSectionWrapper2
      className="creator-list-section-instance"
      creators={creators}
    />
      </div>
    );
};
