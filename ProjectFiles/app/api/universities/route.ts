import { NextResponse } from "next/server"

// This is a mock API response. In a real application, this data would come from your Django backend.
const universities = [
  { id: 1, name: "University of Northampton", logo: "/logos/northampton.svg", color: "#1C4F9C" },
  { id: 2, name: "Nottingham Trent University", logo: "/logos/nottingham-trent.svg", color: "#E31B23" },
  { id: 3, name: "Birmingham City University", logo: "/logos/birmingham-city.svg", color: "#003C71" },
  { id: 4, name: "Coventry University", logo: "/logos/coventry.svg", color: "#00A0DF" },
  { id: 5, name: "University of Leicester", logo: "/logos/leicester.svg", color: "#990000" },
  { id: 6, name: "De Montfort University", logo: "/logos/de-montfort.svg", color: "#00008B" },
  { id: 7, name: "University of Derby", logo: "/logos/derby.svg", color: "#6C2C3B" },
]

export async function GET() {
  return NextResponse.json(universities)
}

