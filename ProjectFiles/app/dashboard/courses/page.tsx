import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CoursesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Courses & Materials</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Your enrolled courses</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t">
                <button className="w-full text-left px-4 py-3 hover:bg-gray-100 border-l-4 border-purple-600">
                  Object-Oriented Programming
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-100 border-l-4 border-transparent">
                  Database Systems
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-100 border-l-4 border-transparent">
                  Web Development
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-100 border-l-4 border-transparent">
                  Software Engineering
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Object-Oriented Programming</CardTitle>
              <CardDescription>Dr. James Wilson • 12 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="materials">
                <TabsList className="mb-4">
                  <TabsTrigger value="materials">Course Materials</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                  <TabsTrigger value="discussions">Discussions</TabsTrigger>
                </TabsList>
                <TabsContent value="materials">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium">Week 1: Introduction to OOP</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Learn the fundamental concepts of object-oriented programming.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button className="text-sm text-teal-500 hover:underline">Lecture Slides</button>
                        <button className="text-sm text-teal-500 hover:underline">Video Recording</button>
                        <button className="text-sm text-teal-500 hover:underline">Practice Exercises</button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium">Week 2: Classes and Objects</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Understanding classes, objects, and their relationships.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button className="text-sm text-teal-500 hover:underline">Lecture Slides</button>
                        <button className="text-sm text-teal-500 hover:underline">Video Recording</button>
                        <button className="text-sm text-teal-500 hover:underline">Practice Exercises</button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium">Week 3: Inheritance</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Exploring inheritance and its implementation in Java.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button className="text-sm text-teal-500 hover:underline">Lecture Slides</button>
                        <button className="text-sm text-teal-500 hover:underline">Video Recording</button>
                        <button className="text-sm text-teal-500 hover:underline">Practice Exercises</button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="assignments">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium">Assignment 1: Creating Classes</h3>
                      <p className="text-sm text-gray-500 mt-1">Due: October 15, 2023</p>
                      <div className="flex gap-2 mt-2">
                        <button className="text-sm text-teal-500 hover:underline">View Details</button>
                        <button className="text-sm text-teal-500 hover:underline">Submit</button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium">Assignment 2: Inheritance Implementation</h3>
                      <p className="text-sm text-gray-500 mt-1">Due: November 5, 2023</p>
                      <div className="flex gap-2 mt-2">
                        <button className="text-sm text-teal-500 hover:underline">View Details</button>
                        <button className="text-sm text-teal-500 hover:underline">Submit</button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="discussions">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium">Discussion: Best Practices in OOP</h3>
                      <p className="text-sm text-gray-500 mt-1">Started by Dr. Wilson • 24 replies</p>
                      <button className="text-sm text-teal-500 hover:underline mt-2">Join Discussion</button>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium">Discussion: Design Patterns</h3>
                      <p className="text-sm text-gray-500 mt-1">Started by Sarah Johnson • 12 replies</p>
                      <button className="text-sm text-teal-500 hover:underline mt-2">Join Discussion</button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

