import React, { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from "../ui/card";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "../ui/tabs";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const Settings = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(1);

  // Sample avatar data
  const avatars = [
    { id: 1, src: "/avatars/female1.png", alt: "Female Avatar 1" },
    { id: 2, src: "/avatars/female2.png", alt: "Female Avatar 2" },
    { id: 3, src: "/avatars/female3.png", alt: "Female Avatar 3" },
    { id: 4, src: "/avatars/female4.png", alt: "Female Avatar 4" },
    { id: 5, src: "/avatars/male1.png", alt: "Male Avatar 1" },
    { id: 6, src: "/avatars/male2.png", alt: "Male Avatar 2" },
    { id: 7, src: "/avatars/male3.png", alt: "Male Avatar 3" },
    { id: 8, src: "/avatars/male4.png", alt: "Male Avatar 4" },
  ];

  // Function to render select element since we don't have the Select component
  const renderSelect = (id, defaultValue, options) => (
    <select 
      id={id}
      defaultValue={defaultValue}
      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="avatar">AI Avatar</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="Sarah" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Johnson" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="sarah.johnson@student.northampton.ac.uk" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="university">University</Label>
                    {renderSelect("university", "northampton", [
                      { value: "northampton", label: "University of Northampton" },
                      { value: "nottingham", label: "Nottingham Trent University" },
                      { value: "birmingham", label: "Birmingham City University" },
                      { value: "coventry", label: "Coventry University" }
                    ])}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    {renderSelect("course", "cs", [
                      { value: "cs", label: "Computer Science" },
                      { value: "se", label: "Software Engineering" },
                      { value: "ds", label: "Data Science" },
                      { value: "ai", label: "Artificial Intelligence" }
                    ])}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    defaultValue="Computer Science student at the University of Northampton. Interested in web development and artificial intelligence."
                  />
                </div>
                <Button className="bg-teal-500 hover:bg-teal-600 text-white">Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Avatar Tab */}
          <TabsContent value="avatar">
            <Card>
              <CardHeader>
                <CardTitle>AI Avatar Customization</CardTitle>
                <CardDescription>Choose your preferred AI lecturer avatar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                        selectedAvatar === avatar.id ? "border-purple-600" : "border-transparent"
                      }`}
                      onClick={() => setSelectedAvatar(avatar.id)}
                    >
                      <img 
                        src={avatar.src} 
                        alt={avatar.alt} 
                        className="w-full h-auto" 
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150?text=Avatar";
                        }}
                      />
                      {selectedAvatar === avatar.id && (
                        <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="voice">Voice Type</Label>
                    {renderSelect("voice", "female", [
                      { value: "female", label: "Female" },
                      { value: "male", label: "Male" }
                    ])}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent">Accent</Label>
                    {renderSelect("accent", "british", [
                      { value: "british", label: "British" },
                      { value: "american", label: "American" },
                      { value: "australian", label: "Australian" },
                      { value: "indian", label: "Indian" }
                    ])}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="speed">Speaking Speed</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Slow</span>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2" 
                        step="0.1" 
                        defaultValue="1" 
                        className="flex-1" 
                      />
                      <span className="text-sm">Fast</span>
                    </div>
                  </div>

                  <Button className="bg-teal-500 hover:bg-teal-600 text-white">Save Avatar Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications about deadlines and updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sound Effects</h3>
                    <p className="text-sm text-gray-500">Play sound effects during interactions</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto-save Chats</h3>
                    <p className="text-sm text-gray-500">Automatically save your conversations with the AI</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  {renderSelect("language", "en", [
                    { value: "en", label: "English" },
                    { value: "fr", label: "French" },
                    { value: "es", label: "Spanish" },
                    { value: "de", label: "German" }
                  ])}
                </div>

                <Button className="bg-teal-500 hover:bg-teal-600 text-white">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button className="bg-teal-500 hover:bg-teal-600 text-white">Change Password</Button>

                <div className="border-t pt-6 mt-6">
                  <h3 className="font-medium text-lg mb-4">Danger Zone</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Export Data</h4>
                        <p className="text-sm text-gray-500">Download all your data</p>
                      </div>
                      <Button variant="outline" className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-100">
                        Export
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Delete Account</h4>
                        <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                      </div>
                      <Button className="bg-red-500 hover:bg-red-600 text-white">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings; 