import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="bg-white py-40 md:pt-60 md:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-24">
          <h1 className="block text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            School Attendance System
          </h1>
          <h2 className="block text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-indigo-900 mt-2">
            Powered by Facial Recognition
          </h2>
          <p className="mt-8 text-md text-gray-600 max-w-3xl mx-4 md:mx-16 lg:mx-auto">
            Welcome to the next generation of student attendance management. Our system leverages advanced facial recognition technology to accurately identify students and monitor their attendance in real time. Say goodbye to manual roll calls and attendance sheets—simply log in, scan your face, and your presence is automatically recorded.
          </p>
          <p className="mt-4 text-md text-gray-600 max-w-3xl mx-4 md:mx-16 lg:mx-auto">
            Built with React and face-api.js, this application ensures a secure, efficient, and user-friendly experience for both students and administrators.
          </p>
          <Link
            to={"/user-select"}
            className="flex gap-2 mt-12 w-fit mx-auto cursor-pointer z-10 py-3 px-6 rounded-full bg-gradient-to-r from-indigo-300 to-indigo-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            <span className="text-white">Mark Attendance</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
