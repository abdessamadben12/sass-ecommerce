import { Loader } from 'lucide-react'
import React from 'react'

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Loader className="w-8 h-8 mx-auto mb-3 text-blue-500 animate-spin" />
          <p className="text-gray-500">Loading ...</p>
        </div>
      </div>
  )
}
