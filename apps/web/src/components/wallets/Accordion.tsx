import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  q: string;
  a: React.ReactNode;
}

/** Accessible single-open accordion (button + region, aria-expanded, keyboard friendly by default). */
export const Accordion: React.FC<{ items: AccordionItem[]; defaultOpen?: number | null }> = ({ items, defaultOpen = null }) => {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const base = useId();

  return (
    <div className="divide-y divide-[#DFE8F5] overflow-hidden rounded-3xl border border-[#DFE8F5] bg-white shadow-card">
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${base}-b${i}`;
        const panelId = `${base}-p${i}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-[#10213A] transition-colors hover:bg-[#F7FAFF] focus-visible:bg-[#F7FAFF] sm:px-6 sm:text-base"
              >
                <span>{item.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-[#64748B] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#175CFF]' : ''}`} />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className="px-5 pb-5 text-sm leading-relaxed text-[#475569] sm:px-6"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
};
