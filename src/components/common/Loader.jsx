import React from 'react'
import { FaSpinner } from 'react-icons/fa';

const Loader = () => {
  return ( 
    <div className="flex flex-col items-center justify-center h-full w-full py-16">
      <FaSpinner className="animate-spin text-blue-500 text-5xl mb-4" />
      <span className="text-lg text-gray-600">Loading...</span>
    </div>
  ); 
}

export default Loader
