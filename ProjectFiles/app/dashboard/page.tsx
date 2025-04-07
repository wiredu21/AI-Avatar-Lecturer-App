import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Bell, Calendar, FileText, Folder, AlertTriangle } from "lucide-react"
import { BarChart, PieChart } from "@/components/ui/chart"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-teal-500">Welcome back, Sarah!</h1>
          <p className="text-sm text-gray-500">University of Northampton • Computer Science • Year 2</p>
          <p className="text-xs text-gray-500">Last login: Today at 9:30 AM</p>
        </div>
        <div className="flex items-center">
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell className="h-6 w-6 text-purple-600" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Learning Progress Tracker (Left Column) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-purple-600">Study Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Object-Oriented Programming</span>
                <span className="font-medium">75%</span>
              </div>
              <Progress value={75} className="h-2 bg-gray-200" indicatorClassName="bg-teal-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database Systems</span>
                <span className="font-medium">60%</span>
              </div>
              <Progress value={60} className="h-2 bg-gray-200" indicatorClassName="bg-teal-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Web Development</span>
                <span className="font-medium">90%</span>
              </div>
              <Progress value={90} className="h-2 bg-gray-200" indicatorClassName="bg-teal-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Ethics</span>
                <span className="font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2 bg-gray-200" indicatorClassName="bg-teal-500" />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines (Center Column) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-purple-600">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Yesterday</span>
                </div>
                <p className="text-sm font-medium text-teal-500">Database Design Project</p>
                <p className="text-xs text-gray-500">Database Systems</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">In 2 days</span>
                </div>
                <p className="text-sm font-medium text-teal-500">AI Ethics Essay</p>
                <p className="text-xs text-gray-500">Computer Science</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">In 5 days</span>
                </div>
                <p className="text-sm font-medium text-teal-500">OOP Assignment 3</p>
                <p className="text-xs text-gray-500">Object-Oriented Programming</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">In 2 weeks</span>
                </div>
                <p className="text-sm font-medium text-teal-500">Web Development Final Project</p>
                <p className="text-xs text-gray-500">Web Development</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Materials (Right Column) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-purple-600">Saved Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg hover:bg-teal-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg mb-2">
                  <FileText className="h-5 w-5 text-teal-500" />
                </div>
                <p className="text-sm font-medium truncate">Lecture 1 Notes.pdf</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
              <div className="p-3 border rounded-lg hover:bg-teal-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg mb-2">
                  <FileText className="h-5 w-5 text-teal-500" />
                </div>
                <p className="text-sm font-medium truncate">OOP Principles.pdf</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
              <div className="p-3 border rounded-lg hover:bg-teal-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg mb-2">
                  <Folder className="h-5 w-5 text-teal-500" />
                </div>
                <p className="text-sm font-medium truncate">Tutorial Code.zip</p>
                <p className="text-xs text-gray-500">1 week ago</p>
              </div>
              <div className="p-3 border rounded-lg hover:bg-teal-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg mb-2">
                  <FileText className="h-5 w-5 text-teal-500" />
                </div>
                <p className="text-sm font-medium truncate">SQL Query Examples.pdf</p>
                <p className="text-xs text-gray-500">1 week ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Insights (Bottom Section) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-purple-600">Learning Insights</CardTitle>
          <CardDescription>Your learning patterns and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Weekly Study Hours</h3>
              <div className="h-[250px]">
                <BarChart
                  data={[
                    { name: "Mon", value: 2 },
                    { name: "Tue", value: 3 },
                    { name: "Wed", value: 1 },
                    { name: "Thu", value: 4 },
                    { name: "Fri", value: 2 },
                    { name: "Sat", value: 5 },
                    { name: "Sun", value: 3 },
                  ]}
                  index="name"
                  categories={["value"]}
                  colors={["#38B2AC"]}
                  valueFormatter={(value) => `${value}h`}
                  className="h-[250px]"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Topic Mastery</h3>
              <div className="h-[250px]">
                <PieChart
                  data={[
                    { name: "OOP", value: 40 },
                    { name: "Databases", value: 30 },
                    { name: "Web Dev", value: 20 },
                    { name: "AI Ethics", value: 10 },
                  ]}
                  index="name"
                  categories={["value"]}
                  colors={["#38B2AC", "#6D28D9", "#3B82F6", "#8B5CF6"]}
                  valueFormatter={(value) => `${value}%`}
                  className="h-[250px]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

