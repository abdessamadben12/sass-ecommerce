import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildMatrix(year, month){
  const first = new Date(year, month, 1);
  const offset = first.getDay();
  let cursor = 1 - offset;
  const m = [];
  for(let r=0;r<6;r++){
    const row = [];
    for(let c=0;c<7;c++){
      const d = new Date(year, month, cursor);
      row.push({ date:d, current:d.getMonth()===month });
      cursor++;
    }
    m.push(row);
  }
  return m;
}
const fmt = d => d.toLocaleDateString("en-US", { month:"long", day:"2-digit", year:"numeric" });
export default function   CalendarRange({ initialMonth = new Date(), onApply }){
  const [cursor, setCursor] = useState(new Date(initialMonth.getFullYear(), initialMonth.getMonth()));
  const [{start, end}, setRange] = useState({ start:null, end:null });
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(()=>{
    const h = e => { if(open && ref.current && !ref.current.contains(e.target)) setOpen(false); };
    addEventListener("mousedown", h);
    return ()=> removeEventListener("mousedown", h);
  },[open]);

  const [matPrev, matNext] = useMemo(()=>[
    buildMatrix(cursor.getFullYear(), cursor.getMonth()),
    buildMatrix(cursor.getFullYear(), (cursor.getMonth()+1)%12)
  ], [cursor]);

  const pick = (date, current) => {
    if (!current) return;
    if (!start || (start && end)) {
      setRange({ start: date, end: null });
    } else {
      if (date < start) setRange({ start: date, end: start });
      else setRange({ start, end: date });
    }
  };

  const label = start && end ? `${fmt(start)} – ${fmt(end)}` : "Select range";
  const apply = () => { if(start && end){ onApply?.({start,end}); setOpen(false);} };

  const Day = ({info}) => {
    const { date, current } = info;
    const isStart = start && +date === +start;
    const isEnd   = end   && +date === +end;
    const inRange = start && end && date > start && date < end;
    const base = "flex items-center justify-center w-8 h-8 text-sm rounded-full transition duration-150";
    const cls = [
      base,
      current ? "text-gray-900" : "text-gray-400 opacity-50 cursor-default",
      current && "hover:bg-blue-100 cursor-pointer",
      current && inRange && "bg-blue-200 text-blue-800",
      current && isStart && "bg-blue-600 text-white",
      current && isEnd && "bg-blue-600 text-white",
      isStart && isEnd && "!rounded-full"
    ].filter(Boolean).join(" ");
    return (
      <button
        type="button"
        onClick={()=>pick(date,current)}
        className={cls}
        disabled={!current}
        aria-pressed={isStart||isEnd||inRange}
      >
        {date.getDate()}
      </button>
    );
  };

  return (
    <div className="relative inline-flex" ref={ref}>
        <div className="absolute z-50 mt-2 w-[720px] bg-white border border-gray-200 shadow-xl rounded-xl p-5 animate-fadeIn" role="dialog" aria-modal="true">
          <div className="flex justify-between gap-6">
            {[matPrev, matNext].map((m,idx)=>{
              const monthDate = new Date(cursor.getFullYear(), cursor.getMonth()+idx);
              return (
                <section key={idx} className="w-1/2 select-none">
                  <header className="flex items-center justify-between mb-3">
                    {idx===0 ? (
                      <button onClick={()=>setCursor(d=>new Date(d.getFullYear(), d.getMonth()-1))} className="p-1.5 rounded hover:bg-gray-100"><ChevronLeft size={18}/></button>
                    ) : <div className="w-5"/>}
                    <h3 className="font-medium text-sm text-gray-800">{MONTH_NAMES[monthDate.getMonth()]} {monthDate.getFullYear()}</h3>
                    {idx===1 ? (
                      <button onClick={()=>setCursor(d=>new Date(d.getFullYear(), d.getMonth()+1))} className="p-1.5 rounded hover:bg-gray-100"><ChevronRight size={18}/></button>
                    ) : <div className="w-5"/>}
                  </header>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {WEEK_DAYS.map(d=><div key={d} className="text-center text-gray-400 font-medium py-1">{d}</div>)}
                    {m.flat().map((info,i)=>(<Day key={i} info={info}/>))}
                  </div>
                </section>
              );
            })}
          </div>

          <footer className="mt-5 pt-3 border-t flex justify-between items-center">
            <span className="text-sm text-gray-600 truncate max-w-[60%]">{label}</span>
            <div className="flex gap-2">
              <button onClick={()=>setRange({start:null,end:null})} className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Clear</button>
              <button onClick={apply} disabled={!start||!end} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Apply</button>
            </div>
          </footer>
        </div>
    </div>
  );
}
