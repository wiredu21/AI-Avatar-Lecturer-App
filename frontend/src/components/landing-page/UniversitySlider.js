import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

const universities = [
    {
        id: 1,
        name: "University of Northampton",
        logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Default_A_sleek_highcontrast_black_and_white_photograph_of_The_0_258ccca5-d280-4788-98fc-ec0a8a2d4743_0-UcJg0dK1luyD4G4XPvw1RHXCmW5Fmm.png",
        color: "#000000",
    },
    {
        id: 2,
        name: "Nottingham Trent University",
        logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NTU%20logo%202-oFB3tbNi7Gg5XACI7S0EGjpeDWK9Pp.png",
        color: "#E31B23",
    },
    {
        id: 3,
        name: "Birmingham City University",
        logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BCU%20logo-iEQFcaaTInSP2lJKcQ37X33TtkNZg9.webp",
        color: "#003C71",
    },
    {
        id: 4,
        name: "Coventry University",
        logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coventry-QCY9RFwkW54bp4pZz0z2MhOu6OVsFK.png",
        color: "#00A0DF",
    },
];

export default function UniversitySlider() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <section className="py-20 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Find Your University</h2>
                <div
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
                    <Swiper
                        modules={[Autoplay]}
                        spaceBetween={50}
                        slidesPerView={4}
                        loop={true}
                        autoplay={{
                            delay: 0,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                            stopOnLastSlide: false,
                            waitForTransition: true,
                        }}
                        speed={5000}
                        allowTouchMove={true}
                        breakpoints={{
                            320: {
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            640: {
                                slidesPerView: 3,
                                spaceBetween: 30,
                            },
                            1024: {
                                slidesPerView: 4,
                                spaceBetween: 50,
                            },
                        }}
                        className="py-8"
                    >
                        {[...universities, ...universities].map((university, index) => (
                            <SwiperSlide
                                key={`${university.id}-${index}`}
                                className="transition-transform duration-300 hover:scale-105"
                            >
                                <div className="flex flex-col items-center gap-4 cursor-pointer">
                                    <div className="w-40 h-40 flex items-center justify-center p-4 bg-white rounded-lg shadow-sm">
                                        <img
                                            src={university.logo || "/placeholder.svg"}
                                            alt={`${university.name} logo`}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <p
                                        className="text-center font-semibold text-sm md:text-base"
                                        style={{ color: university.color }}
                                    >
                                        {university.name}
                                    </p>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
} 