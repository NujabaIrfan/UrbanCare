import { AlertTriangle, ArrowDown, ArrowUp, CircleCheckBig } from "lucide-react";
import Card from "./Card";

const statusColors = {
  normal: ["bg-green-100", "border-green-500", "text-green-700"],
  low: ["bg-blue-100", "border-blue-400", "text-blue-700"],
  high: ["bg-orange-100", "border-orange-500", "text-orange-700"],
  critical: ["bg-red-100", "border-red-500", "text-red-700"]
}

const statusIcons = {
  normal: CircleCheckBig,
  low: ArrowDown,
  high: ArrowUp,
  critical: AlertTriangle
}

export default function LabResultCard({
  name,
  severity,
  result,
  unit,
  recommendedRange,
  remarks
}) {

  const Icon = statusIcons[severity]

  return (
    <Card className="mt-5 text-left">
      <div className="flex justify-between">
        <h3 className="text-xl">{name}</h3>
        <div className={
          "grid items-center justify-items-center rounded-full px-3 py-1 uppercase border text-xs "
          + (statusColors[severity.toLowerCase()].join(" "))
        }>
          <div className="flex items-center gap-1">
            <Icon size={14} />
            <div>{severity}</div>
          </div>
        </div>
      </div>
      <div className="flex mt-3 gap-2 items-baseline">
        <span className="font-bold text-3xl">{result}</span>
        <span className="font-light">{unit}</span>
      </div>
      <div className="text-gray-500 font-light text-sm">Recommended range: {recommendedRange}</div>
      <hr className="my-3"/>
      <p className="font-light">{remarks}</p>
    </Card>
  )
}