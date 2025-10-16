import { useContext, useState } from "react"
import { AuthContext } from "../context/authContext"
import axios from "axios"
import Card from "../components/Card"
import { CalendarDays, Newspaper, Stethoscope } from "lucide-react"
import { Link } from "react-router-dom"

export default function ResultsPage() {

  const { user } = useContext(AuthContext)
  const [reports, setReports] = useState([])

  useState(() => {
    (async () => {
      const response = await axios.get("http://localhost:5000/api/reports?email=" + encodeURIComponent(user.email))
      const result = response.data
      if (response.status == 200) setReports(result)
    })()
  }, [user.email])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6 relative overflow-hidden">
      {reports.map((report, index) => (
        <Card key={index} className="mb-4">
          <div className="flex justify-between">
            <div className="flex gap-3 items-end mb-2">
              <h3 className="text-lg font-semibold">
                Report #{index + 1}
              </h3>
              <span className="text-sm text-gray-500 font-light">
                ({new Date(report.updatedAt).toLocaleDateString()})
              </span>
            </div>
            <span className="text-xs text-gray-500 flex gap-3 items-center">
              <CalendarDays size={15} />
              <div>
                Next appointment: {new Date(report.nextAppointment).toLocaleDateString()}
              </div>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700 flex gap-3 items-center">
              <Stethoscope size={15} />
              <span className="font-medium">{report.doctor}</span>
            </p>
            <div className="flex items-center gap-3">
              <Link
                to={`/results/${report._id}`}
                className="py-2 px-5 font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex gap-3 items-center">
                <Newspaper size={18} />
                <div>
                  View report
                </div>
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}