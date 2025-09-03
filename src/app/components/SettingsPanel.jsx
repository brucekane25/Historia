"use client"
import { useState } from "react";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import RangeSlider from "./RangeSlider";
import RightSliders from "./RightSliders";
import { themes } from "../themes/colorThemes";
// import world from "../assets/countries";
import CategoryDropdown from "./CategoryDropdown";
import { Close } from "@mui/icons-material";

export default function SettingsPanel({
  isDesktop,
  mode,
  country,
  selectedCategory,
  setSelectedCategory,
  setSelectedEvent,
  setYearRange,
  setsettings,
  setcountry,
  yearRange,
  pages,
  currentPage,
  setCurrentPage,
  setLimit,
  limit,
  filterTotalEvents,
  totalEvents,
}) {
  const [style, setStyle] = useState("Tiles");

  const styles = ["Basic", "Miscellaneous", "Calendar", "Map"];

  return (
    <div
      style={{
        backgroundColor: mode
          ? themes.light.pbackground
          : themes.dark.pbackground,
        color: mode ? themes.light.text : themes.dark.text,
      }}
      className={` 
        ${isDesktop?'p-6':'py-2 px-3 min-w-[97vw] overflow-scroll'}
        rounded-2xl  shadow-lg
         max-w-[550px]
        `}
    >
      
      <header className="flex items-center justify-between mb-3">
  <div className="flex items-center">
    <span className="text-3xl"> &gt; </span>
    <h2 className="ml-2 text-3xl font-semibold">Tweaks</h2>
  </div>
  
  <div
    onClick={()=>{setsettings(false)}}
    className={`rounded-full p-2 shadow-md cursor-pointer transition-all duration-300  focus:outline-none ${
      mode ? 'text-black bg-white hover:bg-gray-200' : 'text-white bg-gray-800 hover:bg-gray-700'
    }`}
  >
    <Close className="w-5 h-5" />
  </div>
</header>


      <section>
        {/* <div className="grid grid-cols-4 gap-4 mb-6">
          {styles.map((item) => (
            <Button
              key={item}
              onClick={() => setStyle(item)}
              variant={style === item ? "contained" : "outlined"}
              color={style === item ? (mode ? "success" : "error") : "inherit"}
            >
              {item}
            </Button>
          ))}
        </div> */}

        <div className={`${isDesktop?'space-y-4 mb-3':'space-y-2 mb-2' } `}>
          {/* <div
            style={{
              backgroundColor: mode
                ? themes.light.sbackground
                : themes.dark.sbackground,
            }}
            className="flex items-center justify-around p-2 h-16 rounded-lg"
          > */}
            {/* <span className="text-sm font-medium">Country</span> */}
            {/* <select
              style={{
                backgroundColor: !mode ? themes.light.text : themes.dark.text,
              }}
              onChange={(e) => {
                setcountry(e.target.value);
              }}
              value={country}
            >
              <option value="">Select a Country</option>
              {world.features.map((cont, index) => (
                <option value={index} key={index}>
                  {world.features[index].properties.ADMIN}
                </option>
              ))}
            </select> */}
          {/* </div> */}
          <div
            style={{
              backgroundColor: mode
                ? themes.light.sbackground
                : themes.dark.sbackground,
            }}
            className="flex items-center justify-between p-2 bg-gray-100 rounded-lg"
          >
            <CategoryDropdown
              onCategoryChange={setSelectedCategory}
              clr={setSelectedEvent}
              mode={mode}
            />
          </div>
        </div>

        <div className={`${isDesktop?'space-y-3':'space-y-2'} `}>
          <div
            style={{
              backgroundColor: mode
                ? themes.light.sbackground
                : themes.dark.sbackground,
            }}
            className="flex justify-between  items-center px-3 py-6 bg-gray-100 rounded-lg"
          >
            <RangeSlider
              setSelectedEvent={setSelectedEvent}
              yearRange={yearRange}
              setYearRange={setYearRange}
              mode={mode}
            />
          </div>
          <div>
            <div
              style={{
                backgroundColor: mode
                  ? themes.light.sbackground
                  : themes.dark.sbackground,
              }}
              className="flex justify-between items-center px-2 py-2 bg-gray-100 rounded-lg"
            >
              <RightSliders
                setLimit={setLimit}
                mode={mode}
                pages={pages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                limit={limit}
                filterTotalEvents={filterTotalEvents}
                totalEvents={totalEvents}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
