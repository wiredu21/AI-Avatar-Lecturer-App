import React from 'react';
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
import { BarChart, LineChart, PieChart } from '../ui/chart';

const Insights = () => {
  // Mock study time data
  const studyTimeData = [
    { name: "Mon", value: 2 },
    { name: "Tue", value: 3 },
    { name: "Wed", value: 1 },
    { name: "Thu", value: 4 },
    { name: "Fri", value: 2 },
    { name: "Sat", value: 5 },
    { name: "Sun", value: 3 }
  ];

  // Mock topic distribution data
  const topicData = [
    { name: "OOP", value: 40 },
    { name: "Databases", value: 30 },
    { name: "Web Dev", value: 20 },
    { name: "Other", value: 10 }
  ];

  // Mock AI interactions data
  const aiInteractionsData = [
    { date: "Oct 1", count: 5 },
    { date: "Oct 2", count: 8 },
    { date: "Oct 3", count: 12 },
    { date: "Oct 4", count: 7 },
    { date: "Oct 5", count: 15 },
    { date: "Oct 6", count: 10 },
    { date: "Oct 7", count: 13 }
  ];

  // Mock course progress data
  const courseProgress = [
    { course: "Object-Oriented Programming", progress: 75 },
    { course: "Database Systems", progress: 60 },
    { course: "Web Development", progress: 90 },
    { course: "Software Engineering", progress: 45 }
  ];

  // Mock activity data
  const activities = [
    {
      id: 1,
      type: "assignment",
      title: "Completed OOP Assignment 2",
      time: "Today at 2:30 PM",
      icon: "shield"
    },
    {
      id: 2,
      type: "chat",
      title: "Asked 5 questions to AI Lecturer",
      time: "Yesterday at 10:15 AM",
      icon: "message-square"
    },
    {
      id: 3,
      type: "study",
      title: "Studied Database Normalization",
      time: "2 days ago",
      icon: "book-open"
    }
  ];

  // Mock recommended topics
  const recommendedTopics = [
    {
      id: 1,
      title: "Design Patterns in OOP",
      description: "Learn about common design patterns to improve your object-oriented programming skills."
    },
    {
      id: 2,
      title: "Advanced SQL Queries",
      description: "Enhance your database skills with complex SQL queries and optimization techniques."
    },
    {
      id: 3,
      title: "Responsive Web Design",
      description: "Master the art of creating websites that work on any device and screen size."
    },
    {
      id: 4,
      title: "Testing and Debugging",
      description: "Learn effective strategies for testing and debugging your code."
    }
  ];

  // Function to render the appropriate icon based on activity type
  const renderActivityIcon = (type) => {
    switch (type) {
      case 'assignment':
        return (
          <div className="bg-teal-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
        );
      case 'chat':
        return (
          <div className="bg-purple-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        );
      case 'study':
        return (
          <div className="bg-blue-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Learning Insights</h1>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Study Time Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Study Time</CardTitle>
                  <CardDescription>Hours spent studying this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={studyTimeData}
                    index="name"
                    categories={["value"]}
                    colors={["#38B2AC"]}
                    valueFormatter={(value) => `${value}h`}
                    height={200}
                  />
                </CardContent>
              </Card>

              {/* Topic Distribution Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Topic Distribution</CardTitle>
                  <CardDescription>Topics you've studied</CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChart
                    data={topicData}
                    index="name"
                    categories={["value"]}
                    colors={["#38B2AC", "#6D28D9", "#3B82F6", "#6B7280"]}
                    valueFormatter={(value) => `${value}%`}
                    height={200}
                  />
                </CardContent>
              </Card>

              {/* AI Interactions Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">AI Interactions</CardTitle>
                  <CardDescription>Your conversations with AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={aiInteractionsData}
                    index="date"
                    categories={["count"]}
                    colors={["#6D28D9"]}
                    valueFormatter={(value) => `${value} msgs`}
                    height={200}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Your progress across all courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {courseProgress.map((course) => (
                    <div key={course.course}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{course.course}</span>
                        <span className="text-sm font-medium">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-teal-500 h-2.5 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your learning activities in the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-100">
                      {renderActivityIcon(activity.type)}
                      <div>
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Topics</CardTitle>
                <CardDescription>Based on your learning patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedTopics.map((topic) => (
                    <div key={topic.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <h3 className="font-medium">{topic.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {topic.description}
                      </p>
                      <button className="text-sm text-teal-500 hover:underline mt-2">Explore Topic</button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Insights; 