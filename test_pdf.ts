import React from "react";
import { renderToFile } from "@react-pdf/renderer";
import { pdfReport } from "./packages/database/src/pdf-report";
import { existsSync } from "fs";

async function main() {
  console.log("Gujarati font exists?", existsSync("packages/core/fonts/NotoSansGujarati-Regular.ttf"));
  const stream = await pdfReport({
    id: "test",
    participantName: "નામ",
    age: 25,
    submittedAt: new Date(),
    scoreM: 10,
    scoreA: 10,
    scoreS: 10,
    scoreT: 10,
    primaryType: "M",
    secondaryType: "A",
    sequence: "M-A-S-T",
    center: { name: "Ahmedabad East", zone: { name: "Nikol" } }
  });
  
  // renderToFile doesn't exist directly for the stream, but we can use React-PDF's Node API
  // Let's just require it.
}
main();
