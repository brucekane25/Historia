"use client"
import { useEffect, useState } from "react";
import { Chip, Stack } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import CakeIcon from "@mui/icons-material/Cake";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import PublicIcon from "@mui/icons-material/Public";
import HistoryIcon from "@mui/icons-material/History";
import ScienceIcon from "@mui/icons-material/Science";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GroupIcon from "@mui/icons-material/Group";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ChurchIcon from "@mui/icons-material/Church";
import PaletteIcon from "@mui/icons-material/Palette";
import EcoIcon from "@mui/icons-material/Nature";
import SearchIcon from "@mui/icons-material/Search";
import CategoryIcon from "@mui/icons-material/Category";

const CategoryDropdown = ({ onCategoryChange, clr, mode }) => {
  const categories = [
    { value: "selected", label: "Selected", icon: <SearchIcon /> },
    { value: "births", label: "Births", icon: <CakeIcon /> },
    { value: "deaths", label: "Deaths", icon: <SentimentDissatisfiedIcon /> },
    { value: "events", label: "Events", icon: <EventIcon /> },
    { value: "political", label: "Political", icon: <PublicIcon /> },
    { value: "historical", label: "Historical", icon: <HistoryIcon /> },
    { value: "scientific", label: "Scientific", icon: <ScienceIcon /> },
    { value: "war", label: "War", icon: <MilitaryTechIcon /> },
    { value: "economic", label: "Economic", icon: <AttachMoneyIcon /> },
    { value: "social", label: "Social", icon: <GroupIcon /> },
    { value: "disasters", label: "Disasters", icon: <ReportProblemIcon /> },
    { value: "religious", label: "Religion", icon: <ChurchIcon /> },
    { value: "cultural", label: "Cultural", icon: <PaletteIcon /> },
    { value: "environmental", label: "Environmental", icon: <EcoIcon /> },
    { value: "discoveries", label: "Discoveries", icon: <CategoryIcon /> },
  ];

  const [selectedCategories, setSelectedCategories] = useState([]);
  useEffect(() => {
    
  onCategoryChange(selectedCategories);
      clr(null);
    
  }, [selectedCategories,onCategoryChange,clr])
  
  const handleCategorySelect = (value) => {
    setSelectedCategories((prevCategories) => {
      const updatedCategories = prevCategories.includes(value)
        ? prevCategories.filter((category) => category !== value)
        : [...prevCategories, value];
      
      return updatedCategories;
    });
  };

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" columnGap={1} rowGap={1} className="flex justify-center items-center">
      {categories.map((category) => (
        <Chip
          key={category.value}
          label={category.label}
          icon={category.icon}
          onClick={() => handleCategorySelect(category.value)}
          onDelete={
            selectedCategories.includes(category.value)
              ? () => handleCategorySelect(category.value)
              : undefined
          }
          color={selectedCategories.includes(category.value) ? mode?"success":'error' : "default"}
          variant="filled"
          style={{
            // backgroundColor: selectedCategories.includes(category.value)
            //   ? mode
            //     ? "#90caf9" // Light blue for dark mode
            //     : "#1976d2" // Default blue for light mode
            //   : !mode
            //   ? "#424242" // Grey for dark mode
            //   : "#e0e0e0", // Light grey for light mode
            color: selectedCategories.includes(category.value) ? "white" : !mode ? "#fff" : "#000",
          }}
        />
      ))}
    </Stack>
  );
};

export default CategoryDropdown;
