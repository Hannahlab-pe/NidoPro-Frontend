import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  GraduationCap,
  User,
  School,
  FileText,
  Loader2,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Categorías de resultados ────────────────────────────────────────────────
const CATEGORIES = {
  estudiantes: {
    label: "Estudiantes",
    icon: GraduationCap,
    color: "text-blue-600",
    bg: "bg-blue-50",
    getTitle: (item) => `${item.nombre} ${item.apellido}`,
    getSub: (item) =>
      [item.nroDocumento && `DNI ${item.nroDocumento}`, item.grado]
        .filter(Boolean)
        .join(" · "),
    getPath: (item) => "/admin/estudiantes",
  },
  trabajadores: {
    label: "Trabajadores",
    icon: User,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    getTitle: (item) => `${item.nombre} ${item.apellido}`,
    getSub: (item) =>
      [item.nroDocumento && `DNI ${item.nroDocumento}`, item.rol]
        .filter(Boolean)
        .join(" · "),
    getPath: (item) => `/admin/trabajadores/${item.idTrabajador}`,
  },
  aulas: {
    label: "Aulas",
    icon: School,
    color: "text-amber-600",
    bg: "bg-amber-50",
    getTitle: (item) =>
      `Sección ${item.seccion}${item.grado ? ` — ${item.grado}` : ""}`,
    getSub: (item) =>
      item.cantidadEstudiantes != null
        ? `${item.cantidadEstudiantes} estudiantes`
        : "",
    getPath: (item) => "/admin/aulas",
  },
};

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Flatten results for keyboard nav
  const flatItems = results
    ? Object.entries(results).flatMap(([cat, items]) =>
        items.map((item) => ({ ...item, _cat: cat }))
      )
    : [];

  // ── Search API ──────────────────────────────────────────────────────────────
  const search = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/search", {
        params: { q, limit: 5 },
      });
      const info = data.info || data;
      setResults({
        estudiantes: info.estudiantes || [],
        trabajadores: info.trabajadores || [],
        aulas: info.aulas || [],
      });
    } catch {
      setResults({ estudiantes: [], trabajadores: [], aulas: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce input
  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIdx(-1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  // ── Open/close ──────────────────────────────────────────────────────────────
  const openSearch = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setOpen(false);
    setQuery("");
    setResults(null);
    setSelectedIdx(-1);
  };

  // Keyboard shortcut: Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        open ? closeSearch() : openSearch();
      }
      if (e.key === "Escape" && open) closeSearch();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        closeSearch();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Navigate to result
  const goTo = (item) => {
    const cat = CATEGORIES[item._cat];
    closeSearch();
    navigate(cat.getPath(item));
  };

  // Keyboard nav
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIdx >= 0 && flatItems[selectedIdx]) {
      e.preventDefault();
      goTo(flatItems[selectedIdx]);
    }
  };

  const totalResults = flatItems.length;
  const hasQuery = query.length >= 2;
  const noResults = hasQuery && !loading && results && totalResults === 0;

  return (
    <>
      {/* Trigger button in navbar */}
      <button
        onClick={openSearch}
        className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-white/70 hover:text-white text-sm w-64 lg:w-80"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Buscar...</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white/50 font-mono">
          Ctrl K
        </kbd>
      </button>

      {/* Overlay + Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Search container */}
          <div
            ref={containerRef}
            className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Buscar estudiantes, trabajadores, aulas..."
                className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
                autoComplete="off"
              />
              {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />}
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setResults(null);
                    inputRef.current?.focus();
                  }}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {!hasQuery && (
                <div className="px-4 py-8 text-center">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Escribe al menos 2 caracteres para buscar
                  </p>
                </div>
              )}

              {noResults && (
                <div className="px-4 py-8 text-center">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No se encontraron resultados para{" "}
                    <span className="font-medium">"{query}"</span>
                  </p>
                </div>
              )}

              {results &&
                totalResults > 0 &&
                Object.entries(CATEGORIES).map(([key, cat]) => {
                  const items = results[key];
                  if (!items || items.length === 0) return null;
                  const CatIcon = cat.icon;

                  return (
                    <div key={key} className="py-2">
                      <div className="px-4 pb-1 flex items-center gap-1.5">
                        <CatIcon className={`w-3.5 h-3.5 ${cat.color}`} />
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          {cat.label}
                        </span>
                        <span className="text-[11px] text-gray-300">
                          ({items.length})
                        </span>
                      </div>
                      {items.map((item, i) => {
                        const flatIdx = flatItems.findIndex(
                          (f) =>
                            f._cat === key &&
                            (f.idEstudiante || f.idTrabajador || f.idAula) ===
                              (item.idEstudiante ||
                                item.idTrabajador ||
                                item.idAula)
                        );
                        const isSelected = flatIdx === selectedIdx;

                        return (
                          <button
                            key={
                              item.idEstudiante ||
                              item.idTrabajador ||
                              item.idAula ||
                              i
                            }
                            onClick={() =>
                              goTo({ ...item, _cat: key })
                            }
                            onMouseEnter={() => setSelectedIdx(flatIdx)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center shrink-0`}
                            >
                              <CatIcon
                                className={`w-4 h-4 ${cat.color}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {cat.getTitle(item)}
                              </p>
                              {cat.getSub(item) && (
                                <p className="text-xs text-gray-400 truncate">
                                  {cat.getSub(item)}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">↑↓</kbd>
                  navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">↵</kbd>
                  ir
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">esc</kbd>
                  cerrar
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
