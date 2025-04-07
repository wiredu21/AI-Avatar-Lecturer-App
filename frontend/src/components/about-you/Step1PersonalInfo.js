import React from "react";
import { motion } from "framer-motion";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Info, Calendar } from "lucide-react";
import { Controller } from "react-hook-form";

const countries = [
    { value: "uk", label: "United Kingdom", flag: "🇬🇧" },
    { value: "us", label: "United States", flag: "🇺🇸" },
    { value: "ca", label: "Canada", flag: "🇨🇦" },
    { value: "au", label: "Australia", flag: "🇦🇺" },
    { value: "in", label: "India", flag: "🇮🇳" },
    { value: "ng", label: "Nigeria", flag: "🇳🇬" },
    { value: "cn", label: "China", flag: "🇨🇳" },
    { value: "jp", label: "Japan", flag: "🇯🇵" },
    { value: "de", label: "Germany", flag: "🇩🇪" },
    { value: "fr", label: "France", flag: "🇫🇷" },
];

const Step1PersonalInfo = ({ control, register, errors }) => {
    return (
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>

            {/* First Name */}
            <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    {...register("firstName", { required: "First name is required" })}
                    className={errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
            </div>

            {/* Surname */}
            <div className="space-y-2">
                <Label htmlFor="surname">Surname</Label>
                <Input
                    id="surname"
                    placeholder="Enter your surname"
                    {...register("surname", { required: "Surname is required" })}
                    className={errors.surname ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.surname && <p className="text-sm text-red-500">{errors.surname.message}</p>}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="relative">
                    <Input
                        id="dateOfBirth"
                        type="date"
                        {...register("dateOfBirth", { required: "Date of birth is required" })}
                        className={`${errors.dateOfBirth ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    <Calendar
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={18}
                    />
                </div>
                {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Controller
                    name="gender"
                    control={control}
                    rules={{ required: "Please select your gender" }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className={errors.gender ? "border-red-500 focus-visible:ring-red-500" : ""}>
                                <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
            </div>

            {/* Nationality */}
            <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Controller
                    name="nationality"
                    control={control}
                    rules={{ required: "Please select your nationality" }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger
                                className={errors.nationality ? "border-red-500 focus-visible:ring-red-500" : ""}
                            >
                                <SelectValue placeholder="Select your nationality" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((country) => (
                                    <SelectItem key={country.value} value={country.value}>
                                        <span className="flex items-center">
                                            <span className="mr-2">{country.flag}</span>
                                            {country.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.nationality && <p className="text-sm text-red-500">{errors.nationality.message}</p>}
            </div>

            {/* Academic Level */}
            <div className="space-y-2">
                <div className="flex items-center">
                    <Label htmlFor="academicLevel">Academic Level</Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="ml-2 h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>We use your academic level to tailor course content.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Controller
                    name="academicLevel"
                    control={control}
                    rules={{ required: "Please select your academic level" }}
                    render={({ field }) => (
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="undergraduate" id="undergraduate" />
                                <Label htmlFor="undergraduate">Undergraduate</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="postgraduate" id="postgraduate" />
                                <Label htmlFor="postgraduate">Postgraduate</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="phd" id="phd" />
                                <Label htmlFor="phd">PhD</Label>
                            </div>
                        </RadioGroup>
                    )}
                />
                {errors.academicLevel && <p className="text-sm text-red-500">{errors.academicLevel.message}</p>}
            </div>

            <p className="text-xs text-gray-500 mt-4">
                We comply with GDPR. Your data is encrypted and never shared.
            </p>
        </motion.div>
    );
};

export default Step1PersonalInfo; 