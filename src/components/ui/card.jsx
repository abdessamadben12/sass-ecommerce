import { ChevronRight,  } from "lucide-react";
import { Link } from "react-router-dom";

export default function Card({title, value, icon, borderColor, bgColor,link,border,bgCard}) {
    return (
     <Link href={link} >
    <div className={`${bgCard ? bgCard :" bg-white"}    p-6 shadow-sm ${border} ${borderColor} hover:shadow-md transition-shadow cursor-pointer`}>
     <div className="flex justify-between items-center ">
     <div className="flex items-center gap-4">
     <div className={`p-3 rounded-lg ${bgColor} `}>
        {icon}
         </div>
         <div>
           <p className="text-gray-500 text-sm mb-1 ">{title}</p>
           <p className="text-2xl font-bold text-gray-600">{value}</p>
         </div>
     </div>
         <div>
         <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
       </div>
       </div>
     </div>
</Link>
    )
}