import { CheckCircle2, ClockFading, Pill } from "lucide-react";
import Card from "./Card";

const statusColors = {
  low: ["bg-emerald-50", "border-emerald-400", "text-emerald-700"],
  medium: ["bg-sky-50", "border-sky-400", "text-sky-700"],
  high: ["bg-amber-50", "border-amber-400", "text-amber-700"],
  urgent: ["bg-rose-50", "border-rose-500", "text-rose-700"],
}

const typeIcons = {
  medication: Pill,
  lifestyle: CheckCircle2,
  "follow-up": ClockFading
}

export default function RecommendationCard({
  recommendation,
  description,
  priority,
  type,
  dueDate
}) {

  const Icon = typeIcons[type]

  return (
    <Card className="mt-5 text-left">
      <div className="flex justify-between">
        <div className="flex gap-3">
          <Icon />
          <h3 className="text-lg">{recommendation}</h3>
        </div>
        <div className="flex gap-2">
          <div className={
            "uppercase grid items-center justify-items-center rounded-full px-3 py-1 border text-xs " +
            statusColors[priority.toLowerCase()].join(" ")
          }>
            {priority}
          </div>
          <div className="grid items-center justify-items-center rounded-full px-3 py-1 uppercase border text-xs border-black">
            {type}
          </div>
        </div>
      </div>
      <p className="my-5 font-light text-sm">
        {description}
      </p>
      <div>
        <b>Due date: </b>
        <span>{new Date(dueDate).toLocaleDateString()}</span>
      </div>
    </Card>
  )
}