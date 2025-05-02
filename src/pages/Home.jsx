import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/imgs/image.png')] bg-cover bg-center bg-no-repeat">
      <div className="bg-white bg-opacity-80 backdrop-blur-md  p-10 max-w-3xl text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
          Welcome to the Customer International Payments Portal
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Seamlessly send and receive payments across the globe with ease and transparency.
        </p>
        <Link to="/authform">
          <button className="bg-pink-500 hover:bg-pink-400 text-white font-semibold py-3 px-6 rounded-full transition duration-300 shadow-md">
            Create Free Account
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Home
