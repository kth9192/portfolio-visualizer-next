import React from 'react'
import { twMerge } from 'tailwind-merge'

interface CustomSpinnerProps{
    className?: string
}

function CustomSpinner({className}: CustomSpinnerProps) {
  return (
    <div className={twMerge("bg-primary rounded-full animate-spin", className)}>

        <div className="bg-primary/30 rounded-full"></div>
    </div>
  )
}

export default CustomSpinner