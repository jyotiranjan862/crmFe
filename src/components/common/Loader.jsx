import React from 'react'
import { FaSpinner } from 'react-icons/fa';

const Loader = () => {
  return ( 
    <div className="flex flex-col items-center justify-center h-full w-full py-16">
      <FaSpinner className="animate-spin text-indigo-500 text-6xl mb-4" />
      <span className="text-lg font-semibold text-gray-700">Loading, please wait...</span>
    </div>
  ); 
}

export default Loader
