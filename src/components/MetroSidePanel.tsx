import React from "react";
import { MetroScene } from "./MetroScene";

const stations = ["Aluva", "Edapally", "M.G Road", "Vyttila", "Thripunithura"];

export function MetroSidePanel() {
  return (
    <div className="relative flex h-full w-full flex-col justify-end overflow-hidden bg-[#eaf4f6]">
      {/* 3D metro scene */}
      <div className="absolute inset-0">
        <MetroScene />
      </div>

      {/* Legibility gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy/85 via-navy/40 to-transparent" />

      <div className="relative z-10 max-w-md p-12">
        <div className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-brand" />
          KMRL IDMS
        </div>
        <h2 className="animate-fade-up text-balance text-3xl font-semibold leading-tight text-white md:text-4xl">
          KMRL Intelligent Document Management System
        </h2>
        <p className="animate-fade-up mt-3 max-w-sm text-pretty text-sm leading-relaxed text-white/80">
          Secure access to your documents, workflows, and AI-powered workspace.
        </p>

        <div className="animate-fade-up mt-6 flex flex-wrap gap-2">
          {stations.map((s) => (
            <span
              key={s}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
