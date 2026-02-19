import React from "react";
import Card from "./card";
import { useEUComplianceTracking } from "./provider";
export default function List() {
  const { list } = useEUComplianceTracking();
  return (
    <>
      {list.map((ele) => {
        return <Card {...ele} key={ele.label} />;
      })}
    </>
  );
}
