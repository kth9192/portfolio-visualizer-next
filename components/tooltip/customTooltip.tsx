import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

interface CustomTooltipProps{
trigger:React.ReactNode,
content:React.ReactNode
}

function CustomTooltip({trigger,content}:CustomTooltipProps) {
  return (
    <Tooltip>
        <TooltipTrigger>
            {trigger}
        </TooltipTrigger>
        <TooltipContent>
           <div>{content}</div>
        </TooltipContent>
    </Tooltip>
  )
}

export default CustomTooltip