"use client"
import React from 'react'
import RangeSlider from './RangeSlider'
import CategoryDropdown from './CategoryDropdown'
// import world from '../assets/countries'
import { themes } from '../themes/colorThemes'
const LeftSliders = ({setSelectedEvent,country,setcountry,yearRange,setYearRange,setSelectedCategory,mode}) => {
  return (
    <div
                className={`Left-Sliders`}
              >
                <RangeSlider
                  setSelectedEvent={setSelectedEvent}
                  yearRange={yearRange}
                  setYearRange={setYearRange}
                  mode={mode}
                  
                />
                <div className='bottm flex justify-evenly items-center' >

                <div className="flex items-center gap-10 text-inherit ">
                  <div className="flex items-center space-x-4">
                    <label className="font-medium text-inherit">
                      Start Year
                    </label>
                    {/* <span className="text-inherit">{yearRange.startYear}</span> */}
                  </div>
                  <select style={{backgroundColor:!mode?themes.light.text:themes.dark.text}} onChange={(e) => {
                    setcountry(e.target.value)
                  }
                  } value={country}>
<option value="">Select a Country</option>
                    {world.features.map((cont, index) => (
                      
                    <option value={index} key={index} >{world.features[index].properties.ADMIN}</option>
                  )
                  
                )
                
              }
              </select>
                  <CategoryDropdown
                    onCategoryChange={setSelectedCategory}
                    clr={setSelectedEvent}
                    mode={mode}
                    />
                   <div className="flex items-center space-x-4 pr-2">
                    <label className="font-medium text-inherit">
                      End Year
                    </label>
                    {/* <span className="text-inherit">{yearRange.endYear}</span> */}
                  </div>
                </div>
                    </div>
              </div>
  )
}

export default LeftSliders;
