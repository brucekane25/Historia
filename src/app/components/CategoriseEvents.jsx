const categorizeEvents = (events) => {
  const categories = {
    political: [
      "government", "policy", "election", "diplomacy", "president", "parliament", 
      "legislation", "leader", "administration", "democracy", "politician", "voting", 
      "reform", "expel", "banish", "trial", "executed", "campaign", "senator", "minister",
      "regulation", "impeach", "referendum", "electioneering", "political party", "vote", 
      "prime minister", "republic", "congress", "legislator", "authoritarian", "democratization", 
      "opposition"
    ],
    historical: [
      "heritage", "ancient", "historic", "landmark", "culture", "monument", "tradition", 
      "relic", "timeline", "archaeology", "civilization", "stake", "dynasty", "empire", 
      "history", "caliphate", "crusade", "heir", "crowned", "peasant", "medieval", "kingdom", 
      "empire", "dynastic", "pharaoh", "monarchy", "viking", "roman", "legacy", "king", "queen", 
      "ancestors", "colonization", "fiefdom", "historian", "ancient", "age", "dynasty", "pyramid", 
      "medieval"
    ],
    scientific: [
      "discovery", "science", "research", "experiment", "technology", "innovation", "breakthrough", 
      "invention", "biology", "physics", "chemistry", "medicine", "astronomy", "genetics", "engineering", 
      "researcher", "laboratory", "study", "hypothesis", "scientist", "DNA", "quantum", "algorithm", 
      "space", "microscope", "formula", "structure", "element", "theory", "robotics", "chemistry", "physics", 
      "solar", "bacteria", "virus", "surgery", "health", "genomics", "cloning", "antibiotic", "genetic", 
      "space exploration", "satellite", "weather", "bioengineering", "nanotechnology", "innovation", 
      "neuroscience"
    ],
    war: [
      "battle", "war", "conflict", "military", "invasion", "siege", "army", "navy", "treaty", 
      "rebellion", "massacre", "occupation", "insurrection", "defeat", "captures", "fleet", "battalion", 
      "sacks", "peace talks", "ceasefire", "rebel", "peace", "ceasefire", "cease", "surrender", "raid", 
      "breach", "revolt", "assassinate", "assassination", "campaign", "mercenary", "occupation", "airstrike", 
      "guerrilla", "militant", "displacement", "atrocity", "militarization", "soldiers", "siege", "tactical", 
      "frontlines", "victory", "infiltration", "drone", "humanitarian", "combat", "militant", "counterattack"
    ],
    discoveries: [
      "expedition", "discovered", "discovery", "exploration", "uncover", "explorer", "archaeologist", 
      "pioneer", "voyage", "new", "found", "breakthrough", "research", "invention", "mapping", "artifacts", 
      "expansion", "unveiling", "scientific", "findings", "unlock", "journey", "exposure", "revelation", 
      "excavation", "tour", "maps", "investigation", "investigators", "archaeological", "survey", "study", 
      "surveying", "historical", "unearth", "treasure", "mystery", "discovery", "adventure"
    ],
    economic: [
      "trade", "economy", "market", "inflation", "finance", "banking", "commerce", "industry", 
      "investment", "recession", "currency", "stocks", "GDP", "interest rates", "credit", "loan", "budget", 
      "debt", "exports", "imports", "growth", "profit", "trade deficit", "capital", "asset", "value", 
      "business", "economist", "revenue", "inflation", "capitalism", "capital", "venture", "finance", 
      "financial crisis", "bond", "fiscal", "economic downturn", "balance", "dividend", "trading", 
      "commodity", "marketplace", "sector", "tax", "policy", "surplus", "finance minister", "monetary", 
      "devaluation", "equity", "stocks", "shareholder", "investment", "debt"
    ],
    social: [
      "protest", "movement", "rights", "justice", "activism", "equality", "education", "healthcare", 
      "welfare", "poverty", "discrimination", "reform", "civil rights", "freedom", "solidarity", "inclusion", 
      "justice", "representation", "demonstration", "human rights", "minorities", "immigration", "displaced", 
      "homeless", "refugees", "activist", "advocacy", "awareness", "climate", "anti-racism", "gender", 
      "transparency", "campaign", "lgbtq+", "advocate", "feminism", "humanitarian", "equality", "legislation", 
      "gender equality", "rights", "oppression", "disability", "mental health", "welfare"
    ],
    cultural: [
      "festival", "art", "music", "dance", "literature", "painting", "sculpture", "theater", "performance", 
      "crafts", "exhibition", "poetry", "artifacts", "show", "pope", "papacy", "artistry", "museum", "tradition",
    ],
    religious: [
      "religion", "faith", "god", "church", "bible", "prayer", "holy", "spiritual", "christianity", "islam",
      "buddhism", "hinduism", "judaism", "worship", "mosque", "temple", "divine", "sacred", "pilgrimage", 
      "scripture", "believers", "holy site", "prophet", "clergy", "theology", "baptism", "covenant", "sanctuary", 
      "salvation", "holy war", "sacrament", "atonement", "saint", "monastery", "priest", "theology", "meditation", 
      "confession", "buddhist", "bible belt", "pilgrims", "scripture", "savior", "cloister", "faithful", 
      "crusade", "mysticism", "atonement", "devotion"
    ],
    disasters: [
      "disaster", "accident", "mishap", "earthquake", "tsunami", "flood", "hurricane", "tornado", "explosion", 
      "crash", "collide", "accident", "fire", "deaths", "catastrophe", "fatality", "emergency", "tragedy", 
      "casualties", "damage", "collapse", "landslide", "famine", "drought", "displacement", "disaster relief", 
      "victims", "search and rescue", "hazard", "devastation", "collapse", "tornado", "heatwave", "storm", 
      "survivors", "fatalities", "injuries", "rescue operation", "terror", "terrorist", "suicide", "stampede", "shooting"
    ]
  };



  const classifyEvent = (event) => {
    const text = event.title.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return category;
      }
    }
    return event.category || null; 
  };

  return events.map((event) => ({
    ...event,
    category: classifyEvent(event),
  }));
};

export default categorizeEvents;
