import { Newspaper, Trash } from "lucide-react";
import Card from "../components/Card";
import { useState } from "react";
import LabResultCard from "../components/LabResultCard";

const labResults = [
  {
    testType: "Blood Glucose (Fasting)",
    status: "normal",
    value: 92,
    unit: "mg/dL",
    recommendedRange: "70 – 100 mg/dL",
    remarks: "Your fasting blood sugar level is within the healthy range."
  },
  {
    testType: "Cholesterol",
    status: "high",
    value: 245,
    unit: "mg/dL",
    recommendedRange: "< 200 mg/dL",
    remarks: "High cholesterol levels detected. Consider dietary adjustments."
  },
  {
    testType: "Hemoglobin",
    status: "low",
    value: 11.2,
    unit: "g/dL",
    recommendedRange: "13.5 – 17.5 g/dL (male)",
    remarks: "Slightly low hemoglobin; may indicate anemia or low iron intake."
  },
  {
    testType: "Vitamin D",
    status: "critical",
    value: 18,
    unit: "ng/mL",
    recommendedRange: "30 – 100 ng/mL",
    remarks: "Vitamin D deficiency. Sun exposure or supplements may help."
  },
]


function TestResultForm({ }) {
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
            />
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              id="unit"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>ng/dL</option>
              <option>mg/dL</option>
              <option>g/dL</option>
              <option>mmol/L</option>
              <option>μIU/mL</option>
              <option>x10⁶/μL</option>
            </select>
          </div>
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              id="severity"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>normal</option>
              <option>high</option>
              <option>low</option>
              <option>critical</option>
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
          ></textarea>
        </div>

      </form>
    </Card>
  )
}

function RecommendationForm({ }) {
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
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Recommendation type
          </label>
          <select
            id="type"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Medication</option>
            <option>Follow-up</option>
            <option>Lifestyle</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
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
          />
        </div>
      </div>
    </Card>
  )
}

export default function CreateResults({ }) {

  const [step, setStep] = useState(1)
  const [testResults, setTestResults] = useState([{}])
  const [recommendations, setRecommendations] = useState([{}])

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
              <b>Patient:</b>
              <span>John Doe</span>
            </div>
            <div>
              <b>Age:</b>
              <span>30</span>
            </div>
            <div>
              <b>Gender:</b>
              <span>Male</span>
            </div>
            <div>
              <b>Patient ID:</b>
              <span>7 2004 2004</span>
            </div>
          </div>
        </div>
      </Card>
      <section className="text-left my-5">
        {step === 1 && (
          <>
            <h3 className="text-2xl">Lab test results</h3>
            {testResults.map((result, index) => <TestResultForm key={index} />)}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-300 transition-colors duration-300"
                onClick={() => setTestResults([...testResults, {}])}
              >
                Add another result
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                onClick={() => setStep(value => value + 1)}
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
                  />
                </div>
              </div>
              <hr className="my-5" />
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations & Next Steps</h3>
              {recommendations.map((recommendation, index) => <RecommendationForm key={index} {...recommendation} />)}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-300 transition-colors duration-300"
                  onClick={() => setRecommendations([...recommendations, {}])}
                >
                  Add another result
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                  onClick={() => setStep(value => value + 1)}
                >
                  Proceed
                </button>
              </div>
            </Card>
            <div>
              <div>
                {labResults.map((result, index) => <LabResultCard key={index} {...result} />)}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}