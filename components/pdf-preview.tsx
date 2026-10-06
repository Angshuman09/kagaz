"use client";

import { FileText } from "lucide-react";

export const PdfPreview = ({ fileUrl }: { fileUrl: string }) => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300">
        <FileText size={40} strokeWidth={1.5} />

        <span className="text-[10px] font-semibold uppercase tracking-widest">
          PDF
        </span>
      </div>

      <iframe
        src={`${fileUrl}#page=1&toolbar=0&navpanes=0&statusbar=0`}
        title="PDF preview"
        loading="lazy"
        className="
          pointer-events-none
          absolute
          inset-0
          h-full
          w-full
          origin-center
          scale-[0.75]
          border-0
          bg-transparent
        "
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/70 to-transparent" />
    </div>
  );
};