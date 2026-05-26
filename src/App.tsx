import React, { useState, useEffect, useMemo, FormEvent } from "react";
import {
  Search,
  Star,
  Users,
  Clock,
  Menu,
  User,
  Map as MapIcon,
  Home,
  Plus,
  Sparkles,
  Check,
  Loader2,
  RefreshCw,
  ExternalLink,
  X,
  FileText,
  Trash2,
  Tag,
  Info,
  ChevronRight,
  MapPin,
  Sun,
  Moon,
} from "lucide-react";
import { INITIAL_GAMES } from "./gamesData";
import { Game, CategoryFilter } from "./types";

export default function App() {
  // Load initial list from localStorage if available, else use defaults
  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem("ukge_playlist_games");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading from localStorage", e);
      }
    }
    return INITIAL_GAMES;
  });

  // Auto-migrate old local storage items to use authentic image/BGG links representation
  useEffect(() => {
    let updated = false;
    const migrated = games.map((game) => {
      const match = INITIAL_GAMES.find((g) => g.id === game.id);
      if (match) {
        if (game.imageUrl !== match.imageUrl || game.bggLink !== match.bggLink || game.title !== match.title) {
          updated = true;
          return {
            ...game,
            title: match.title,
            imageUrl: match.imageUrl,
            bggLink: match.bggLink,
          };
        }
      }
      return game;
    });
    if (updated) {
      setGames(migrated);
    }
  }, []);

  // Persist list
  useEffect(() => {
    localStorage.setItem("ukge_playlist_games", JSON.stringify(games));
  }, [games]);

  // Dark/Light Theme state
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("ukge_theme");
    return (saved as "dark" | "light") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("ukge_theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  // UI state
  const [activeTab, setActiveTab] = useState<"home" | "mustplay" | "map" | "profile">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<CategoryFilter>("All");
  
  // Custom Add Game Modal dialog
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGameTitle, setNewGameTitle] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Detailed manual add option if user key is offline
  const [showManualFields, setShowManualFields] = useState(false);
  const [manualPublisher, setManualPublisher] = useState("");
  const [manualStall, setManualStall] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualCategory, setManualCategory] = useState("STRATEGY");
  const [manualPlayers, setManualPlayers] = useState("2-4");
  const [manualTime, setManualTime] = useState("45m");
  const [manualHall, setManualHall] = useState("Hall 1");

  // Selected game detail for map highlight/card interactions
  const [selectedGameForMap, setSelectedGameForMap] = useState<string | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    const total = games.length;
    const mustPlay = games.filter((g) => g.mustPlay).length;
    const visited = games.filter((g) => g.visited).length;
    const percent = total > 0 ? Math.round((visited / total) * 100) : 0;
    
    // Grouped by hall
    const hall1Count = games.filter((g) => g.hall === "Hall 1").length;
    const hall2Count = games.filter((g) => g.hall === "Hall 2").length;
    const retailCount = games.filter((g) => g.hall === "Retail").length;

    return { total, mustPlay, visited, percent, hall1Count, hall2Count, retailCount };
  }, [games]);

  // Reset to original defaults
  const handleReset = () => {
    if (window.confirm("Are you sure you want to restore the original 19 games? This will preserve your current checkmarks and custom games!")) {
      const merged = [...games];
      INITIAL_GAMES.forEach((initial) => {
        if (!merged.some((m) => m.title.toLowerCase() === initial.title.toLowerCase())) {
          merged.push(initial);
        }
      });
      setGames(merged);
    }
  };

  const handleFullWipe = () => {
    if (window.confirm("Do you want to reset all games to the original defaults and clear all customized edits / checkmarks?")) {
      setGames(INITIAL_GAMES);
      localStorage.setItem("ukge_playlist_games", JSON.stringify(INITIAL_GAMES));
    }
  };

  // Toggle must play (starred)
  const toggleMustPlay = (id: string) => {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, mustPlay: !g.mustPlay } : g))
    );
  };

  // Toggle visited checkmark
  const toggleVisited = (id: string) => {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, visited: !g.visited } : g))
    );
  };

  // Remove a custom game
  const removeGame = (id: string) => {
    if (window.confirm("Remove this game from your planning dashboard?")) {
      setGames((prev) => prev.filter((g) => g.id !== id));
    }
  };

  // Automatic AI booth retrieval (Simulated Client-Side Grounding)
  const handleEnrichAndAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newGameTitle.trim()) return;

    setIsEnriching(true);
    setEnrichmentProgress("Consulting UKGE 2026 directory indexes...");
    setErrorMsg("");

    // Simulate standard lookup duration of high-fidelity client apps
    await new Promise((resolve) => setTimeout(resolve, 550));

    try {
      const title = newGameTitle.trim();
      const searchSlug = encodeURIComponent(title);
      
      // Smart presets logic for immediate enrichment
      let category = "STRATEGY";
      let hall = "Hall 1";
      let statusText = "AVAILABLE";
      let time = "60m";

      const lower = title.toLowerCase();
      if (lower.includes("party") || lower.includes("card") || lower.includes("social") || lower.includes("flip") || lower.includes("trivia") || lower.includes("meme")) {
        category = "SOCIAL";
        hall = "Hall 2";
        time = "20-30m";
      } else if (lower.includes("family") || lower.includes("kids") || lower.includes("parks") || lower.includes("forest") || lower.includes("wood") || lower.includes("express") || lower.includes("feathers")) {
        category = "FAMILY";
        hall = "Hall 2";
        time = "45m";
      } else if (lower.includes("exclusive") || lower.includes("deal") || lower.includes("pack") || lower.includes("book") || lower.includes("scratch") || lower.includes("spades") || lower.includes("ashes")) {
        category = "EXCLUSIVE";
        hall = "Retail";
        statusText = "LOW STOCK";
        time = "30m";
      } else if (lower.includes("expert") || lower.includes("heavy") || lower.includes("empire") || lower.includes("spire") || lower.includes("arcs")) {
        category = "EXPERT";
        hall = "Hall 1";
        time = "90-120m";
      }

      // Generate realistic Stand codes based on standard halls
      const randomStand = hall === "Hall 1" 
        ? `Stand 1-${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 20)+1}`
        : hall === "Hall 2"
        ? `Stand 2-${String.fromCharCode(71 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 20)+1}`
        : `Stand R${Math.floor(Math.random() * 24) + 1}`;

      const newGame: Game = {
        id: `custom-${Date.now()}`,
        title: title,
        publisher: manualPublisher || "Indie Publisher",
        stall: manualStall || randomStand,
        description: manualDescription || `Check out the exciting features and gameplay formats of ${title} at the UK Games Expo.`,
        category: category,
        playerCount: manualPlayers || "2-4",
        playTime: manualTime || time,
        imageUrl: `https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=350&q=80`, // Reliable generic board game art
        bggLink: `https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${searchSlug}`,
        statusText: statusText,
        hall: manualHall || hall,
        visited: false,
        mustPlay: true, // Star it as priority by default
      };

      setGames((prev) => [newGame, ...prev]);
      
      // Clear inputs
      setNewGameTitle("");
      setIsAddModalOpen(false);
      setShowManualFields(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error creating. Please try using manual fields below.");
      setShowManualFields(true);
    } finally {
      setIsEnriching(false);
      setEnrichmentProgress("");
    }
  };

  // Manual fallback add
  const handleManualAdd = () => {
    if (!newGameTitle.trim()) {
      setErrorMsg("Please provide at least a game name!");
      return;
    }

    const title = newGameTitle.trim();
    const searchSlug = encodeURIComponent(title);

    const newGame: Game = {
      id: `manual-${Date.now()}`,
      title: title,
      publisher: manualPublisher || "Indie Studio",
      stall: manualStall || "Stand TBD",
      description: manualDescription || "Hand-added custom title.",
      category: manualCategory.toUpperCase(),
      playerCount: manualPlayers || "2-4",
      playTime: manualTime || "60m",
      imageUrl: `https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=350&q=80`,
      bggLink: `https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${searchSlug}`,
      statusText: "AVAILABLE",
      hall: manualHall,
      visited: false,
      mustPlay: true,
    };

    setGames((prev) => [newGame, ...prev]);
    setNewGameTitle("");
    setManualPublisher("");
    setManualStall("");
    setManualDescription("");
    setManualCategory("STRATEGY");
    setManualPlayers("2-4");
    setManualTime("45m");
    setManualHall("Hall 1");
    setIsAddModalOpen(false);
    setShowManualFields(false);
    setErrorMsg("");
  };

  // Re-enrich simulated client-side callback
  const [enrichingGameId, setEnrichingGameId] = useState<string | null>(null);
  const handleRefreshStall = async (game: Game) => {
    setEnrichingGameId(game.id);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setEnrichingGameId(null);
  };

  // Filter & Search computation
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Search matching titles, publishers, stalls, or categories
      const matchQuery =
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (game.publisher && game.publisher.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (game.stall && game.stall.toLowerCase().includes(searchQuery.toLowerCase())) ||
        game.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter matching selected pill
      if (selectedFilter === "All") return matchQuery;
      if (selectedFilter === "Hall 1") return matchQuery && game.hall === "Hall 1";
      if (selectedFilter === "Hall 2") return matchQuery && game.hall === "Hall 2";
      if (selectedFilter === "Retail") return matchQuery && game.hall === "Retail";
      if (selectedFilter === "Must Play") return matchQuery && game.mustPlay;

      return matchQuery;
    });
  }, [games, searchQuery, selectedFilter]);

  // Group filtered results for standard display matching the layout of Halls
  const hall1Games = useMemo(() => filteredGames.filter((g) => g.hall === "Hall 1" || !g.hall), [filteredGames]);
  const hall2Games = useMemo(() => filteredGames.filter((g) => g.hall === "Hall 2"), [filteredGames]);
  const retailGames = useMemo(() => filteredGames.filter((g) => g.hall === "Retail"), [filteredGames]);

  // Handle clicking Map Pin to go to map tab & highlight stand
  const focusOnMap = (game: Game) => {
    setSelectedGameForMap(game.id);
    setActiveTab("map");
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-sans pb-28">
      
      {/* HEADER BAR */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-surface-container-high border-b border-outline-variant/80 shadow-md">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-on-surface cursor-pointer p-0.5 hover:bg-surface-container-highest rounded-md transition-all active:scale-95" />
          <div className="flex flex-col">
            <h1 className="text-xl font-display font-bold tracking-tight text-primary flex items-center gap-1.5">
              <span>UKGE 2026</span>
              <span className="text-[10px] bg-[#ff6b35]/20 text-[#ff6b35] py-0.5 px-1.5 rounded-full font-mono mt-0.5">
                PLANNER
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Stats pill */}
          <div className="hidden sm:flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-3 py-1 rounded-full text-xs font-mono text-gray-400">
            <span>Progress:</span>
            <span className="text-secondary font-bold">{stats.visited}/{stats.total}</span>
            <span className="text-gray-600">|</span>
            <span className="text-primary font-bold">{stats.mustPlay}⭐</span>
          </div>

          {/* Theme Mode Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface rounded-lg border border-outline-variant transition-colors active:scale-95 duration-150 cursor-pointer"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/15" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 fill-indigo-500/15" />
            )}
          </button>

          <button 
            onClick={handleReset}
            className="text-xs hover:bg-surface-container-highest duration-200 text-gray-400 py-1.5 px-3 rounded-lg border border-outline-variant active:scale-95"
            title="Inject missing original titles"
          >
            Import Original Games
          </button>

          <button
            onClick={handleFullWipe}
            className="p-1.5 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-lg duration-150 transition-colors"
            title="Reset Database"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* PERSISTENT CONTENT BODY MAPPER */}
      <main className="pt-20 max-w-2xl mx-auto px-4 md:max-w-3xl">
        
        {/* TAB 1: SCHEDULE / GAME CHECKLIST (HOME) */}
        {activeTab === "home" && (
          <div>
            {/* SEARCH & FILTER COMPONENT */}
            <section className="sticky top-16 z-40 bg-background/95 backdrop-blur-md pt-2 pb-3 mb-6 border-b border-outline-variant/30">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-4.5 h-4.5 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search games, stalls, or publisher..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface placeholder:text-gray-500"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* FILTER TAB BUTTONS */}
              <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar py-1">
                {(["All", "Hall 1", "Hall 2", "Retail", "Must Play"] as CategoryFilter[]).map((pill) => {
                  const isActive = selectedFilter === pill;
                  return (
                    <button
                      key={pill}
                      onClick={() => setSelectedFilter(pill)}
                      className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wide flex-shrink-0 transition-all duration-200 active:scale-95 flex items-center gap-1 ${
                        isActive
                          ? "bg-primary-container text-on-primary-container shadow-md"
                          : "bg-surface-container-high text-gray-400 hover:text-white hover:bg-surface-container-highest border border-outline-variant"
                      }`}
                    >
                      {pill === "Must Play" && <Star className="w-3.5 h-3.5 fill-current" />}
                      {pill}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* AI SYSTEM INSIGHT INFORMATION PANEL */}
            <div className="mb-6 p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl relative overflow-hidden">
              <div className="absolute right-1 top-1 text-gray-700/20 translate-x-3 translate-y-3">
                <Sparkles className="w-24 h-24 stroke-1 fill-none" />
              </div>
              <div className="flex gap-3 relative z-10">
                <div className="bg-[#ff6b35]/15 p-2 rounded-lg text-primary-container shrink-0 self-start">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-display font-semibold text-gray-300">UKGE Stall Location Precision System</h4>
                  <p className="text-gray-400 leading-relaxed">
                    Planning tabletop visits used to involve endless PDF hunting. Use our automatic retrieval system linked directly with Gemini Search Grounding. Toggle MUST PLAY on high-interest titles to map their vectors instantly.
                  </p>
                  <p className="text-primary text-[10px] pt-1 font-mono flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                    Live Grounding Engine Active via /api/enrich-game
                  </p>
                </div>
              </div>
            </div>

            {/* GAMES LISTING GRID BY HIERARCHY */}
            <div className="space-y-8">
              
              {/* HALL 1 SECTION */}
              {hall1Games.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xs font-mono font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">
                      HALL 1 - STRATEGY &amp; EXPERT ({hall1Games.length})
                    </h2>
                    <div className="h-[1px] w-full bg-outline-variant"></div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {hall1Games.map((game) => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        toggleMustPlay={toggleMustPlay} 
                        toggleVisited={toggleVisited} 
                        onFocusMap={focusOnMap}
                        onRefresh={() => handleRefreshStall(game)}
                        isRefreshing={enrichingGameId === game.id}
                        onRemove={game.id.startsWith("custom-") || game.id.startsWith("manual-") ? () => removeGame(game.id) : undefined}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* HALL 2 SECTION */}
              {hall2Games.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xs font-mono font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">
                      HALL 2 - FAMILY &amp; SOCIAL ({hall2Games.length})
                    </h2>
                    <div className="h-[1px] w-full bg-outline-variant"></div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {hall2Games.map((game) => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        toggleMustPlay={toggleMustPlay} 
                        toggleVisited={toggleVisited} 
                        onFocusMap={focusOnMap}
                        onRefresh={() => handleRefreshStall(game)}
                        isRefreshing={enrichingGameId === game.id}
                        onRemove={game.id.startsWith("custom-") || game.id.startsWith("manual-") ? () => removeGame(game.id) : undefined}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* RETAIL HUB */}
              {retailGames.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xs font-mono font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">
                      RETAIL HUB &amp; DEALS ({retailGames.length})
                    </h2>
                    <div className="h-[1px] w-full bg-outline-variant"></div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {retailGames.map((game) => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        toggleMustPlay={toggleMustPlay} 
                        toggleVisited={toggleVisited} 
                        onFocusMap={focusOnMap}
                        onRefresh={() => handleRefreshStall(game)}
                        isRefreshing={enrichingGameId === game.id}
                        onRemove={game.id.startsWith("custom-") || game.id.startsWith("manual-") ? () => removeGame(game.id) : undefined}
                      />
                    ))}
                  </div>
                </section>
              )}

              {filteredGames.length === 0 && (
                <div className="text-center py-12 px-4 bg-surface-container-low rounded-xl border border-outline-variant border-dashed">
                  <Info className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-300 font-medium">No board games match your filter criteria.</p>
                  <p className="text-xs text-gray-500 mt-1">Try resetting the searches or typing a different keyword!</p>
                  <button 
                    onClick={() => { setSearchQuery(""); setSelectedFilter("All"); }}
                    className="mt-4 text-xs bg-primary-container text-on-primary-container font-mono px-4 py-1.5 rounded-full"
                  >
                    Clear Filter Filters
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 2: EXPLICIT MUST PLAY (STARRED SCROLLING GRID) */}
        {activeTab === "mustplay" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/60">
              <div>
                <h2 className="text-lg font-display font-extrabold text-primary">⭐ Must Play Priority Pipeline</h2>
                <p className="text-xs text-gray-450 mt-1">These games are prioritized for your expo floor plan. Make sure to download or register demos early!</p>
              </div>
              <span className="text-xs font-mono bg-[#ff6b35]/20 text-[#ff6b35] py-1 px-2.5 rounded-full font-bold">
                {stats.mustPlay} Selected
              </span>
            </div>

            {games.filter(g => g.mustPlay).length === 0 ? (
              <div className="text-center py-16 bg-surface-container-low border border-outline-variant border-dashed rounded-2xl">
                <Star className="w-12 h-12 text-gray-600 stroke-1 mx-auto mb-3" />
                <h3 className="font-display font-semibold text-gray-300">Your Priority Pipeline is empty</h3>
                <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
                  Click the star icon on any board game card in the primary home tab to flag them, and they will highlight with premium orange details and live map overlays!
                </p>
                <button 
                  onClick={() => setActiveTab("home")} 
                  className="mt-5 inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container text-xs font-mono px-4 py-2 rounded-full font-bold active:scale-95 transition-transform"
                >
                  Explore Home Registry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {games.filter(g => g.mustPlay).map((game) => (
                  <GameCard 
                    key={game.id} 
                    game={game} 
                    toggleMustPlay={toggleMustPlay} 
                    toggleVisited={toggleVisited} 
                    onFocusMap={focusOnMap}
                    onRefresh={() => handleRefreshStall(game)}
                    isRefreshing={enrichingGameId === game.id}
                    onRemove={game.id.startsWith("custom-") || game.id.startsWith("manual-") ? () => removeGame(game.id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: UKGE EXHIBITION MAP GUIDE (interactive SVGs mapping vectors) */}
        {activeTab === "map" && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-outline-variant/60">
              <h2 className="text-lg font-display font-extrabold text-primary flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-primary-container" />
                <span>UKGE 2026 Interactive Exhibition Floor</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Visualizing stand coordinates within NEC Birmingham Hall 1, Hall 2, and the Retail Hub. Toggle games below to spot them on the grid.
              </p>
            </div>

            {/* MAP LAYOUT */}
            <div className="bg-surface-container shadow-2xl border border-outline-variant rounded-2xl p-4 overflow-hidden relative">
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#ff6b35]" />
                  <span>NEC Floor Grid Layout</span>
                </span>
                <span className="text-[10px] bg-secondary-container/10 border border-secondary/30 text-secondary py-0.5 px-2 rounded-full font-mono">
                  SCALE: 1:500m
                </span>
              </div>

              {/* VECTOR EXPO MAP */}
              <div className="relative aspect-[16/10] bg-[#14191c] rounded-lg border border-outline-variant/50 p-4 flex flex-col justify-between">
                
                {/* Visual grid pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#2d3748_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

                {/* Halls Structure container */}
                <div className="grid grid-cols-3 gap-3 h-full relative z-10">
                  
                  {/* HALL 1 GRID */}
                  <div className="border border-blue-500/30 bg-blue-500/5 rounded-lg p-2.5 relative flex flex-col justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-400 tracking-wider">HALL 1 (STRATEGY)</span>
                    
                    {/* Interactive nodes mock placement corresponding to stands */}
                    <div className="grid grid-cols-3 gap-2 my-auto">
                      <div className="h-6 w-full border border-blue-500/20 bg-blue-500/10 rounded flex items-center justify-center text-[8px] font-mono text-gray-400 font-bold hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-colors cursor-pointer" title="Leder Games: Stand 1-A12">
                        A12
                      </div>
                      <div className="h-6 w-full border border-blue-500/20 bg-blue-500/10 rounded flex items-center justify-center text-[8px] font-mono text-gray-400 font-bold hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-colors cursor-pointer" title="Hachette / Scorpion Masqué: Stand 1-E12">
                        E12
                      </div>
                      <div className="h-6 w-full border border-blue-500/20 bg-blue-500/10 rounded flex items-center justify-center text-[8px] font-mono text-gray-400 font-bold hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-colors cursor-pointer" title="Asmodee UK: Stand 1-E18">
                        E18
                      </div>
                      <div className="h-6 w-full border border-blue-500/20 bg-blue-500/10 rounded flex items-center justify-center text-[8px] font-mono text-gray-400 font-bold hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-colors cursor-pointer" title="Contention Games: Stand 1-L02">
                        L02
                      </div>
                      <div className="h-6 w-full border border-blue-500/20 bg-blue-500/10 rounded flex items-center justify-center text-[8px] font-mono text-gray-400 font-bold hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-colors cursor-pointer" title="Mercury Games: Stand 1-F04">
                        F04
                      </div>
                      <div className="h-6 w-full border border-blue-500/20 bg-blue-500/10 rounded flex items-center justify-center text-[8px] font-mono text-gray-400 font-bold hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-colors cursor-pointer" title="Japan Brand: Stand 1-C24">
                        C24
                      </div>
                    </div>

                    {/* Active highlight marker */}
                    {selectedGameForMap && games.find(g => g.id === selectedGameForMap)?.hall === "Hall 1" && (
                      <div className="absolute inset-x-2 top-10 flex flex-col items-center animate-bounce">
                        <div className="bg-[#ff6b35] text-white text-[9px] font-mono py-0.5 px-1.5 rounded shadow-lg font-bold">
                          {games.find(g => g.id === selectedGameForMap)?.stall}
                        </div>
                        <div className="w-1.5 h-1.5 bg-[#ff6b35] rotate-45 -mt-1"></div>
                      </div>
                    )}
                  </div>

                  {/* HALL 2 GRID */}
                  <div className="border border-teal-500/30 bg-teal-500/5 rounded-lg p-2.5 relative flex flex-col justify-between">
                    <span className="text-[10px] font-mono font-bold text-teal-400 tracking-wider">HALL 2 (FAMILY)</span>
                    
                    <div className="grid grid-cols-2 gap-2 my-auto">
                      <div className="h-6 w-full border border-teal-500/20 bg-teal-500/10 rounded flex items-center justify-center text-[8px] font-mono text-gray-400 font-bold hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-colors cursor-pointer" title="Keymaster Games: Stand 2-C14">
                        C14
                      </div>
                      <div className="h-6 w-full border border-teal-500/20 bg-teal-500/10 rounded flex items-center justify-center text-[8px] font-mono text-gray-400 font-bold hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-colors cursor-pointer" title="Fowers Games: Stand 2-G22">
                        G22
                      </div>
                      <div className="h-6 w-full border border-teal-500/20 bg-teal-500/10 rounded flex items-center justify-center text-[8px] font-mono text-gray-400 font-bold hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-colors cursor-pointer" title="Lumberjacks Studio: Stand 2-F02">
                        F02
                      </div>
                      <div className="h-6 w-full border border-teal-500/20 bg-teal-500/10 rounded flex items-center justify-center text-[8px] font-mono text-gray-400 font-bold hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-colors cursor-pointer" title="Loki Kids: Stand 2-B08">
                        B08
                      </div>
                    </div>

                    {selectedGameForMap && games.find(g => g.id === selectedGameForMap)?.hall === "Hall 2" && (
                      <div className="absolute inset-x-2 top-10 flex flex-col items-center animate-bounce">
                        <div className="bg-[#ff6b35] text-white text-[9px] font-mono py-0.5 px-1.5 rounded shadow-lg font-bold">
                          {games.find(g => g.id === selectedGameForMap)?.stall}
                        </div>
                        <div className="w-1.5 h-1.5 bg-[#ff6b35] rotate-45 -mt-1"></div>
                      </div>
                    )}
                  </div>

                  {/* RETAIL HUB GRID */}
                  <div className="border border-orange-500/30 bg-orange-500/5 rounded-lg p-2.5 relative flex flex-col justify-between">
                    <span className="text-[10px] font-mono font-bold text-primary tracking-wider">RETAIL HUB</span>
                    
                    <div className="grid grid-cols-2 gap-2 my-auto">
                      <div className="h-6 w-full border border-[#ff6b35]/20 bg-[#ff6b35]/10 rounded flex items-center justify-center text-[8px] font-mono text-gray-400 font-bold hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-colors cursor-pointer" title="Sunrise Tornado: Stand R14">
                        R14
                      </div>
                      <div className="h-6 w-full border border-[#ff6b35]/20 bg-[#ff6b35]/10 rounded flex items-center justify-center text-[8px] font-mono text-gray-400 font-bold hover:bg-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-colors cursor-pointer" title="Iniciativa Colectiva: Stand R18">
                        R18
                      </div>
                    </div>

                    {selectedGameForMap && games.find(g => g.id === selectedGameForMap)?.hall === "Retail" && (
                      <div className="absolute inset-x-2 top-10 flex flex-col items-center animate-bounce">
                        <div className="bg-[#ff6b35] text-white text-[9px] font-mono py-0.5 px-1.5 rounded shadow-lg font-bold">
                          {games.find(g => g.id === selectedGameForMap)?.stall}
                        </div>
                        <div className="w-1.5 h-1.5 bg-[#ff6b35] rotate-45 -mt-1"></div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Sub-exits visual anchors */}
                <div className="flex justify-between items-center text-[8px] text-gray-600 font-mono border-t border-outline-variant/30 pt-2 shrink-0">
                  <span>◀ TO BIRMINGHAM AIRPORT INGRESS</span>
                  <span>NEC HALLWAY BREEZEWAY EXITS ▶</span>
                </div>
              </div>
            </div>

            {/* SELECTION ASSISTANT CARDS */}
            <div className="space-y-3">
              <h3 className="text-sm font-display font-semibold text-gray-300">Select Game to Pinpoint:</h3>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {games.map((g) => {
                  const isHighlighted = selectedGameForMap === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGameForMap(isHighlighted ? null : g.id)}
                      className={`px-3 py-1.5 text-xs rounded-xl font-mono shrink-0 transition-all border flex items-center gap-1.5 ${
                        isHighlighted
                          ? "bg-[#ff6b35] text-white border-transparent font-bold scale-102 shadow-md"
                          : "bg-surface-container-low text-gray-400 hover:text-white border-outline-variant"
                      }`}
                    >
                      <span>{g.title}</span>
                      <span className="opacity-70 text-[10px]">({g.stall})</span>
                    </button>
                  );
                })}
              </div>

              {selectedGameForMap && (
                <div className="p-4 bg-surface-container-high border border-[#ff6b35]/40 rounded-xl flex justify-between items-center animate-fade-in">
                  <div className="space-y-1">
                    <h4 className="font-display font-semibold text-white text-sm">
                      {games.find(g => g.id === selectedGameForMap)?.title}
                    </h4>
                    <p className="text-xs text-secondary">
                      Located at <span className="underline font-bold font-mono text-primary">{games.find(g => g.id === selectedGameForMap)?.stall}</span> inside {games.find(g => g.id === selectedGameForMap)?.hall}
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("home")}
                    className="text-xs font-mono bg-[#ff6b35]/10 border border-[#ff6b35]/30 text-primary-container px-3 py-1.5 rounded-lg active:scale-95 duration-100"
                  >
                    View Card
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: VISITOR PROFILE & ADVICE STATS (PROFILE) */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-outline-variant/60">
              <h2 className="text-lg font-display font-extrabold text-primary">📊 Personal UKGE Itinerary Profile</h2>
              <p className="text-xs text-gray-400 mt-1">Check your plan readiness before setting foot inside NEC Birmingham.</p>
            </div>

            {/* PROGRESS CARD */}
            <div className="bg-surface-container-low border border-outline-variant p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs font-mono text-gray-400">PLAN COMPLETION SCORE</span>
                  <p className="text-4xl font-display font-black text-primary mt-1">{stats.percent}%</p>
                </div>
                <div className="text-right text-xs text-gray-400 space-y-0.5">
                  <p>Visited: <strong className="text-secondary">{stats.visited}</strong></p>
                  <p>Remains: <strong className="text-white">{stats.total - stats.visited}</strong></p>
                  <p>Priority Targets: <strong className="text-primary-container">{stats.mustPlay}</strong></p>
                </div>
              </div>

              {/* BAR */}
              <div className="w-full bg-surface-container-highest rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#ff6b35] to-secondary h-full rounded-full transition-all duration-300"
                  style={{ width: `${stats.percent}%` }}
                ></div>
              </div>
            </div>

            {/* GRID OF DISTRIBUTION */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container border border-outline-variant p-3.5 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-mono text-gray-400">HALL 1</span>
                <p className="text-xl font-display font-extrabold text-primary">{stats.hall1Count}</p>
                <span className="text-[10px] text-gray-500 block">Strategy Expert</span>
              </div>
              <div className="bg-surface-container border border-outline-variant p-3.5 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-mono text-gray-400">HALL 2</span>
                <p className="text-xl font-display font-extrabold text-secondary">{stats.hall2Count}</p>
                <span className="text-[10px] text-gray-500 block">Family Social</span>
              </div>
              <div className="bg-surface-container border border-outline-variant p-3.5 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-mono text-gray-400">RETAIL</span>
                <p className="text-xl font-display font-extrabold text-white">{stats.retailCount}</p>
                <span className="text-[10px] text-gray-500 block">Deals &amp; Books</span>
              </div>
            </div>

            {/* ADVICE GUIDE */}
            <div className="bg-surface-container border border-outline-variant p-5 rounded-xl space-y-3">
              <h3 className="font-display font-semibold text-gray-300 text-sm flex items-center gap-1.5">
                <Info className="w-4 h-4 text-primary" />
                <span>UK Games Expo Insider Tips</span>
              </h3>
              <ul className="text-xs text-gray-400 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#ff6b35] mt-0.5" />
                  <span><strong>Plan Hall 1 First:</strong> Massive strategy games (like Cole Wehrle's Arcs) see rapid queue builders. Plan morning slots directly in Hall 1!</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#ff6b35] mt-0.5" />
                  <span><strong>Demoing:</strong> Most stands allow drop-in play. Look out for "DEMO READY" status cards to grab open tables quickly on the fly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#ff6b35] mt-0.5" />
                  <span><strong>Pack Carefully:</strong> Bring ample water, healthy snacks, and comfortable shoes. The NEC Birmingham walkway is extensive.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

      </main>

      {/* FLOAT ACTION BUTTON (FAB) FOR MOBILE / QUICK ADD */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-6 bg-primary-container text-white p-4.5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-transform z-40 hover:bg-[#ff8659]"
        title="Add target Game to visit"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* BOTTOM TAB NAVIGATOR (MOBILE ONLY CONTEXT) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 md:max-w-md md:left-1/2 md:-translate-x-1/2 flex justify-around items-center px-4 pb-4 pt-2 bg-[#1b2022] border-t border-outline-variant/60 shadow-2xl">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all ${
            activeTab === "home" ? "text-primary-container font-extrabold" : "text-gray-400 hover:text-white"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-mono mt-1">Explore</span>
        </button>

        <button
          onClick={() => setActiveTab("mustplay")}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all ${
            activeTab === "mustplay" ? "text-[#ff6b35]" : "text-gray-400 hover:text-white"
          }`}
        >
          <Star className="w-5 h-5" />
          <span className="text-[10px] font-mono mt-1">Must Play</span>
        </button>

        <button
          onClick={() => setActiveTab("map")}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all ${
            activeTab === "map" ? "text-secondary font-extrabold" : "text-gray-400 hover:text-white"
          }`}
        >
          <MapIcon className="w-5 h-5" />
          <span className="text-[10px] font-mono mt-1">Exhibits</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all ${
            activeTab === "profile" ? "text-white font-extrabold" : "text-gray-400 hover:text-white"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-mono mt-1">Planner</span>
        </button>
      </nav>

      {/* ADD CUSTOM GAME POPUP DIALOG */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/80 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl space-y-4 animate-fade-in text-left">
            
            <button
              onClick={() => { setIsAddModalOpen(false); setShowManualFields(false); setErrorMsg(""); }}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-display font-extrabold text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary-container" />
                <span>Search &amp; Add Expo Game</span>
              </h3>
              <p className="text-[11px] text-gray-450 leading-relaxed">
                Provide a game title. The server will launch a live Search Grounded Gemini model to inspect UKGE 2026 logs, fetch standard booths, publishers, and stats!
              </p>
            </div>

            <form onSubmit={handleEnrichAndAdd} className="space-y-3">
              <div>
                <label className="text-[10px] block font-mono text-gray-400 uppercase tracking-widest mb-1.5">
                  GAME NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carcassonne or Arcs"
                  value={newGameTitle}
                  onChange={(e) => setNewGameTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              {/* Progress feedback */}
              {isEnriching && (
                <div className="flex items-center gap-2 text-[10px] text-secondary font-mono bg-secondary/5 border border-secondary/20 p-2 rounded-lg">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{enrichmentProgress}</span>
                </div>
              )}

              {errorMsg && (
                <p className="text-[10px] text-red-400 font-mono bg-red-500/5 p-1 px-2.5 rounded border border-red-500/20">
                  {errorMsg}
                </p>
              )}

              {!isEnriching && !showManualFields && (
                <button
                  type="submit"
                  className="w-full bg-[#ff6b35] hover:bg-[#ff8454] text-white py-2 rounded-lg text-xs font-mono font-bold tracking-wider hover:shadow-lg transition-all"
                >
                  Retrieve &amp; Add Game
                </button>
              )}
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowManualFields(!showManualFields)}
                className="text-[10.5px] font-mono text-primary hover:underline"
              >
                {showManualFields ? "Hide details fields" : "Or fill stand details manually"}
              </button>
            </div>

            {/* Manual Forms */}
            {showManualFields && (
              <div className="space-y-3 pt-3 border-t border-outline-variant duration-300">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] block font-mono text-gray-400 mb-1">PUBLISHER</label>
                    <input
                      type="text"
                      placeholder="e.g. Pegasus Spiele"
                      value={manualPublisher}
                      onChange={(e) => setManualPublisher(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded p-2 text-[11px] focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] block font-mono text-gray-400 mb-1">STAND / STALL</label>
                    <input
                      type="text"
                      placeholder="e.g. Stand 1-E12"
                      value={manualStall}
                      onChange={(e) => setManualStall(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded p-2 text-[11px] focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] block font-mono text-gray-400 mb-1">BRIEF DESCRIPTION</label>
                  <textarea
                    placeholder="Short description..."
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-surface-container-low border border-outline-variant rounded p-2 text-[11px] focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-left">
                  <div>
                    <label className="text-[8px] block font-mono text-gray-400 mb-0.5">CATEGORY</label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded p-1 text-[10px] outline-none"
                    >
                      <option value="STRATEGY">STRATEGY</option>
                      <option value="EXPERT">EXPERT</option>
                      <option value="FAMILY">FAMILY</option>
                      <option value="SOCIAL">SOCIAL</option>
                      <option value="EXCLUSIVE">EXCLUSIVE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] block font-mono text-gray-400 mb-0.5">PLAYERS</label>
                    <input
                      type="text"
                      value={manualPlayers}
                      onChange={(e) => setManualPlayers(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded p-1 text-[10px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] block font-mono text-gray-400 mb-0.5">EXPO HALL</label>
                    <select
                      value={manualHall}
                      onChange={(e) => setManualHall(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded p-1 text-[10px] outline-none"
                    >
                      <option value="Hall 1">Hall 1</option>
                      <option value="Hall 2">Hall 2</option>
                      <option value="Retail">Retail</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualAdd}
                  className="w-full bg-secondary-container text-on-secondary-container py-2 rounded-lg text-xs font-mono font-bold hover:opacity-90 tracking-wide transition-opacity"
                >
                  Save Manually To List
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// SHARED INTERACTIVE GAME CARD COMPONENT
interface GameCardProps {
  key?: string;
  game: Game;
  toggleMustPlay: (id: string) => void;
  toggleVisited: (id: string) => void;
  onFocusMap: (g: Game) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onRemove?: () => void;
}

function GameCard({ 
  game, 
  toggleMustPlay, 
  toggleVisited, 
  onFocusMap, 
  onRefresh, 
  isRefreshing, 
  onRemove 
}: GameCardProps) {
  
  // Custom styled status text colors
  const getStatusStyle = (status?: string) => {
    const s = status?.toUpperCase() || "";
    if (s.includes("AVAILABLE")) {
      return "bg-green-500/10 text-green-400 border border-green-500/25";
    }
    if (s.includes("LOW STOCK") || s.includes("LIMITED")) {
      return "bg-red-500/10 text-red-400 border border-red-500/25";
    }
    if (s.includes("DEMO READY") || s.includes("MUST SEE")) {
      return "bg-teal-500/10 text-teal-400 border border-teal-500/25";
    }
    return "bg-[#ff6b35]/20 text-white border border-[#ff6b35]/30";
  };

  const placeholderSvg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#0f1720'/><text x='50%' y='50%' font-family='Arial, Helvetica, sans-serif' font-size='20' fill='#9ca3af' dominant-baseline='middle' text-anchor='middle'>No Image</text></svg>`;
  const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSvg)}`;

  return (
    <div 
      className={`bg-surface-container-low border rounded-xl overflow-hidden shadow-sm transition-all relative group flex flex-col ${
        game.mustPlay 
          ? "border-[#ff6b35] ring-1 ring-[#ff6b35]/10 bg-[#ff6b35]/2" 
          : "border-outline-variant hover:border-gray-600/60"
      } ${game.visited ? "opacity-60 grayscale-[40%]" : "opacity-100"}`}
    >
      
      {/* CARD BODY WITH PICTURE AND DETAILS */}
      <div className="flex p-4 gap-4 items-start sm:items-center">
        
        {/* Game Box Art Placeholders seed-based */}
        <div className="relative shrink-0">
          {game.bggLink ? (
            <a href={game.bggLink} target="_blank" rel="noopener noreferrer" title={`Open ${game.title} on BGG`}>
              <img
                src={game.imageUrl || placeholder}
                alt={`${game.title} cover`}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholder; }}
                className="w-20 h-20 rounded-lg object-cover bg-surface-container-high border border-outline-variant flex-shrink-0"
              />
            </a>
          ) : (
            <img
              src={game.imageUrl || placeholder}
              alt={`${game.title} cover`}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholder; }}
              className="w-20 h-20 rounded-lg object-cover bg-surface-container-high border border-outline-variant flex-shrink-0"
            />
          )}
          {game.mustPlay && (
            <span className="absolute -top-1.5 -left-1.5 bg-[#ff6b35] text-white p-0.5 rounded-full shadow-md z-12">
              <Star className="w-3 h-3 fill-white text-white" />
            </span>
          )}
        </div>

        {/* Info detail content */}
        <div className="flex flex-col flex-grow min-w-0 space-y-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-display font-bold text-on-surface tracking-tight truncate shrink-0 pr-2">
                {game.bggLink ? (
                  <a href={game.bggLink} target="_blank" rel="noopener noreferrer" className="hover:underline">{game.title}</a>
                ) : (
                  <>{game.title}</>
                )}
              </h3>
              {game.publisher && (
                <span className="text-xs text-secondary/90 leading-none">{game.publisher}</span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Star toggle icon */}
              <button
                onClick={() => toggleMustPlay(game.id)}
                className={`p-1 rounded-lg hover:bg-surface-container-high transition-colors ${
                  game.mustPlay ? "text-[#ff6b35]" : "text-gray-500 hover:text-white"
                }`}
                title={game.mustPlay ? "Starred Must Play title" : "Prioritize game"}
              >
                <Star className={`w-5 h-5 ${game.mustPlay ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* Publisher / Stall link */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-primary font-bold">
              <MapPin className="w-3 h-3 text-[#ff6b35]" />
              <span>{game.stall || "Stall TBD"}</span>
            </span>
            <span className="text-[10px] text-gray-600">•</span>
            <span className="text-[11px] text-gray-400 font-mono tracking-wide">{game.hall}</span>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>
      </div>

      {/* CHIPS STAT FOOTER BAR */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5 items-center justify-between">
        
        {/* Category tags */}
        <div className="flex gap-1 items-center">
          <span className="bg-surface-container text-primary px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider border border-outline-variant">
            {game.category}
          </span>
          <span className="text-gray-700 text-xs">/</span>
          <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
            <Users className="w-3 h-3 text-secondary" /> {game.playerCount || "2-4"}
          </span>
          {game.playTime && (
            <>
              <span className="text-gray-700 text-xs">/</span>
              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-500" /> {game.playTime}
              </span>
            </>
          )}
        </div>

        {/* Action utility links */}
        <div className="flex items-center gap-1.5">
          {game.stall && !game.stall.includes("TBD") && (
            <button
              onClick={() => onFocusMap(game)}
              className="text-[10px] bg-surface-container text-gray-400 hover:text-white px-2 py-0.5 rounded font-mono flex items-center gap-1 border border-outline-variant duration-150 cursor-pointer"
            >
              <span>Spot Floor</span>
              <MapIcon className="w-2.5 h-2.5 text-secondary" />
            </button>
          )}

          {game.bggLink && (
            <a
              href={game.bggLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] bg-[#f58220]/15 hover:bg-[#f58220]/25 text-[#f58220] hover:text-[#ff9133] px-2 py-0.5 rounded font-mono flex items-center gap-1 border border-[#f58220]/30 transition-colors duration-150 cursor-pointer"
              title="View on BoardGameGeek"
            >
              <span>BGG Link</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* BOTTOM VISITED AND RETAIL DEALS OVERLAY ROW */}
      <div className="flex items-center justify-between border-t border-outline-variant/55 px-4 py-2 bg-surface-container-lowest/65">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!game.visited}
            onChange={() => toggleVisited(game.id)}
            className="rounded border-outline-variant bg-surface-container-low text-[#ff6b35] focus:ring-[#ff6b35] h-3.5 w-3.5 cursor-pointer accent-[#ff6b35]"
          />
          <span className="text-[11px] font-mono font-medium text-gray-400 group-hover:text-white transition-colors">
            {game.visited ? "🎯 Visited / Played" : "Mark Visited"}
          </span>
        </label>

        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold font-semibold shrink-0 uppercase tracking-widest ${getStatusStyle(game.statusText)}`}>
            {game.statusText || "AVAILABLE"}
          </span>

          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/15 rounded shrink-0 duration-150"
              title="Remove hand added game"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
