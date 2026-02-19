import React from "react";
import Card from "./card";
import { useISO_42001ComplianceTracking } from "./provider";
export default function List() {
  const { list } = useISO_42001ComplianceTracking();
  return (
    <>
      {list.map((ele) => {
        return <Card {...ele} key={ele.label} />;
      })}
    </>
  );
}
