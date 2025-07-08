import React from 'react'
import { getPriorityColor } from '../../utils/taskUtils'

export default function PriorityIndicator({ score }) {
  const color = getPriorityColor(score)
  return (
    <div className={`w-3 h-3 rounded-full ${color}`} title={score}></div>
  )
}
