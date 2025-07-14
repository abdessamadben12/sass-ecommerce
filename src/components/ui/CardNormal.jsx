import React from 'react'

export default function CardNormal({title,bgCard,icon,handlClick}) {
  return (
    <div onClick={handlClick} className={`${bgCard} shadow flex justify-center w-full gap-1 items-center rounded p-2 hover:shadow-lg
     cursor-pointer transition delay-700 transform hover:-translate-y-2 hover:scale-105 ease-in-out `}>
       <span>{icon}</span>
       <span className='text-xl p-3 font-semibold text-white'>{title}</span>
    </div>
  )
}
