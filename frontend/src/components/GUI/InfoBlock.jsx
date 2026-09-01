import React from 'react'

const InfoBlock = ({ label, value }) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase font-bold text-ink-400 tracking-wider">
        {label}
      </span>
      <span className="text-[13px] font-medium text-ink-900">
        {value || "—"}
      </span>
    </div>
  )
}

export default InfoBlock
