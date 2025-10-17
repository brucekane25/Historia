"use client";
import React, { useEffect, useState } from "react";

const VisitorCounter = () => {
  const [visits, setvisits] = useState(null);
  useEffect(() => {
    fetch("/api/mapDb", {
      method: "POST",
      body: JSON.stringify({ pathName: window.location.pathname }),
    })
      .then((res) => 
         res.json()
      )
      .then((data) => {
        if (data?.success) setvisits(data.total);
        else console.error("Visitor API error:", data);
      })
      .catch((err) => console.error("Visitor API fetch failed:", err));
  }, []);

  return (
    <div className="fixed z-[999999999999] hidden bottom-2 left-2 bg-black text-white p-2 rounded">
      {" "}
      Visits: {visits ?? "..."}
    </div>
  );
};

export default VisitorCounter;
