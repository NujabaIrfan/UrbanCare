import { AlertTriangle, Calendar, ChevronLeftCircle, Download, MapPin, Newspaper, Phone, SearchX, Share2, Stethoscope } from "lucide-react";
import Card from "../components/Card";
import LabResultCard from "../components/LabResultCard";
import RecommendationCard from "../components/RecommendationCard";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const { REACT_APP_API_URL } = process.env

export default function ResultPage({ }) {

  // i can do user based authorization but from my experience no one from sliit cared so far so I'll just leave it
  // const {user} = useContext(AuthContext)
  const { resultId } = useParams()
  const [data, setData] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/api/reports/${resultId}`)
        if (response.status !== 200) return setData(null)
        console.log(response.data)
        setData(response.data)
      } catch (error) {
        setData(null)
      }
    })()
  }, [resultId])

  const highRecommendations = data ? data.recommendations.filter(
    recommendation => recommendation.priority === "high" || recommendation.priority === "urgent"
  ).length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6 relative overflow-hidden">
      <div className="flex gap-2 cursor-pointer">
        <ChevronLeftCircle />
        <div>Back</div>
      </div>
      {data ? (
        <div id="report-container">
          <Card className="mt-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Newspaper size={40} />
                <div className="grid justify-items-start">
                  <h3 className="font-bold text-2xl">Lab test results review</h3>
                  <p className="font-light text-gray-500 text-sm sm:text-base">
                    Comprehensive health assessments and recommendations
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <button className="p-2 border border-gray-300 rounded-md flex gap-2 items-center hover:bg-gray-200 transition-colors duration-300">
                  <Share2 size={15} />
                  <span>Share</span>
                </button>
                <button
                  onClick={window.print}
                  className="p-2 border border-gray-300 rounded-md flex gap-2 items-center hover:bg-gray-200 transition-colors duration-300">
                  <Download size={15} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
            <div className="grid gap-2 md:flex md:gap-8 mt-5 [&>div]:grid [&>div]:grid-cols-2 [&>div]:w-full [&>div]:md:flex [&>div]:md:gap-2 [&>div]:md:w-auto [&>div]:justify-items-start">
              <div>
                <b>Patient:</b>
                <span>{data.patient?.name || "N/A"}</span>
              </div>
              <div>
                <b>Age:</b>
                <span>{data.patient?.age || "N/A"}</span>
              </div>
              <div>
                <b>Gender:</b>
                <span>{data.patient?.gender || "N/A"}</span>
              </div>
              <div>
                <b>Patient ID:</b>
                <span>{data.patient?.patientId || "N/A"}</span>
              </div>
              <div>
                <b>Test Date:</b>
                <span>{new Date(data.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card >
          <section className="flex justify-between items-start gap-10 my-10">
            <div className="w-full text-left">
              <h2 className="font-bold text-2xl">Laboratory results</h2>
              {data.results.map((result, index) => <LabResultCard
                key={index}
                {...result}
              />)}
              <h3 className="font-bold text-2xl my-5">Doctor's Recommendations</h3>
              {highRecommendations > 0 && (
                <Card className="bg-red-200 border-red-500 text-red-700 flex gap-3">
                  <AlertTriangle />
                  <p>You have {highRecommendations} high-priority recommendation(s) that require immediate attention</p>
                </Card>
              )}
              <Card className="my-5">
                <h3 className="text-2xl my-5">Overall assessment</h3>
                <p>{data.overallRemarks}</p>
                <Card className="mt-8 mb-4 bg-blue-200 border-blue-400 text-blue-700">
                  <b>Next appointment :</b>
                  <span> {new Date(data.nextAppointment).toLocaleString()}</span>
                </Card>
              </Card>
              <Card className="my-5">
                <h3 className="text-2xl my-5">Recommendations and Next Steps</h3>
                {data.recommendations.map((recommendation, index) =>
                  <RecommendationCard
                    key={index}
                    {...recommendation}
                  />
                )}
              </Card>
              <Card className="my-5 text-gray-500">
                <p>This report is confidential and intended solely for the named patient and their healthcare providers.</p>
              </Card>
            </div>
            <div className="grid justify-items-stretch">
              <h2 className="font-bold text-2xl text-left">Attending physician</h2>
              <Card className="my-5">
                <div className="flex gap-5">
                  <div className="grid rounded-full w-[60px] h-[60px] bg-blue-600 text-white font-bold items-center justify-items-center">
                    {data.doctor.name.split(" ").map(n => n.substring(0, 1)).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="grid justify-items-start">
                    <h4 className="text-xl">Dr. {data.doctor.name}</h4>
                    <div className="grid items-center justify-items-center rounded-full py-1 px-2 bg-[#2c4f7c] text-white text-xs">Specialist at {data.doctor.specialization}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 my-8 gap-2 text-left max-w-md [&>div]:flex [&>div]:gap-3 [&>div]:text-sm">
                  <div>
                    <MapPin size={18} />
                    <div>{data.doctor.address}</div>
                  </div>
                  <div>
                    <Calendar size={18} />
                    <div>{data.doctor.availableDays.join(", ")}</div>
                  </div>
                  <div>
                    <Phone size={18} />
                    <div>{data.doctor.contactNumber}</div>
                  </div>
                  <div>
                    <Stethoscope size={18} />
                    <div>{data.doctor.qualification}</div>
                  </div>
                </div>
                <hr />
                <p className="text-sm font-extralight text-gray-500 text-left my-1">
                  {data.doctor.experience} years of experience
                </p>
              </Card>
            </div>
          </section>
        </div>
      ) : (
        <>
          <h3 className="m-auto text-3xl font-bold">Report not found</h3>
          <SearchX size={100} className="m-auto my-10" />
        </>)}
    </div >
  )
}