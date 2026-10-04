import { Hero } from "@/components/sections/Hero";
import { ToolsStrip } from "@/components/sections/ToolsStrip";
import { Proof } from "@/components/sections/Proof";
import { Work } from "@/components/sections/Work";
import { WhatIDo } from "@/components/sections/WhatIDo";
import { Process } from "@/components/sections/Process";
import { Journey } from "@/components/sections/Journey";

export default function Home() {
  return (
    <>
      <Hero />
      <ToolsStrip />
      <Proof />
      <Work />
      <WhatIDo />
      <Process />
      <Journey />
    </>
  );
}
