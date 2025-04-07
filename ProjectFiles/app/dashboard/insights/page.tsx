import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/ui/chart"

export default function InsightsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Learning Insights</h1>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Study Time</CardTitle>
                <CardDescription>Hours spent studying this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
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
                    colors={["teal"]}
                    valueFormatter={(value) => `${value}h`}
                    className="h-[200px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Topic Distribution</CardTitle>
                <CardDescription>Topics you've studied</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <PieChart
                    data={[
                      { name: "OOP", value: 40 },
                      { name: "Databases", value: 30 },
                      { name: "Web Dev", value: 20 },
                      { name: "Other", value: 10 },
                    ]}
                    index="name"
                    categories={["value"]}
                    colors={["teal", "purple", "blue", "gray"]}
                    valueFormatter={(value) => `${value}%`}
                    className="h-[200px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">AI Interactions</CardTitle>
                <CardDescription>Your conversations with AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <LineChart
                    data={[
                      { date: "2023-10-01", count: 5 },
                      { date: "2023-10-02", count: 8 },
                      { date: "2023-10-03", count: 12 },
                      { date: "2023-10-04", count: 7 },
                      { date: "2023-10-05", count: 15 },
                      { date: "2023-10-06", count: 10 },
                      { date: "2023-10-07", count: 13 },
                    ]}
                    index="date"
                    categories={["count"]}
                    colors={["purple"]}
                    valueFormatter={(value) => `${value} msgs`}
                    className="h-[200px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Your progress across all courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Object-Oriented Programming</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Database Systems</span>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Web Development</span>
                    <span className="text-sm font-medium">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: "90%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Software Engineering</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your learning activities in the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-100">
                  <div className="bg-teal-100 p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-teal-500"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Completed OOP Assignment 2</h3>
                    <p className="text-sm text-gray-500">Today at 2:30 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-100">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-purple-500"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Asked 5 questions to AI Lecturer</h3>
                    <p className="text-sm text-gray-500">Yesterday at 10:15 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-100">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-500"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Studied Database Normalization</h3>
                    <p className="text-sm text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Topics</CardTitle>
              <CardDescription>Based on your learning patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium">Design Patterns in OOP</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Learn about common design patterns to improve your object-oriented programming skills.
                  </p>
                  <button className="text-sm text-teal-500 hover:underline mt-2">Explore Topic</button>
                </div>
                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium">Advanced SQL Queries</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Enhance your database skills with complex SQL queries and optimization techniques.
                  </p>
                  <button className="text-sm text-teal-500 hover:underline mt-2">Explore Topic</button>
                </div>
                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium">Responsive Web Design</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Master the art of creating websites that work on any device and screen size.
                  </p>
                  <button className="text-sm text-teal-500 hover:underline mt-2">Explore Topic</button>
                </div>
                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium">Testing and Debugging</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Learn effective strategies for testing and debugging your code.
                  </p>
                  <button className="text-sm text-teal-500 hover:underline mt-2">Explore Topic</button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

