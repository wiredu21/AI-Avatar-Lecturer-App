import Image from "next/image"

const avatars = [
  { id: 1, src: "/avatars/male1.png", alt: "Male Avatar 1" },
  { id: 2, src: "/avatars/male2.png", alt: "Male Avatar 2" },
  { id: 3, src: "/avatars/male3.png", alt: "Male Avatar 3" },
  { id: 4, src: "/avatars/male4.png", alt: "Male Avatar 4" },
  { id: 5, src: "/avatars/female1.png", alt: "Female Avatar 1" },
  { id: 6, src: "/avatars/female2.png", alt: "Female Avatar 2" },
  { id: 7, src: "/avatars/female3.png", alt: "Female Avatar 3" },
  { id: 8, src: "/avatars/female4.png", alt: "Female Avatar 4" },
]

export default function CustomiseAILecturer() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-3/5 mb-12 lg:mb-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {avatars.map((avatar) => (
                <div key={avatar.id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-purple-600 rounded-lg opacity-50 group-hover:opacity-100 transition duration-300 blur"></div>
                  <button className="relative bg-white rounded-lg p-2 w-full h-full">
                    <Image
                      src={avatar.src || "/placeholder.svg"}
                      alt={avatar.alt}
                      width={150}
                      height={150}
                      className="w-full h-auto"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-2/5 lg:pl-12">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-600">
                Customise Your AI Lecturer
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Choose from 8 unique avatars and select a voice to match your learning style.
            </p>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-800">Select Voice:</h3>
              <div className="flex space-x-4">
                <button className="px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition duration-300">
                  Male Voice
                </button>
                <button className="px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition duration-300">
                  Female Voice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

