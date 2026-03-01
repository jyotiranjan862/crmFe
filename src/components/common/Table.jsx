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
// Built-in Cell Renderers (use via header.type or header.render)
// --------------------
export const CellRenderers = {
  // Avatar + text: { avatar: "url", name: "John", sub: "Engineer" }
  avatar: (value) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <img
        src={value?.avatar}
        alt={value?.name || ""}
        style={{
          width: 34, height: 34, borderRadius: "50%",
          objectFit: "cover", border: "2px solid #e5e7eb",
          flexShrink: 0,
        }}
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
      <span
        style={{
          display: "none", width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg,#667eea,#764ba2)",
          color: "#fff", fontSize: 13, fontWeight: 700,
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        {(value?.name || "?")[0].toUpperCase()}
      </span>
      <div>
        <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{value?.name || "-"}</div>
        {value?.sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{value.sub}</div>}
      </div>
    </div>
  ),

  // Status badge: string or { label, color }
  status: (value) => {
    const presets = {
      active: { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
      inactive: { bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" },
      pending: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
      error: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
      success: { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
      warning: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
      info: { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
    };
    const isObj = typeof value === "object" && value !== null;
    const label = isObj ? value.label : value;
    const key = String(label || "").toLowerCase();
    const preset = presets[key] || { bg: "#f3f4f6", color: "#374151", dot: "#6b7280" };
    const bg = isObj && value.bg ? value.bg : preset.bg;
    const color = isObj && value.color ? value.color : preset.color;
    const dot = isObj && value.dot ? value.dot : preset.dot;

    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 20,
        background: bg, color, fontSize: 11, fontWeight: 600,
        letterSpacing: "0.03em", textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
        {label || "-"}
      </span>
    );
  },

  // Image thumbnail
  image: (value) => (
    <img
      src={value}
      alt=""
      style={{
        width: 40, height: 40, borderRadius: 8, objectFit: "cover",
        border: "1px solid #e5e7eb",
      }}
    />
  ),

  // Badge / tag: string or array of strings
  badge: (value) => {
    const items = Array.isArray(value) ? value : [value];
    return (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {items.map((v, i) => (
          <span key={i} style={{
            padding: "2px 8px", borderRadius: 4,
            background: "#f1f5f9", color: "#334155",
            fontSize: 11, fontWeight: 500, border: "1px solid #e2e8f0",
          }}>{v}</span>
        ))}
      </div>
    );
  },

  // Progress bar: number 0-100
  progress: (value) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        flex: 1, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden", minWidth: 60,
      }}>
        <div style={{
          height: "100%", width: `${Math.min(100, Math.max(0, value))}%`,
          background: value > 70 ? "#10b981" : value > 40 ? "#f59e0b" : "#ef4444",
          borderRadius: 3, transition: "width 0.3s ease",
        }} />
      </div>
      <span style={{ fontSize: 11, color: "#6b7280", minWidth: 28 }}>{value}%</span>
    </div>
  ),
};

// --------------------
// SearchIcon
// --------------------
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

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
  title,
  subtitle,
  emptyMessage = "No records found",
  stickyHeader = true,
  onRowClick,
}) => {
  const [internalSearchText, setInternalSearchText] = useState("");
  const [internalSearchKey, setInternalSearchKey] = useState(searchKeys[0] || "");
  const [hoveredRow, setHoveredRow] = useState(null);

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

  // Resolve cell value with custom renderer
  const renderCell = useCallback((row, header) => {
    // 1. Support nested keys (e.g. 'meta.name')
    const raw = header.key.includes('.')
      ? header.key.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : undefined, row)
      : row[header.key];

    // 2. Custom header render function
    if (header.render) return header.render(raw, row);

    let displayValue = raw;

    // 3. Value mapping (e.g. mapping code 1 to "Active")
    if (header.valueMap && header.valueMap[raw] !== undefined) {
      displayValue = header.valueMap[raw];
    }

    // 4. Built-in cell renderers
    if (header.type && CellRenderers[header.type]) {
      return CellRenderers[header.type](displayValue, row);
    }
    if (displayValue === null || displayValue === undefined || displayValue === "") {
      return <span style={{ color: "#d1d5db" }}>—</span>;
    }

    // 5. Automatic formatting
    if (header.format === 'number') return Number(displayValue).toLocaleString();
    if (header.format === 'currency') return Number(displayValue).toLocaleString('en-US', { style: 'currency', currency: header.currency || 'USD' });
    if (header.format === 'date') return new Date(displayValue).toLocaleDateString();
    if (header.format === 'datetime') return new Date(displayValue).toLocaleString();

    return String(displayValue);
  }, []);

  const s = styles;

  // Pagination range
  const paginationPages = useMemo(() => {
    const range = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    return range;
  }, [page, totalPages]);

  return (
    <div style={s.wrapper}>
      {/* Header bar with pagination and rows-per-page select */}
      <div style={s.topBar}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 32 }}>
          <div style={s.searchRow}>
            {searchKeys.length > 0 && (
              <select value={computedSearchKey} onChange={handleSearchKeyChange} style={s.select}>
                {searchKeys.map((key) => {
                  const header = headers.find((h) => h.key === key);
                  return <option key={key} value={key}>{header?.label || key}</option>;
                })}
              </select>
            )}
            {(onSearch || onSearchTextChange || searchKeys.length > 0) && (
              <div style={s.searchWrap}>
                <span style={s.searchIcon}><SearchIcon /></span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={computedSearchText}
                  onChange={handleSearchTextChange}
                  style={s.searchInput}
                />
              </div>
            )}
          </div>
          {/* Pagination and rows-per-page select */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: "#9ca3af", fontSize: 12 }}>Rows per page</span>
            <select style={s.pageSizeSelect} value={pageSize} onChange={(e) => onPageSizeChange?.(Number(e.target.value))}>
              {[5, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span style={{ color: "#9ca3af", fontSize: 12 }}>
              {total > 0 && `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
            </span>
            <div style={s.pagination}>
              <button style={s.pageBtn} onClick={() => onPageChange?.(page - 1)} disabled={page === 1}>
                <ChevronLeft />
              </button>
              {paginationPages[0] > 1 && (
                <>
                  <button style={s.pageBtn} onClick={() => onPageChange?.(1)}>1</button>
                  {paginationPages[0] > 2 && <span style={s.ellipsis}>…</span>}
                </>
              )}
              {paginationPages.map((p) => (
                <button
                  key={p}
                  style={{ ...s.pageBtn, ...(p === page ? s.pageBtnActive : {}) }}
                  onClick={() => onPageChange?.(p)}
                >
                  {p}
                </button>
              ))}
              {paginationPages[paginationPages.length - 1] < totalPages && (
                <>
                  {paginationPages[paginationPages.length - 1] < totalPages - 1 && <span style={s.ellipsis}>…</span>}
                  <button style={s.pageBtn} onClick={() => onPageChange?.(totalPages)}>{totalPages}</button>
                </>
              )}
              <button style={s.pageBtn} onClick={() => onPageChange?.(page + 1)} disabled={page === totalPages}>
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={{ ...s.th, ...s.thSerial }}>#</th>
              {headers.map((h, i) => (
                h.label?.toLowerCase() === "permissions"
                  ? null
                  : <th key={i} style={s.th}>
                    <div style={s.thInner}>
                      <span>{h.label || h.key}</span>
                      {h.filter && (
                        <select
                          style={s.filterSelect}
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
              <th style={s.th}>Time</th>
              {hasActions && <th style={{ ...s.th, textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={headers.length + 2 + (hasActions ? 1 : 0)} style={s.emptyCell}>
                  <div style={s.loadingWrap}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ ...s.skeleton, animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </td>
              </tr>
            ) : values.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 2 + (hasActions ? 1 : 0)} style={s.emptyCell}>
                  <div style={s.emptyState}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ marginBottom: 8 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" />
                    </svg>
                    <div style={{ color: "#9ca3af", fontSize: 13 }}>{emptyMessage}</div>
                  </div>
                </td>
              </tr>
            ) : (
              values.map((row, idx) => (
                <tr
                  key={idx}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => onRowClick && onRowClick(row, idx)}
                  style={{
                    ...s.tr,
                    background: hoveredRow === idx ? "#f8fafc" : idx % 2 === 0 ? "#fff" : "#fafafa",
                    cursor: onRowClick ? "pointer" : "default",
                  }}
                >
                  <td style={{ ...s.td, ...s.tdSerial }}>{serialNumber(idx)}</td>
                  {headers.map((header, hidx) => (
                    header.label?.toLowerCase() === "permissions"
                      ? null
                      : <td key={hidx} style={s.td}>{renderCell(row, header)}</td>
                  ))}
                  <td style={{ ...s.td, ...s.tdTime }}>
                    {row.time ? timePassed(row.time) : <span style={{ color: "#d1d5db" }}>—</span>}
                  </td>
                  {hasActions && (
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <div style={s.actionRow}>
                        {actions.map((action, aidx) => (
                          <button
                            key={action.key || aidx}
                            style={action.variant === "danger" ? s.btnDanger : s.btn}
                            onClick={() => action.onClick(row)}
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

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
};

// --------------------
// Styles object
// --------------------
const styles = {
  wrapper: {
    fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
    height: "80vh",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
  },
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 20px", borderBottom: "1px solid #f1f5f9",
    gap: 12, flexWrap: "wrap",
    background: "#fff",
  },
  title: { fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" },
  subtitle: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  searchRow: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  select: {
    border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px",
    fontSize: 12, color: "#374151", background: "#f9fafb",
    outline: "none", cursor: "pointer",
  },
  searchWrap: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: {
    position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
    color: "#9ca3af", display: "flex", pointerEvents: "none",
  },
  searchInput: {
    border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px 7px 30px",
    fontSize: 12, color: "#111827", background: "#f9fafb",
    outline: "none", width: 200, transition: "border-color 0.15s",
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 16px", textAlign: "left",
    background: "#f8fafc", color: "#6b7280",
    fontWeight: 600, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
    borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap",
  },
  thSerial: { width: 48, textAlign: "center", color: "#d1d5db" },
  thInner: { display: "flex", alignItems: "center", gap: 6 },
  filterSelect: {
    border: "1px solid #e5e7eb", borderRadius: 6, padding: "2px 6px",
    fontSize: 11, color: "#374151", background: "#fff",
    outline: "none", cursor: "pointer",
  },
  tr: { transition: "background 0.1s" },
  td: {
    padding: "11px 16px", color: "#374151",
    borderBottom: "1px solid #f1f5f9", verticalAlign: "middle",
  },
  tdSerial: { textAlign: "center", color: "#d1d5db", fontSize: 11, fontWeight: 500 },
  tdTime: { whiteSpace: "nowrap", color: "#9ca3af", fontSize: 12 },
  emptyCell: { padding: "48px 16px", textAlign: "center" },
  emptyState: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  },
  loadingWrap: {
    display: "flex", flexDirection: "column", gap: 10, padding: "8px 0", alignItems: "stretch",
  },
  skeleton: {
    height: 18, borderRadius: 6, background: "#f1f5f9",
    animation: "pulse 1.5s ease-in-out infinite",
    width: "100%",
  },
  actionRow: { display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" },
  btn: {
    padding: "5px 12px", borderRadius: 6, border: "1px solid #e5e7eb",
    background: "#fff", color: "#374151", fontSize: 12, fontWeight: 500,
    cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
  },
  btnDanger: {
    padding: "5px 12px", borderRadius: 6, border: "1px solid #fee2e2",
    background: "#fff5f5", color: "#ef4444", fontSize: 12, fontWeight: 500,
    cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
  },
  footer: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 20px", borderTop: "1px solid #f1f5f9",
    background: "#fafafa", flexWrap: "wrap", gap: 8,
  },
  footerLeft: { display: "flex", alignItems: "center", gap: 8 },
  pageSizeSelect: {
    border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 8px",
    fontSize: 12, color: "#374151", background: "#fff", outline: "none",
  },
  pagination: { display: "flex", gap: 4, alignItems: "center" },
  pageBtn: {
    minWidth: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb",
    background: "#fff", color: "#374151", fontSize: 12, fontWeight: 500,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s",
  },
  pageBtnActive: {
    background: "#111827", color: "#fff", border: "1px solid #111827",
  },
  ellipsis: { color: "#9ca3af", fontSize: 12, padding: "0 2px" },
};

// export { CellRenderers }; // Removed duplicate export
export default React.memo(Table);
