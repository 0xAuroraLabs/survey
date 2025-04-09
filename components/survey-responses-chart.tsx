"use client"

import { useEffect, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  defaults
} from 'chart.js'
import { Bar, Pie } from "react-chartjs-2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/lib/firebase"
import { collection, query, getDocs } from "firebase/firestore"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// Set default font
defaults.font.family = "'Inter', sans-serif"

interface SurveyResponse {
  id: string
  type?: string
  healthMonitoring: string
  locationTracking: string
  activityTracking: string
  feedingReminders: string
  environmentalSensors: string
  smartAlerts: string
  mobileAppIntegration: string
  budget: string
  recurringCosts: string
  trustLevel: string
  trustFactors: string[]
}

export function SurveyResponsesChart() {
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<"bar" | "pie">("bar")

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const responsesQuery = query(collection(db, "submissions"))
        const querySnapshot = await getDocs(responsesQuery)
        const responsesData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as SurveyResponse))
          .filter(response => response.type === "pet-survey")

        setResponses(responsesData)
      } catch (error) {
        console.error("Error fetching survey responses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResponses()
  }, [])

  const formatFeatureName = (name: string) => {
    return name
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatBudgetRange = (budget: string) => {
    switch (budget) {
      case "less-than-6000":
        return "Less than ₹6,000"
      case "6000-8000":
        return "₹6,000 - ₹8,000"
      case "8000-10000":
        return "₹8,000 - ₹10,000"
      case "more-than-10000":
        return "More than ₹10,000"
      default:
        return budget
    }
  }

  const featureData = {
    labels: [
      "Health Monitoring",
      "Location Tracking",
      "Activity Tracking",
      "Feeding Reminders",
      "Environmental Sensors",
      "Smart Alerts",
      "Mobile App Integration",
    ],
    datasets: [
      {
        label: "Average Rating",
        data: [
          responses.reduce((acc, r) => acc + parseInt(r.healthMonitoring), 0) / responses.length || 0,
          responses.reduce((acc, r) => acc + parseInt(r.locationTracking), 0) / responses.length || 0,
          responses.reduce((acc, r) => acc + parseInt(r.activityTracking), 0) / responses.length || 0,
          responses.reduce((acc, r) => acc + parseInt(r.feedingReminders), 0) / responses.length || 0,
          responses.reduce((acc, r) => acc + parseInt(r.environmentalSensors), 0) / responses.length || 0,
          responses.reduce((acc, r) => acc + parseInt(r.smartAlerts), 0) / responses.length || 0,
          responses.reduce((acc, r) => acc + parseInt(r.mobileAppIntegration), 0) / responses.length || 0,
        ],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  }

  const budgetData = {
    labels: [
      "Less than ₹6,000",
      "₹6,000 - ₹8,000",
      "₹8,000 - ₹10,000",
      "More than ₹10,000",
    ],
    datasets: [
      {
        data: [
          responses.filter(r => r.budget === "less-than-6000").length,
          responses.filter(r => r.budget === "6000-8000").length,
          responses.filter(r => r.budget === "8000-10000").length,
          responses.filter(r => r.budget === "more-than-10000").length,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.5)",
          "rgba(16, 185, 129, 0.5)",
          "rgba(245, 158, 11, 0.5)",
          "rgba(239, 68, 68, 0.5)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(245, 158, 11)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  }

  const FeatureBarChart = () => (
    <Bar data={featureData} options={barChartOptions} />
  )
  
  const FeaturePieChart = () => (
    <Pie data={featureData} options={pieChartOptions} />
  )
  
  const BudgetPieChart = () => (
    <Pie data={budgetData} options={pieChartOptions} />
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Survey Responses</CardTitle>
          <CardDescription>Analysis of survey responses</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Survey Responses</CardTitle>
        <CardDescription>Analysis of survey responses</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="features" className="space-y-4">
          <TabsList>
            <TabsTrigger value="features">Feature Ratings</TabsTrigger>
            <TabsTrigger value="budget">Budget Distribution</TabsTrigger>
          </TabsList>
          <TabsContent value="features" className="space-y-4">
            <div className="flex justify-end">
              <Tabs defaultValue="bar" className="w-[200px]">
                <TabsList>
                  <TabsTrigger 
                    value="bar" 
                    onClick={() => setChartType("bar")}
                  >
                    Bar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pie" 
                    onClick={() => setChartType("pie")}
                  >
                    Pie
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="chart-container">
              {chartType === "bar" ? <FeatureBarChart /> : <FeaturePieChart />}
            </div>
          </TabsContent>
          <TabsContent value="budget">
            <BudgetPieChart />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
