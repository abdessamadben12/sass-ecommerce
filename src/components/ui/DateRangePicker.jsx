import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, X } from 'lucide-react';
import CalendarRange from './Calendar';





const DateRangePicker = ({
  strokePeriods,
  searchCallback,
  NotIcon,
  onChange,
  containerClassName = "p-6 max-w-lg",
}) => {
  const [periodOptions, setPeriodOptions] = useState([
    { name: "Today", value: [new Date(), new Date()] },
    { name: "Yesterday", value: [new Date(Date.now() - 86400000), new Date(Date.now() - 86400000)] },
    { name: "Last 7 Days", value: [new Date(Date.now() - 6 * 86400000), new Date()] },
    { name: "Last 15 Days", value: [new Date(Date.now() - 14 * 86400000), new Date()] },
    { name: "Last 30 Days", value: [new Date(Date.now() - 29 * 86400000), new Date()] },
    { name: "This Month", value: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()] },
  ]);
  const [showList, setShowList] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const containerRef = useRef(null);
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  

  const formatPeriodDisplay = (selected) => {
    if (!selected) return "";
    if (selected.type === "preset") return selected.name;
    if (selected.type === "custom" && selected.value)
      return `${formatDate(selected.value[0])} | ${formatDate(selected.value[1])}`;
    return "";
  };
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowList(false);
        setShowCalendar(false);
      }
    };
    if (showList || showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showList, showCalendar]);

  const handleCalendarApply = ({ start, end }) => {
    setSelectedPeriod({ type: "custom", value: [start, end] });
    strokePeriods(start, end);
    console.log("handleCalendarApply")
    console.log(start, end)
    onChange && onChange({ start, end });

    setShowCalendar(false);
    setShowList(false);
  };
  const clearSelection = () => {
    setSelectedPeriod(null);
  };

  return (
    <div className={containerClassName}>
      <div className="relative" ref={containerRef}>
        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm">
          <input
            type="text"
            readOnly
            value={formatPeriodDisplay(selectedPeriod)}
            placeholder="Select Date Range"
            onClick={() => setShowList((prev) => !prev)}
            className="w-full  py-2.5 pl-4 pr-10 text-sm text-gray-700 placeholder-gray-400 focus:outline-none rounded-l-lg"
          />
          {selectedPeriod && (
            <button
              onClick={clearSelection}
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X size={16} />
            </button>
          )}
          {!NotIcon && (
            <SearchIcon onClick={() => {
              searchCallback(selectedPeriod);
            }} className="w-10 h-full p-2 cursor-pointer bg-[#008ECC] text-white rounded-r-lg" />
          )}
        </div>

        {/* Preset List */}
        {showList && (
          <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-30">
            <ul className="max-h-64 overflow-auto text-sm py-1">
              {periodOptions.map((option, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSelectedPeriod({ type: "preset", name: option.name, value: option.value });
                    strokePeriods(option.value[0], option.value[1]);
                    setShowList(false);
                    setShowCalendar(false);
                  }}
                  className="px-4 py-2 hover:bg-[#008ECC] hover:text-white cursor-pointer"
                >
                  {option.name}
                </li>
              ))}
              <li
                onClick={() => {
                  setShowCalendar(true);
                  setShowList(false);
                }}
                className="px-4 py-2 hover:bg-[#008ECC] hover:text-white cursor-pointer"
              >
                Custom range...
              </li>
            </ul>
          </div>
        )}

        {/* Calendar */}
        {showCalendar && (
          <div className="absolute z-40 mt-2 bg-white rounded-lg shadow-xl left-0">
            <CalendarRange onApply={handleCalendarApply} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
