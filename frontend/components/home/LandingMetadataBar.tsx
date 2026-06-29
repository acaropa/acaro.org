"use client";

import { useEffect, useState } from "react";
import { defaultLandingSettings, getLandingSettings, LandingMetadataItem } from "@/lib/settings";

export function LandingMetadataBar() {
  const [items, setItems] = useState<LandingMetadataItem[]>(defaultLandingSettings.metadata);

  useEffect(() => {
    getLandingSettings().then(settings => setItems(settings.metadata.slice(0, 4)));
  }, []);

  return (
    <div className="w-full bg-[#120c08] py-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 gap-y-8 md:grid-cols-4">
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex flex-col items-center border-r border-white/10 even:border-r-0 md:border-r md:last:border-r-0">
              <span className="mb-1 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                {item.label}
              </span>
              <span className="text-center font-serif text-lg font-semibold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
