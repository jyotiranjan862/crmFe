import React, { useMemo, useState, useCallback } from "react";

// --------------------
// Helper: Time formatter
// --------------------
const timePassed = (date) => {
  const now = Date.now();
  const past = new Date(date).getTime();
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// --------------------
// Built-in Cell Renderers
// --------------------
export const CellRenderers = {
  avatar: (value) => (
    <div className="flex items-center gap-2.5">
      <img
        src={value?.avatar}
        alt={value?.name || ""}
        className="w-8.5 h-8.5 rounded-full object-cover border-2 border-gray-200 shrink-0"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
      <span className="hidden w-8.5 h-8.5 rounded-full bg-linear-to-br from-indigo-400 to-purple-600 text-white text-[13px] font-bold items-center justify-center shrink-0">
        {(value?.name || "?")[0].toUpperCase()}
      </span>
      <div>
        <div className="font-semibold text-gray-900 text-[13px]">{value?.name || "-"}</div>
        {value?.sub && <div className="text-[11px] text-gray-400 mt-px">{value.sub}</div>}
      </div>
    </div>
  ),

  status: (value) => {
    const presets = {
      active: { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
      inactive: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
      pending: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
      error: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
      success: { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
      warning: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
      info: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
    };
    const isObj = typeof value === "object" && value !== null;
    const label = isObj ? value.label : value;
    const key = String(label || "").toLowerCase();
    const preset = presets[key] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

    if (isObj && value.bg) {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide capitalize whitespace-nowrap"
          style={{ background: value.bg, color: value.color || "#374151" }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: value.dot || value.color || "#6b7280" }} />
          {label || "-"}
        </span>
      );
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide capitalize whitespace-nowrap ${preset.bg} ${preset.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${preset.dot}`} />
        {label || "-"}
      </span>
    );
  },

  image: (value) => (
    <img
      src={value}
      alt=""
      className="w-10 h-10 rounded-lg object-cover border border-gray-200"
    />
  ),

  badge: (value) => {
    const items = Array.isArray(value) ? value : [value];
    return (
      <div className="flex gap-1 flex-wrap">
        {items.map((v, i) => (
          <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
            {v}
          </span>
        ))}
      </div>
    );
  },

  progress: (value) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden min-w-15">
        <div
          className={`h-full rounded-full transition-all duration-300 ${value > 70 ? "bg-emerald-500" : value > 40 ? "bg-amber-500" : "bg-red-500"}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="text-[11px] text-gray-500 min-w-7">{value}%</span>
    </div>
  ),
};

// --------------------
// Main Table Component
// --------------------
const Table = ({
  headers = [],
  values = [],
  page = 1,
  pageSize = 10,
  total = 0,
  loading = false,
  searchKeys = [],
  searchKey,
  searchText,
  onSearch,
  onSearchKeyChange,
  onSearchTextChange,
  onPageChange,
  onPageSizeChange,
  onRowAction,
  actions = [],
  emptyMessage = "No records found",
  onRowClick,
  pageSizes = [5, 10, 20, 50],
  height = "65vh",
}) => {
  const [internalSearchText, setInternalSearchText] = useState("");
  const [internalSearchKey, setInternalSearchKey] = useState(searchKeys[0] || "");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const computedSearchText = searchText ?? internalSearchText;
  const computedSearchKey = searchKey ?? internalSearchKey;

  const handleSearchTextChange = useCallback((e) => {
    const v = e.target.value;
    if (onSearchTextChange) { onSearchTextChange(v); }
    else { setInternalSearchText(v); onSearch?.(v); }
  }, [onSearchTextChange, onSearch]);

  const handleSearchKeyChange = useCallback((e) => {
    const v = e.target.value;
    if (onSearchKeyChange) { onSearchKeyChange(v); }
    else { setInternalSearchKey(v); }
  }, [onSearchKeyChange]);

  const serialNumber = (index) => (page - 1) * pageSize + index + 1;
  const hasActions = onRowAction || actions.length > 0;

  const renderCell = useCallback((row, header) => {
    const raw = header.key.includes(".")
      ? header.key.split(".").reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : undefined, row)
      : row[header.key];

    if (header.render) return header.render(raw, row);

    let displayValue = raw;

    if (header.valueMap && header.valueMap[raw] !== undefined) {
      displayValue = header.valueMap[raw];
    }

    if (header.type && CellRenderers[header.type]) {
      return CellRenderers[header.type](displayValue, row);
    }
    if (displayValue === null || displayValue === undefined || displayValue === "") {
      return <span className="text-gray-300">—</span>;
    }

    if (header.format === "number") return Number(displayValue).toLocaleString();
    if (header.format === "currency") return Number(displayValue).toLocaleString("en-US", { style: "currency", currency: header.currency || "USD" });
    if (header.format === "date") return new Date(displayValue).toLocaleDateString();
    if (header.format === "datetime") return new Date(displayValue).toLocaleString();

    return String(displayValue);
  }, []);

  const visibleHeaders = headers.filter(h => h.label?.toLowerCase() !== "permissions");
  const colSpan = visibleHeaders.length + 2 + (hasActions ? 1 : 0);

  const start = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);

  const hasSearch = onSearch || onSearchTextChange || searchKeys.length > 0;

  return (
    <div className="space-y-3">
      {/* Search bar — separate card above the table */}
      {hasSearch && (
        <div className="flex items-center gap-2 flex-wrap bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
          {searchKeys.length > 0 && (
            <select
              value={computedSearchKey}
              onChange={handleSearchKeyChange}
              className="border border-gray-200 rounded-lg px-2.5 py-1.75 text-xs text-gray-700 bg-gray-50 outline-none cursor-pointer"
            >
              {searchKeys.map((key) => {
                const header = headers.find((h) => h.key === key);
                return <option key={key} value={key}>{header?.label || key}</option>;
              })}
            </select>
          )}
          <div className="relative flex items-center">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={computedSearchText}
              onChange={handleSearchTextChange}
              className="border border-gray-200 rounded-lg pl-8 pr-3 py-1.75 text-xs text-gray-900 bg-gray-50 outline-none w-55 transition focus:border-gray-400 focus:ring-1 focus:ring-gray-300 focus:bg-white"
            />
          </div>
        </div>
      )}

      {/* Table card */}
      <div
        className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-auto scrollbar-hide"
        style={{ height, maxHeight: height }}
      >
        <table className="min-w-full divide-y divide-gray-200 text-[13px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky top-0 z-10 px-2 py-2 text-left text-xs font-medium text-gray-600 tracking-wide uppercase bg-purple-100 w-10">
                #
              </th>
              {visibleHeaders.map((h, i) => (
                <th key={i} className="sticky top-0 z-10 px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider bg-purple-100 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span>{h.label || h.key}</span>
                    {h.filter && (
                      <select
                        className="border border-gray-200 rounded px-1.5 py-0.5 text-[11px] text-gray-700 bg-white outline-none cursor-pointer"
                        value={h.filter.value}
                        onChange={(e) => h.filter.onChange(e.target.value)}
                      >
                        {h.filter.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </th>
              ))}
              <th className="sticky top-0 z-10 px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider bg-purple-100 whitespace-nowrap">
                Time
              </th>
              {hasActions && (
                <th className="sticky top-0 z-10 px-2 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider bg-purple-100 whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-12 text-center">
                  <div className="flex flex-col gap-2.5 py-2 items-stretch max-w-md mx-auto">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-4.5 rounded-md bg-gray-100 animate-pulse w-full" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </td>
              </tr>
            ) : values.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" className="mb-2">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" />
                    </svg>
                    <div className="text-gray-400 text-[13px]">{emptyMessage}</div>
                  </div>
                </td>
              </tr>
            ) : (
              values.map((row, idx) => (
                <tr
                  key={row._id || idx}
                  onClick={() => onRowClick && onRowClick(row, idx)}
                  className={`hover:bg-gray-100 transition ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 align-middle">
                    {serialNumber(idx)}
                  </td>
                  {visibleHeaders.map((header, hidx) => (
                    <td key={hidx} className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 align-middle">
                      {renderCell(row, header)}
                    </td>
                  ))}
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-400 align-middle">
                    {row.time ? timePassed(row.time) : <span className="text-gray-300">—</span>}
                  </td>
                  {hasActions && (
                    <td className="px-2 py-1 text-right align-middle">
                      <div className="flex gap-1.5 justify-end flex-wrap">
                        {actions.map((action, aidx) => (
                          <button
                            key={action.key || aidx}
                            className={`px-3 py-1 rounded-md border text-xs font-medium whitespace-nowrap transition cursor-pointer ${action.variant === "danger"
                              ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                            onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                            title={action.label}
                          >
                            {action.icon || action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer — separate card below the table */}
      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-xl">
        <div className="flex items-center space-x-3 text-sm text-gray-700">
          <div>Rows per page:</div>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="w-20 h-8 text-sm px-2 py-1 rounded-md border border-gray-200 bg-white outline-none cursor-pointer"
          >
            {pageSizes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="text-sm text-gray-500">
            {total === 0
              ? "Showing 0 of 0"
              : `Showing ${start} - ${end} of ${total}`
            }
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange?.(Math.max(1, page - 1))}
            className="px-3 py-1 rounded border bg-white shadow-sm hover:shadow disabled:opacity-40 text-sm cursor-pointer disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <div className="text-sm">
            Page {page} / {totalPages}
          </div>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
            className="px-3 py-1 rounded border bg-white shadow-sm hover:shadow disabled:opacity-40 text-sm cursor-pointer disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Table);
