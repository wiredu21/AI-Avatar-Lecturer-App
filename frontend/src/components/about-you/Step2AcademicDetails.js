import React from "react";
import { motion } from "framer-motion";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Controller } from "react-hook-form";

const universities = [
    { value: "oxford", label: "University of Oxford" },
    { value: "cambridge", label: "University of Cambridge" },
    { value: "imperial", label: "Imperial College London" },
    { value: "ucl", label: "University College London" },
    { value: "lse", label: "London School of Economics" },
    { value: "edinburgh", label: "University of Edinburgh" },
    { value: "manchester", label: "University of Manchester" },
    { value: "bristol", label: "University of Bristol" },
    { value: "warwick", label: "University of Warwick" },
    { value: "glasgow", label: "University of Glasgow" },
];

const courses = {
    oxford: [
        { value: "computer-science", label: "Computer Science" },
        { value: "mathematics", label: "Mathematics" },
        { value: "physics", label: "Physics" },
        { value: "engineering", label: "Engineering" },
        { value: "chemistry", label: "Chemistry" },
    ],
    cambridge: [
        { value: "computer-science", label: "Computer Science" },
        { value: "mathematics", label: "Mathematics" },
        { value: "physics", label: "Physics" },
        { value: "engineering", label: "Engineering" },
        { value: "chemistry", label: "Chemistry" },
    ],
    imperial: [
        { value: "computer-science", label: "Computer Science" },
        { value: "mathematics", label: "Mathematics" },
        { value: "physics", label: "Physics" },
        { value: "engineering", label: "Engineering" },
        { value: "chemistry", label: "Chemistry" },
    ],
    ucl: [
        { value: "computer-science", label: "Computer Science" },
        { value: "mathematics", label: "Mathematics" },
        { value: "physics", label: "Physics" },
        { value: "engineering", label: "Engineering" },
        { value: "chemistry", label: "Chemistry" },
    ],
    lse: [
        { value: "economics", label: "Economics" },
        { value: "management", label: "Management" },
        { value: "finance", label: "Finance" },
        { value: "accounting", label: "Accounting" },
        { value: "law", label: "Law" },
    ],
    edinburgh: [
        { value: "computer-science", label: "Computer Science" },
        { value: "mathematics", label: "Mathematics" },
        { value: "physics", label: "Physics" },
        { value: "engineering", label: "Engineering" },
        { value: "chemistry", label: "Chemistry" },
    ],
    manchester: [
        { value: "computer-science", label: "Computer Science" },
        { value: "mathematics", label: "Mathematics" },
        { value: "physics", label: "Physics" },
        { value: "engineering", label: "Engineering" },
        { value: "chemistry", label: "Chemistry" },
    ],
    bristol: [
        { value: "computer-science", label: "Computer Science" },
        { value: "mathematics", label: "Mathematics" },
        { value: "physics", label: "Physics" },
        { value: "engineering", label: "Engineering" },
        { value: "chemistry", label: "Chemistry" },
    ],
    warwick: [
        { value: "computer-science", label: "Computer Science" },
        { value: "mathematics", label: "Mathematics" },
        { value: "physics", label: "Physics" },
        { value: "engineering", label: "Engineering" },
        { value: "chemistry", label: "Chemistry" },
    ],
    glasgow: [
        { value: "computer-science", label: "Computer Science" },
        { value: "mathematics", label: "Mathematics" },
        { value: "physics", label: "Physics" },
        { value: "engineering", label: "Engineering" },
        { value: "chemistry", label: "Chemistry" },
    ],
};

const Step2AcademicDetails = ({ control, watch, errors }) => {
    const selectedUniversity = watch("university");

    return (
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <h2 className="text-xl font-semibold text-gray-800">Academic Details</h2>

            {/* University Selection */}
            <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Controller
                    name="university"
                    control={control}
                    rules={{ required: "Please select your university" }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className={errors.university ? "border-red-500 focus-visible:ring-red-500" : ""}>
                                <SelectValue placeholder="Select your university" />
                            </SelectTrigger>
                            <SelectContent>
                                {universities.map((university) => (
                                    <SelectItem key={university.value} value={university.value}>
                                        {university.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.university && <p className="text-sm text-red-500">{errors.university.message}</p>}
            </div>

            {/* Course Selection */}
            <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Controller
                    name="course"
                    control={control}
                    rules={{ required: "Please select your course" }}
                    render={({ field }) => (
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!selectedUniversity}
                        >
                            <SelectTrigger className={errors.course ? "border-red-500 focus-visible:ring-red-500" : ""}>
                                <SelectValue placeholder="Select your course" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedUniversity &&
                                    courses[selectedUniversity].map((course) => (
                                        <SelectItem key={course.value} value={course.value}>
                                            {course.label}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.course && <p className="text-sm text-red-500">{errors.course.message}</p>}
            </div>
        </motion.div>
    );
};

export default Step2AcademicDetails; 