import { useRef, useEffect, useState } from 'react';

const CELLS = Array.from({ length: 48 }, (_, i) => i);

export const BeforeAfterSlider = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      if (el) {
        rectRef.current = el.getBoundingClientRect();
      }
    });
    observer.observe(el);
    rectRef.current = el.getBoundingClientRect();

    const handleScroll = () => {
      if (el) {
        rectRef.current = el.getBoundingClientRect();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    let isPointerDown = false;

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDown || !rectRef.current) return;
      const rect = rectRef.current;
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    };

    const handlePointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      el.setPointerCapture(e.pointerId);
      if (!rectRef.current) return;
      const rect = rectRef.current;
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    };

    const handlePointerUp = (e: PointerEvent) => {
      isPointerDown = false;
      el.releasePointerCapture(e.pointerId);
    };

    el.addEventListener('pointermove', handlePointerMove, { passive: true });
    el.addEventListener('pointerdown', handlePointerDown, { passive: true });
    el.addEventListener('pointerup', handlePointerUp, { passive: true });
    el.addEventListener('pointerleave', handlePointerUp, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('pointerleave', handlePointerUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-[2rem] overflow-hidden cursor-ew-resize select-none bg-white shadow-2xl border border-gray-200 dark:border-white/10 group"

      style={{ touchAction: 'pan-y' }}
    >
      {/* Before Image (Messy Spreadsheet) */}
      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4 md:p-8">
         <div className="w-full h-full bg-white dark:bg-gray-900 shadow-sm border border-gray-300 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 flex items-center px-2 gap-1 overflow-hidden">
               {['File', 'Edit', 'View', 'Insert', 'Format', 'Data'].map(m => <div key={m} className="px-2 py-0.5 text-[10px] text-gray-600 dark:text-gray-400">{m}</div>)}
            </div>
            <div className="flex-1 grid grid-cols-6 grid-rows-8 gap-px bg-gray-300 dark:bg-gray-700 p-px">
               {CELLS.map((i) => (
                  <div key={i} className={`bg-white dark:bg-gray-900 p-1 md:p-2 text-[8px] md:text-[10px] text-gray-500 font-mono truncate ${i%6===0 ? 'font-bold bg-gray-50 dark:bg-gray-800' : ''}`}>
                     {i===0?'ID' : i===1?'Student' : i===2?'Date' : i===3?'Hours' : i===4?'Rate' : i===5?'Paid?' : (i%6===0 ? i/6 : i%6===5 ? (i%3===0 ? 'NO' : 'YES') : `Data ${i}`)}
                  </div>
               ))}
            </div>
         </div>
         <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm transform -rotate-3 transition-transform group-hover:scale-110">Chaotic Spreadsheet</div>
      </div>

      {/* After Image (Vellor Dashboard) */}
      <div
         className="absolute inset-0 bg-white dark:bg-primary-dark overflow-hidden flex items-center justify-center p-4 md:p-8"
         style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      >
         <div className="w-full h-full bg-gray-50 dark:bg-primary border border-gray-200 dark:border-white/10 rounded-xl shadow-xl flex flex-col overflow-hidden">
             <img src="/dashboard.png" alt="Vellor OS Dashboard" className="w-full h-full object-cover object-left-top" loading="lazy" decoding="async" />
         </div>
         <div className="absolute top-6 right-6 bg-accent text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm transform rotate-3 transition-transform group-hover:scale-110">Vellor OS</div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-12 flex items-center justify-center -ml-6 z-10"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="w-1.5 h-full bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center">
           <div className="w-12 h-12 bg-white rounded-full shadow-2xl border-2 border-gray-200 flex items-center justify-center text-accent ring-4 ring-white/50 backdrop-blur-md transition-transform active:scale-95 group-hover:scale-110 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 rotate-90 text-gray-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
              </svg>
           </div>
        </div>
      </div>
      {/* Accessible range input for crawlers and touch devices */}
      <input type="range" min="0" max="100" value={sliderPos} onChange={(e) => setSliderPos(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-50 focus:outline-none" aria-label="Compare messy spreadsheet with Vellor dashboard" />
    </div>
  );
};
