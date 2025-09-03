"use client"
import React from 'react'
import CategoryDropdown from './CategoryDropdown'

const [yearRange, setYearRange] = useState({
    startYear: 2000,
    endYear: 2020,
  });
  
const YearSelect = ({yearRange, setYearRange, setSelectedCategory, setSelectedCategory}) => {
  return (
    <div className="flex flex-row items-center gap-10">
          <div className="flex items-center space-x-4">
            <label className="font-medium text-gray-700">
              Start Year:
              <input
                type="range"
                min="1900"
                max="2023"
                value={yearRange.startYear}
                onChange={(e) =>
                  setYearRange((prev) => ({
                    ...prev,
                    startYear: Number(e.target.value),
                  }))
                }
                className="ml-2"
              />
            </label>
            <span className="text-gray-600">{yearRange.startYear}</span>
          </div>
          <div className="flex items-center space-x-4">
            <label className="font-medium text-gray-700">
              End Year:
              <input
                type="range"
                min="1900"
                max="2023"
                value={yearRange.endYear}
                onChange={(e) =>
                  setYearRange((prev) => ({
                    ...prev,
                    endYear: Number(e.target.value),
                  }))
                }
                className="ml-2"
              />
            </label>
            <span className="text-gray-600">{yearRange.endYear}</span>
          </div>
          <CategoryDropdown onCategoryChange={setSelectedCategory} />
        </div>
  )
}

export default YearSelect
