// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-red-100',
    'text-blue-700', 'text-green-700', 'text-yellow-700', 'text-red-700',
    'border-blue-300', 'border-green-300', 'border-yellow-300', 'border-red-300'
    ,"border-orange-500","border-red-500","bg-orange-100",
    "border-green-600/100","bg-green-100","border-blue-500","border-gray-800","boredr-b-2"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
