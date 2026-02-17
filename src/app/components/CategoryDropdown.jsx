"use client"
import { useEffect } from "react";
import { Chip } from "@/components/ui/chip";
import {
  Calendar as EventIcon,
  Cake as CakeIcon,
  Frown as SentimentDissatisfiedIcon,
  Globe as PublicIcon,
  Landmark as HistoryIcon,
  FlaskConical as ScienceIcon,
  Sword as MilitaryTechIcon,
  CircleDollarSign as AttachMoneyIcon,
  Users as GroupIcon,
  TriangleAlert as ReportProblemIcon,
  Church as ChurchIcon,
  Palette as PaletteIcon,
  Leaf as EcoIcon,
  Search as SearchIcon,
  AppWindow as CategoryIcon,
} from "lucide-react";

const CategoryDropdown = ({ onCategoryChange, clr, mode, selectedCategories, setSelectedCategories }) => {
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

  useEffect(() => {
    onCategoryChange(selectedCategories);
    clr(null);
  }, [selectedCategories, onCategoryChange, clr]);

  const handleCategorySelect = (value) => {
    setSelectedCategories((prevCategories) => {
      const updatedCategories = prevCategories.includes(value)
        ? prevCategories.filter((category) => category !== value)
        : [...prevCategories, value];

      return updatedCategories;
    });
  };

  return (
    <div className="flex flex-row flex-wrap justify-center items-center gap-2">
      {categories.map((category) => (
        <Chip
          key={category.value}
          onClick={() => handleCategorySelect(category.value)}
          variant={selectedCategories.includes(category.value) ? (mode ? "success" : "destructive") : "default"}
          className="cursor-pointer"
        >
          {category.icon}
          <span className="ml-2">{category.label}</span>
        </Chip>
      ))}
    </div>
  );
};

export default CategoryDropdown;
