import { ChevronRight } from "lucide-react";

export default function CardDeposit({ title, value, icon, link, border, bgColor }) {
  const content = (
    <div className={`bg-white p-6 ${border} hover:bg-gray-100 border-l-[1px] border-b-[1px] border-gray-200 cursor-pointer`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${bgColor}`}>
            {icon}
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-gray-600">{value}</p>
            <p className="text-gray-500 text-sm mb-1">{title}</p>
          </div>
        </div>
        <div>
          <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
        </div>
      </div>
    </div>
  );

  if (!link) {
    return content;
  }

  return (
    <a href={link} className="">
      {content}
    </a>
  );
}
