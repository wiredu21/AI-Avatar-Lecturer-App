import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from '../ui/card';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '../ui/tabs';

const COURSES = [
  {
    id: 1,
    title: "Object-Oriented Programming",
    instructor: "Dr. James Wilson",
    duration: "12 weeks",
    active: true,
    materials: [
      {
        week: 1,
        title: "Introduction to OOP",
        description: "Learn the fundamental concepts of object-oriented programming.",
        resources: ["Lecture Slides", "Video Recording", "Practice Exercises"]
      },
      {
        week: 2,
        title: "Classes and Objects",
        description: "Understanding classes, objects, and their relationships.",
        resources: ["Lecture Slides", "Video Recording", "Practice Exercises"]
      },
      {
        week: 3,
        title: "Inheritance",
        description: "Exploring inheritance and its implementation in Java.",
        resources: ["Lecture Slides", "Video Recording", "Practice Exercises"]
      }
    ],
    assignments: [
      {
        id: 101,
        title: "Assignment 1: Creating Classes",
        dueDate: "October 15, 2023",
        actions: ["View Details", "Submit"]
      },
      {
        id: 102,
        title: "Assignment 2: Inheritance Implementation",
        dueDate: "November 5, 2023",
        actions: ["View Details", "Submit"]
      }
    ],
    discussions: [
      {
        id: 201,
        title: "Discussion: Best Practices in OOP",
        starter: "Dr. Wilson",
        replies: 24,
        action: "Join Discussion"
      },
      {
        id: 202,
        title: "Discussion: Design Patterns",
        starter: "Sarah Johnson",
        replies: 12,
        action: "Join Discussion"
      }
    ]
  },
  {
    id: 2,
    title: "Database Systems",
    instructor: "Dr. Lisa Chen",
    duration: "10 weeks",
    active: false,
    materials: [],
    assignments: [],
    discussions: []
  },
  {
    id: 3,
    title: "Web Development",
    instructor: "Prof. Michael Brown",
    duration: "14 weeks",
    active: false,
    materials: [],
    assignments: [],
    discussions: []
  },
  {
    id: 4,
    title: "Software Engineering",
    instructor: "Dr. Emily Davis",
    duration: "12 weeks",
    active: false,
    materials: [],
    assignments: [],
    discussions: []
  }
];

const Courses = () => {
  const [selectedCourse, setSelectedCourse] = useState(COURSES.find(course => course.active) || COURSES[0]);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Courses & Materials</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Course List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Your enrolled courses</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t">
                  {COURSES.map(course => (
                    <button 
                      key={course.id}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100 border-l-4 ${
                        selectedCourse.id === course.id ? 'border-purple-600' : 'border-transparent'
                      }`}
                      onClick={() => handleCourseSelect(course)}
                    >
                      {course.title}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Details */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>{selectedCourse.title}</CardTitle>
                <CardDescription>{selectedCourse.instructor} • {selectedCourse.duration}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="materials">
                  <TabsList className="mb-4">
                    <TabsTrigger value="materials">Course Materials</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="discussions">Discussions</TabsTrigger>
                  </TabsList>
                  
                  {/* Materials Tab */}
                  <TabsContent value="materials">
                    <div className="space-y-4">
                      {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
                        selectedCourse.materials.map((material, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h3 className="font-medium">Week {material.week}: {material.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {material.description}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {material.resources.map((resource, i) => (
                                <button key={i} className="text-sm text-teal-500 hover:underline">
                                  {resource}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-gray-500">
                          <p>No course materials available yet.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Assignments Tab */}
                  <TabsContent value="assignments">
                    <div className="space-y-4">
                      {selectedCourse.assignments && selectedCourse.assignments.length > 0 ? (
                        selectedCourse.assignments.map((assignment) => (
                          <div key={assignment.id} className="border rounded-lg p-4">
                            <h3 className="font-medium">{assignment.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">Due: {assignment.dueDate}</p>
                            <div className="flex gap-2 mt-2">
                              {assignment.actions.map((action, i) => (
                                <button key={i} className="text-sm text-teal-500 hover:underline">
                                  {action}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-gray-500">
                          <p>No assignments available yet.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Discussions Tab */}
                  <TabsContent value="discussions">
                    <div className="space-y-4">
                      {selectedCourse.discussions && selectedCourse.discussions.length > 0 ? (
                        selectedCourse.discussions.map((discussion) => (
                          <div key={discussion.id} className="border rounded-lg p-4">
                            <h3 className="font-medium">{discussion.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Started by {discussion.starter} • {discussion.replies} replies
                            </p>
                            <button className="text-sm text-teal-500 hover:underline mt-2">
                              {discussion.action}
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-gray-500">
                          <p>No discussions available yet.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Courses; 