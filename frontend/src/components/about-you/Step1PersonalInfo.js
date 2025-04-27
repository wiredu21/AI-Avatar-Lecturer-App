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
    { value: "af", label: "Afghanistan", flag: "🇦🇫" },
    { value: "al", label: "Albania", flag: "🇦🇱" },
    { value: "dz", label: "Algeria", flag: "🇩🇿" },
    { value: "ad", label: "Andorra", flag: "🇦🇩" },
    { value: "ao", label: "Angola", flag: "🇦🇴" },
    { value: "ag", label: "Antigua and Barbuda", flag: "🇦🇬" },
    { value: "ar", label: "Argentina", flag: "🇦🇷" },
    { value: "am", label: "Armenia", flag: "🇦🇲" },
    { value: "au", label: "Australia", flag: "🇦🇺" },
    { value: "at", label: "Austria", flag: "🇦🇹" },
    { value: "az", label: "Azerbaijan", flag: "🇦🇿" },
    { value: "bs", label: "Bahamas", flag: "🇧🇸" },
    { value: "bh", label: "Bahrain", flag: "🇧🇭" },
    { value: "bd", label: "Bangladesh", flag: "🇧🇩" },
    { value: "bb", label: "Barbados", flag: "🇧🇧" },
    { value: "by", label: "Belarus", flag: "🇧🇾" },
    { value: "be", label: "Belgium", flag: "🇧🇪" },
    { value: "bz", label: "Belize", flag: "🇧🇿" },
    { value: "bj", label: "Benin", flag: "🇧🇯" },
    { value: "bt", label: "Bhutan", flag: "🇧🇹" },
    { value: "bo", label: "Bolivia", flag: "🇧🇴" },
    { value: "ba", label: "Bosnia and Herzegovina", flag: "🇧🇦" },
    { value: "bw", label: "Botswana", flag: "🇧🇼" },
    { value: "br", label: "Brazil", flag: "🇧🇷" },
    { value: "bn", label: "Brunei", flag: "🇧🇳" },
    { value: "bg", label: "Bulgaria", flag: "🇧🇬" },
    { value: "bf", label: "Burkina Faso", flag: "🇧🇫" },
    { value: "bi", label: "Burundi", flag: "🇧🇮" },
    { value: "cv", label: "Cabo Verde", flag: "🇨🇻" },
    { value: "kh", label: "Cambodia", flag: "🇰🇭" },
    { value: "cm", label: "Cameroon", flag: "🇨🇲" },
    { value: "ca", label: "Canada", flag: "🇨🇦" },
    { value: "cf", label: "Central African Republic", flag: "🇨🇫" },
    { value: "td", label: "Chad", flag: "🇹🇩" },
    { value: "cl", label: "Chile", flag: "🇨🇱" },
    { value: "cn", label: "China", flag: "🇨🇳" },
    { value: "co", label: "Colombia", flag: "🇨🇴" },
    { value: "km", label: "Comoros", flag: "🇰🇲" },
    { value: "cg", label: "Congo", flag: "🇨🇬" },
    { value: "cd", label: "Congo (Democratic Republic)", flag: "🇨🇩" },
    { value: "cr", label: "Costa Rica", flag: "🇨🇷" },
    { value: "ci", label: "Côte d'Ivoire", flag: "🇨🇮" },
    { value: "hr", label: "Croatia", flag: "🇭🇷" },
    { value: "cu", label: "Cuba", flag: "🇨🇺" },
    { value: "cy", label: "Cyprus", flag: "🇨🇾" },
    { value: "cz", label: "Czech Republic", flag: "🇨🇿" },
    { value: "dk", label: "Denmark", flag: "🇩🇰" },
    { value: "dj", label: "Djibouti", flag: "🇩🇯" },
    { value: "dm", label: "Dominica", flag: "🇩🇲" },
    { value: "do", label: "Dominican Republic", flag: "🇩🇴" },
    { value: "ec", label: "Ecuador", flag: "🇪🇨" },
    { value: "eg", label: "Egypt", flag: "🇪🇬" },
    { value: "sv", label: "El Salvador", flag: "🇸🇻" },
    { value: "gq", label: "Equatorial Guinea", flag: "🇬🇶" },
    { value: "er", label: "Eritrea", flag: "🇪🇷" },
    { value: "ee", label: "Estonia", flag: "🇪🇪" },
    { value: "sz", label: "Eswatini", flag: "🇸🇿" },
    { value: "et", label: "Ethiopia", flag: "🇪🇹" },
    { value: "fj", label: "Fiji", flag: "🇫🇯" },
    { value: "fi", label: "Finland", flag: "🇫🇮" },
    { value: "fr", label: "France", flag: "🇫🇷" },
    { value: "ga", label: "Gabon", flag: "🇬🇦" },
    { value: "gm", label: "Gambia", flag: "🇬🇲" },
    { value: "ge", label: "Georgia", flag: "🇬🇪" },
    { value: "de", label: "Germany", flag: "🇩🇪" },
    { value: "gh", label: "Ghana", flag: "🇬🇭" },
    { value: "gr", label: "Greece", flag: "🇬🇷" },
    { value: "gd", label: "Grenada", flag: "🇬🇩" },
    { value: "gt", label: "Guatemala", flag: "🇬🇹" },
    { value: "gn", label: "Guinea", flag: "🇬🇳" },
    { value: "gw", label: "Guinea-Bissau", flag: "🇬🇼" },
    { value: "gy", label: "Guyana", flag: "🇬🇾" },
    { value: "ht", label: "Haiti", flag: "🇭🇹" },
    { value: "hn", label: "Honduras", flag: "🇭🇳" },
    { value: "hu", label: "Hungary", flag: "🇭🇺" },
    { value: "is", label: "Iceland", flag: "🇮🇸" },
    { value: "in", label: "India", flag: "🇮🇳" },
    { value: "id", label: "Indonesia", flag: "🇮🇩" },
    { value: "ir", label: "Iran", flag: "🇮🇷" },
    { value: "iq", label: "Iraq", flag: "🇮🇶" },
    { value: "ie", label: "Ireland", flag: "🇮🇪" },
    { value: "il", label: "Israel", flag: "🇮🇱" },
    { value: "it", label: "Italy", flag: "🇮🇹" },
    { value: "jm", label: "Jamaica", flag: "🇯🇲" },
    { value: "jp", label: "Japan", flag: "🇯🇵" },
    { value: "jo", label: "Jordan", flag: "🇯🇴" },
    { value: "kz", label: "Kazakhstan", flag: "🇰🇿" },
    { value: "ke", label: "Kenya", flag: "🇰🇪" },
    { value: "ki", label: "Kiribati", flag: "🇰🇮" },
    { value: "kp", label: "Korea (North)", flag: "🇰🇵" },
    { value: "kr", label: "Korea (South)", flag: "🇰🇷" },
    { value: "kw", label: "Kuwait", flag: "🇰🇼" },
    { value: "kg", label: "Kyrgyzstan", flag: "🇰🇬" },
    { value: "la", label: "Laos", flag: "🇱🇦" },
    { value: "lv", label: "Latvia", flag: "🇱🇻" },
    { value: "lb", label: "Lebanon", flag: "🇱🇧" },
    { value: "ls", label: "Lesotho", flag: "🇱🇸" },
    { value: "lr", label: "Liberia", flag: "🇱🇷" },
    { value: "ly", label: "Libya", flag: "🇱🇾" },
    { value: "li", label: "Liechtenstein", flag: "🇱🇮" },
    { value: "lt", label: "Lithuania", flag: "🇱🇹" },
    { value: "lu", label: "Luxembourg", flag: "🇱🇺" },
    { value: "mg", label: "Madagascar", flag: "🇲🇬" },
    { value: "mw", label: "Malawi", flag: "🇲🇼" },
    { value: "my", label: "Malaysia", flag: "🇲🇾" },
    { value: "mv", label: "Maldives", flag: "🇲🇻" },
    { value: "ml", label: "Mali", flag: "🇲🇱" },
    { value: "mt", label: "Malta", flag: "🇲🇹" },
    { value: "mh", label: "Marshall Islands", flag: "🇲🇭" },
    { value: "mr", label: "Mauritania", flag: "🇲🇷" },
    { value: "mu", label: "Mauritius", flag: "🇲🇺" },
    { value: "mx", label: "Mexico", flag: "🇲🇽" },
    { value: "fm", label: "Micronesia", flag: "🇫🇲" },
    { value: "md", label: "Moldova", flag: "🇲🇩" },
    { value: "mc", label: "Monaco", flag: "🇲🇨" },
    { value: "mn", label: "Mongolia", flag: "🇲🇳" },
    { value: "me", label: "Montenegro", flag: "🇲🇪" },
    { value: "ma", label: "Morocco", flag: "🇲🇦" },
    { value: "mz", label: "Mozambique", flag: "🇲🇿" },
    { value: "mm", label: "Myanmar", flag: "🇲🇲" },
    { value: "na", label: "Namibia", flag: "🇳🇦" },
    { value: "nr", label: "Nauru", flag: "🇳🇷" },
    { value: "np", label: "Nepal", flag: "🇳🇵" },
    { value: "nl", label: "Netherlands", flag: "🇳🇱" },
    { value: "nz", label: "New Zealand", flag: "🇳🇿" },
    { value: "ni", label: "Nicaragua", flag: "🇳🇮" },
    { value: "ne", label: "Niger", flag: "🇳🇪" },
    { value: "ng", label: "Nigeria", flag: "🇳🇬" },
    { value: "mk", label: "North Macedonia", flag: "🇲🇰" },
    { value: "no", label: "Norway", flag: "🇳🇴" },
    { value: "om", label: "Oman", flag: "🇴🇲" },
    { value: "pk", label: "Pakistan", flag: "🇵🇰" },
    { value: "pw", label: "Palau", flag: "🇵🇼" },
    { value: "pa", label: "Panama", flag: "🇵🇦" },
    { value: "pg", label: "Papua New Guinea", flag: "🇵🇬" },
    { value: "py", label: "Paraguay", flag: "🇵🇾" },
    { value: "pe", label: "Peru", flag: "🇵🇪" },
    { value: "ph", label: "Philippines", flag: "🇵🇭" },
    { value: "pl", label: "Poland", flag: "🇵🇱" },
    { value: "pt", label: "Portugal", flag: "🇵🇹" },
    { value: "qa", label: "Qatar", flag: "🇶🇦" },
    { value: "ro", label: "Romania", flag: "🇷🇴" },
    { value: "ru", label: "Russia", flag: "🇷🇺" },
    { value: "rw", label: "Rwanda", flag: "🇷🇼" },
    { value: "kn", label: "Saint Kitts and Nevis", flag: "🇰🇳" },
    { value: "lc", label: "Saint Lucia", flag: "🇱🇨" },
    { value: "vc", label: "Saint Vincent and the Grenadines", flag: "🇻🇨" },
    { value: "ws", label: "Samoa", flag: "🇼🇸" },
    { value: "sm", label: "San Marino", flag: "🇸🇲" },
    { value: "st", label: "Sao Tome and Principe", flag: "🇸🇹" },
    { value: "sa", label: "Saudi Arabia", flag: "🇸🇦" },
    { value: "sn", label: "Senegal", flag: "🇸🇳" },
    { value: "rs", label: "Serbia", flag: "🇷🇸" },
    { value: "sc", label: "Seychelles", flag: "🇸🇨" },
    { value: "sl", label: "Sierra Leone", flag: "🇸🇱" },
    { value: "sg", label: "Singapore", flag: "🇸🇬" },
    { value: "sk", label: "Slovakia", flag: "🇸🇰" },
    { value: "si", label: "Slovenia", flag: "🇸🇮" },
    { value: "sb", label: "Solomon Islands", flag: "🇸🇧" },
    { value: "so", label: "Somalia", flag: "🇸🇴" },
    { value: "za", label: "South Africa", flag: "🇿🇦" },
    { value: "ss", label: "South Sudan", flag: "🇸🇸" },
    { value: "es", label: "Spain", flag: "🇪🇸" },
    { value: "lk", label: "Sri Lanka", flag: "🇱🇰" },
    { value: "sd", label: "Sudan", flag: "🇸🇩" },
    { value: "sr", label: "Suriname", flag: "🇸🇷" },
    { value: "se", label: "Sweden", flag: "🇸🇪" },
    { value: "ch", label: "Switzerland", flag: "🇨🇭" },
    { value: "sy", label: "Syria", flag: "🇸🇾" },
    { value: "tw", label: "Taiwan", flag: "🇹🇼" },
    { value: "tj", label: "Tajikistan", flag: "🇹🇯" },
    { value: "tz", label: "Tanzania", flag: "🇹🇿" },
    { value: "th", label: "Thailand", flag: "🇹🇭" },
    { value: "tl", label: "Timor-Leste", flag: "🇹🇱" },
    { value: "tg", label: "Togo", flag: "🇹🇬" },
    { value: "to", label: "Tonga", flag: "🇹🇴" },
    { value: "tt", label: "Trinidad and Tobago", flag: "🇹🇹" },
    { value: "tn", label: "Tunisia", flag: "🇹🇳" },
    { value: "tr", label: "Turkey", flag: "🇹🇷" },
    { value: "tm", label: "Turkmenistan", flag: "🇹🇲" },
    { value: "tv", label: "Tuvalu", flag: "🇹🇻" },
    { value: "ug", label: "Uganda", flag: "🇺🇬" },
    { value: "ua", label: "Ukraine", flag: "🇺🇦" },
    { value: "ae", label: "United Arab Emirates", flag: "🇦🇪" },
    { value: "uk", label: "United Kingdom", flag: "🇬🇧" },
    { value: "us", label: "United States", flag: "🇺🇸" },
    { value: "uy", label: "Uruguay", flag: "🇺🇾" },
    { value: "uz", label: "Uzbekistan", flag: "🇺🇿" },
    { value: "vu", label: "Vanuatu", flag: "🇻🇺" },
    { value: "va", label: "Vatican City", flag: "🇻🇦" },
    { value: "ve", label: "Venezuela", flag: "🇻🇪" },
    { value: "vn", label: "Vietnam", flag: "🇻🇳" },
    { value: "ye", label: "Yemen", flag: "🇾🇪" },
    { value: "zm", label: "Zambia", flag: "🇿🇲" },
    { value: "zw", label: "Zimbabwe", flag: "🇿🇼" }
];

const Step1PersonalInfo = ({ control, register, errors }) => {
    // Function to validate if user is 18 or older
    const validateAge = (value) => {
        const dob = new Date(value);
        const today = new Date();
        const eighteenYearsAgo = new Date(today);
        eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
        
        return dob <= eighteenYearsAgo || "You must be at least 18 years old";
    };

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
                    {...register("firstName", { 
                        required: "First name is required",
                        minLength: {
                            value: 3,
                            message: "First name must be at least 3 characters"
                        },
                        pattern: {
                            value: /^[A-Za-z\s]+$/,
                            message: "First name must contain only letters"
                        }
                    })}
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
                    {...register("surname", { 
                        required: "Surname is required",
                        minLength: {
                            value: 3,
                            message: "Surname must be at least 3 characters"
                        },
                        pattern: {
                            value: /^[A-Za-z\s]+$/,
                            message: "Surname must contain only letters"
                        }
                    })}
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
                        {...register("dateOfBirth", { 
                            required: "Date of birth is required",
                            validate: validateAge
                        })}
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
                            <SelectContent 
                                className="max-h-[200px] overflow-y-auto"
                                position="popper" 
                                align="start" 
                                side="bottom"
                            >
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
                                <RadioGroupItem value="masters" id="masters" />
                                <Label htmlFor="masters">Masters</Label>
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
            
            {/* Course Year */}
            <div className="space-y-2">
                <div className="flex items-center">
                    <Label htmlFor="courseYear">Course Year</Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="ml-2 h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Your current year of study.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Controller
                    name="courseYear"
                    control={control}
                    rules={{ required: "Please select your course year" }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className={errors.courseYear ? "border-red-500 focus-visible:ring-red-500" : ""}>
                                <SelectValue placeholder="Select your course year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="foundational">Foundational</SelectItem>
                                <SelectItem value="year1">Year 1</SelectItem>
                                <SelectItem value="year2">Year 2</SelectItem>
                                <SelectItem value="year3">Year 3</SelectItem>
                                <SelectItem value="year4">Year 4</SelectItem>
                                <SelectItem value="year5">Year 5+</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.courseYear && <p className="text-sm text-red-500">{errors.courseYear.message}</p>}
            </div>

            <p className="text-xs text-gray-500 mt-4">
                We comply with GDPR. Your data is encrypted and never shared.
            </p>
        </motion.div>
    );
};

export default Step1PersonalInfo; 