import { Newspaper, Trash } from "lucide-react";
import Card from "../components/Card";
import { useContext, useState } from "react";
import LabResultCard from "../components/LabResultCard";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import { redirect, useLocation, useNavigate } from "react-router-dom";

const resultBody = {
  name: "",
  result: "",
  unit: "",
  severity: "normal",
  recommendedRange: "",
  remarks: "",
}

const recommendationsBody = {
  recommendation: "",
  type: "",
  priority: "low",
  dueDate: new Date()
}


function TestResultForm({ index, data, setData }) {

  const updateResultField = (name, value) => {
    setData((prev) => {
      const updatedResults = [...prev.results]
      updatedResults[index] = { ...updatedResults[index], [name]: value }
      return { ...prev, results: updatedResults }
    })
  }

  return (
    <Card className="my-5 relative">
      <div className="flex justify-end">
        <button
          type="button"
          className="text-red-500 hover:text-red-600 transition-colors"
        >
          <Trash className="w-5 h-5" />
        </button>
      </div>
      <form className="space-y-4">
        <div>
          <label htmlFor="testName" className="block text-sm font-medium text-gray-700 mb-1">
            Test name
          </label>
          <input
            type="text"
            id="testName"
            placeholder="Enter test name"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.results[index].name}
            onChange={(evt) => updateResultField("name", evt.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
              Result
            </label>
            <input
              type="number"
              id="value"
              placeholder="Enter result"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={data.results[index].result}
              onChange={(evt) => updateResultField("result", evt.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              id="unit"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={data.results[index].unit}
              onChange={(evt) => updateResultField("unit", evt.target.value)}
              required
            >
              <option value="ng/dL">ng/dL</option>
              <option value="mg/dL">mg/dL</option>
              <option value="g/dL">g/dL</option>
              <option value="mmol/L">mmol/L</option>
              <option value="μIU/mL">μIU/mL</option>
              <option value="x10⁶/μL">x10⁶/μL</option>
            </select>
          </div>
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              id="severity"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={data.results[index].severity}
              onChange={(evt) => updateResultField("severity", evt.target.value)}
              required
            >
              <option value="normal">normal</option>
              <option value="low">low</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="range" className="block text-sm font-medium text-gray-700 mb-1">
            Recommended range
          </label>
          <input
            type="text"
            id="range"
            placeholder="e.g. 70–110 mg/dL"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.results[index].recommendedRange}
            onChange={(evt) => updateResultField("recommendedRange", evt.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
            Remarks
          </label>
          <textarea
            id="remarks"
            placeholder="Add any additional notes or findings"
            rows="3"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.results[index].remarks}
            onChange={(evt) => updateResultField("remarks", evt.target.value)}
            required
          ></textarea>
        </div>

      </form>
    </Card>
  )
}

function RecommendationForm({ index, data, setData }) {

  const updateRecommendationField = (name, value) => {
    setData((prev) => {
      const updatedRecommendations = [...prev.recommendations]
      updatedRecommendations[index] = { ...updatedRecommendations[index], [name]: value }
      return { ...prev, recommendations: updatedRecommendations }
    })
  }


  return (
    <Card className="mt-5">
      <div className="flex justify-end">
        <button
          type="button"
          className="text-red-500 hover:text-red-600 transition-colors"
        >
          <Trash className="w-5 h-5" />
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="recommendation" className="block text-sm font-medium text-gray-700 mb-1">
            Recommendation
          </label>
          <input
            type="text"
            id="recommendation"
            placeholder="Enter recommendation"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.recommendations[index].recommendation}
            onChange={(evt) => updateRecommendationField("recommendation", evt.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Recommendation type
          </label>
          <select
            id="type"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.recommendations[index].type}
            onChange={(evt) => updateRecommendationField("type", evt.target.value)}
            required
          >
            <option value="">Select one</option>
            <option value="medication">Medication</option>
            <option value="follow-up">Follow-up</option>
            <option value="lifestyle">Lifestyle</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.recommendations[index].priority}
            onChange={(evt) => updateRecommendationField("priority", evt.target.value)}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due date
          </label>
          <input
            type="date"
            id="dueDate"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.recommendations[index].dueDate}
            onChange={(evt) => updateRecommendationField("dueDate", evt.target.value)}
            required
          />
        </div>
      </div>
    </Card>
  )
}

export default function CreateResults({ }) {
  const { user } = useContext(AuthContext)
  const { state } = useLocation()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    overallRemarks: "",
    nextAppointment: new Date(),
    results: [resultBody],
    recommendations: [recommendationsBody],
    patient: state.email,
    doctor: ""
  })

  const submit = async (evt) => {
    const form = evt.target;
    if (!form.checkValidity()) {
      return
    }

    if (!user.email) return alert("You need to log in")

    evt.preventDefault()
    try {
      const response = await axios.post("http://localhost:5000/api/reports", {
        ...data,
        doctor: user.email,
      })

      if (response.status === 201) {
        navigate(`/results/${response.data.id}`)
      }
    } catch (error) {
      console.error("Error creating report:", error)
    }

  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6 relative overflow-hidden">
      <Card className="mt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Newspaper size={40} />
            <div className="grid justify-items-start">
              <h3 className="font-bold text-2xl">Lab test results review</h3>
            </div>
          </div>
          <div className="grid gap-2 md:flex md:gap-8 mt-5 [&>div]:grid [&>div]:grid-cols-2 [&>div]:w-full [&>div]:md:flex [&>div]:md:gap-2 [&>div]:md:w-auto [&>div]:justify-items-start">
            <div>
              <b>Patient email:</b>
              <input
                type="email"
                id="email"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={data.patient}
                onChange={(evt) => setData(value => ({ ...value, patient: evt.target.value }))}
                required
              />
            </div>
          </div>
        </div>
      </Card>
      <section className="text-left my-5">
        {step === 1 && (
          <>
            <h3 className="text-2xl">Lab test results</h3>
            {data.results.map((result, index) => <TestResultForm
              key={index}
              index={index}
              data={data}
              setData={setData}
              {...result}
            />)}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-300 transition-colors duration-300"
                onClick={() => setData(originalData => ({
                  ...originalData,
                  results: [...originalData.results, resultBody]
                }))}
              >
                Add another result
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                onClick={() => setStep((value) => value + 1)}
              >
                Proceed
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <div className="flex justify-between gap-5 items-start">
            <Card className="flex-grow my-5">
              <div className="grid">
                <div>
                  <label htmlFor="assessment" className="block text-sm font-medium text-gray-700 mb-1">
                    Overall assessment
                  </label>
                  <textarea
                    id="assessment"
                    placeholder="Summarize the patient's overall condition and findings"
                    rows="3"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={data.overallRemarks}
                    onChange={(evt) => setData(value => ({ ...value, overallRemarks: evt.target.value }))}
                    required
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="nextAppointment" className="block text-sm font-medium text-gray-700 mb-1">
                    Next appointment
                  </label>
                  <input
                    type="datetime-local"
                    id="nextAppointment"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={data.nextAppointment}
                    onChange={(evt) => setData(value => ({ ...value, nextAppointment: evt.target.value }))}
                    required
                  />
                </div>
              </div>
              <hr className="my-5" />
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations & Next Steps</h3>
              {data.recommendations.map((recommendation, index) => <RecommendationForm
                key={index}
                index={index}
                data={data}
                setData={setData}
                {...recommendation}
              />)}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-300 transition-colors duration-300"
                  onClick={() => setData((originalData) => ({
                    ...originalData,
                    recommendations: [...originalData.recommendations, recommendationsBody]
                  }))}
                >
                  Add another result
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                  onClick={submit}
                >
                  Submit
                </button>
              </div>
            </Card>
            <div>
              <div>
                {data.results.map((result, index) => <LabResultCard
                  key={index}
                  {...result}
                />)}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}