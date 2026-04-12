import { addMonths, differenceInCalendarMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { useMemo, useState } from "react";
import Modal from "./Modal";
import StatusBadge from "./StatusBadge";

const STATUS_COLOR = {
  present: "success",
  late: "warning",
  excused: "info",
  absent: "danger",
};

const toDateObject = (value) => {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return parseISO(value);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatKey = (date) => format(date, "yyyy-MM-dd");

function AttendanceCalendar({
  records = [],
  emptyLabel = "No attendance records for this month.",
  detailColumns: detailColumnsProp,
  sortComparator,
}) {
  const recordsWithDates = useMemo(
    () =>
      records
        .map((item) => {
          const dateObj = toDateObject(item.date);
          return dateObj ? { ...item, __dateObj: dateObj, __dateKey: formatKey(dateObj) } : null;
        })
        .filter(Boolean),
    [records],
  );

  const initialMonth = useMemo(() => {
    if (!recordsWithDates.length) return startOfMonth(new Date());
    const latest = recordsWithDates.reduce((acc, curr) => (curr.__dateObj > acc.__dateObj ? curr : acc), recordsWithDates[0]);
    return startOfMonth(latest.__dateObj);
  }, [recordsWithDates]);

  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedKey, setSelectedKey] = useState("");

  const activeMonth = useMemo(() => addMonths(initialMonth, monthOffset), [initialMonth, monthOffset]);

  const dayMap = useMemo(() => {
    return recordsWithDates.reduce((acc, entry) => {
      acc[entry.__dateKey] ??= [];
      acc[entry.__dateKey].push(entry);
      return acc;
    }, {});
  }, [recordsWithDates]);

  const gridDays = useMemo(() => {
    const monthStart = startOfMonth(activeMonth);
    const monthEnd = endOfMonth(activeMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [activeMonth]);

  const selectedRecords = selectedKey ? dayMap[selectedKey] ?? [] : [];
  const monthRecordsCount = recordsWithDates.filter((item) => isSameMonth(item.__dateObj, activeMonth)).length;

  const statusCounts = selectedRecords.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  const defaultDetailColumns = useMemo(() => {
    return [
      { key: "subjectName", label: "Subject", render: (row) => row.subjectName ?? "N/A" },
      { key: "className", label: "Class", render: (row) => row.className ?? "N/A" },
      { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} type={STATUS_COLOR[row.status] ?? "info"} /> },
    ];
  }, []);

  const resolvedDetailColumns = detailColumnsProp?.length ? detailColumnsProp : defaultDetailColumns;

  const resolvedComparator = useMemo(() => {
    if (sortComparator) return sortComparator;
    if (detailColumnsProp?.length) {
      const firstKey = detailColumnsProp[0]?.key;
      if (!firstKey) return null;
      return (a, b) => `${a[firstKey] ?? ""}`.localeCompare(`${b[firstKey] ?? ""}`);
    }
    return (a, b) => `${a.subjectName ?? ""}`.localeCompare(`${b.subjectName ?? ""}`);
  }, [detailColumnsProp, sortComparator]);

  return (
    <div className="attendance-calendar">
      <div className="attendance-calendar-header">
        <div className="attendance-calendar-title">
          <h3>{format(activeMonth, "MMMM yyyy")}</h3>
          <p className="helper-text">Click a day to see details.</p>
        </div>
        <div className="attendance-calendar-actions">
          <button className="button secondary" type="button" onClick={() => setMonthOffset((value) => value - 1)}>Prev</button>
          <button
            className="button ghost"
            type="button"
            onClick={() => setMonthOffset(differenceInCalendarMonths(startOfMonth(new Date()), initialMonth))}
          >
            Today
          </button>
          <button className="button secondary" type="button" onClick={() => setMonthOffset((value) => value + 1)}>Next</button>
        </div>
      </div>

      <div className="attendance-calendar-legend">
        {Object.entries(STATUS_COLOR).map(([status, type]) => (
          <div key={status} className="attendance-legend-item">
            <span className={`attendance-dot ${status}`} aria-hidden="true" />
            <span className="muted-text">{status}</span>
            <StatusBadge status={status} type={type} />
          </div>
        ))}
      </div>

      <div className="attendance-calendar-grid" role="grid" aria-label="Attendance calendar">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
          <div key={label} className="attendance-calendar-weekday" role="columnheader">
            {label}
          </div>
        ))}

        {gridDays.map((day) => {
          const dayKey = formatKey(day);
          const entries = dayMap[dayKey] ?? [];
          const inMonth = isSameMonth(day, activeMonth);
          const today = isToday(day);
          const visibleEntries = entries.slice(0, 3);
          const overflow = entries.length - visibleEntries.length;
          const counts = entries.reduce((acc, entry) => {
            acc[entry.status] = (acc[entry.status] ?? 0) + 1;
            return acc;
          }, {});

          return (
            <button
              key={dayKey}
              type="button"
              className={`attendance-calendar-cell${inMonth ? "" : " outside"}${today ? " today" : ""}`}
              onClick={() => setSelectedKey(dayKey)}
              role="gridcell"
              aria-label={`${format(day, "dd MMM yyyy")}${entries.length ? `: ${entries.length} record(s)` : ""}`}
            >
              <span className="attendance-calendar-day">{format(day, "d")}</span>
              <span className="attendance-calendar-dots" aria-hidden="true">
                {visibleEntries.map((entry) => (
                  <span key={entry.id ?? `${entry.__dateKey}-${entry.subjectId ?? "subject"}-${entry.status}-${entry.teacherId ?? "teacher"}`} className={`attendance-dot ${entry.status}`} />
                ))}
                {overflow > 0 ? <span className="attendance-dot overflow">+{overflow}</span> : null}
              </span>
              {entries.length ? (
                <span className="attendance-calendar-counts" aria-hidden="true">
                  {counts.present ? <span className="attendance-count present">P {counts.present}</span> : null}
                  {counts.absent ? <span className="attendance-count absent">A {counts.absent}</span> : null}
                  {counts.late ? <span className="attendance-count late">L {counts.late}</span> : null}
                  {counts.excused ? <span className="attendance-count excused">E {counts.excused}</span> : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {monthRecordsCount === 0 ? (
        <p className="helper-text">{emptyLabel}</p>
      ) : (
        <p className="helper-text">
          Showing <strong>{monthRecordsCount}</strong> record(s) in {format(activeMonth, "MMMM yyyy")}.
        </p>
      )}

      <Modal
        open={Boolean(selectedKey)}
        title={selectedKey ? format(toDateObject(selectedKey) ?? activeMonth, "dd MMM yyyy") : "Attendance"}
        onClose={() => setSelectedKey("")}
      >
        {selectedKey ? (
          selectedRecords.length ? (
            <div className="content-grid">
              <div className="button-row">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="highlight-card">
                    <strong>{count}</strong>
                    <p className="helper-text">{status}</p>
                  </div>
                ))}
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {resolvedDetailColumns.map((column) => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecords
                      .slice()
                      .sort(resolvedComparator ?? undefined)
                      .map((entry) => (
                        <tr key={entry.id ?? `${entry.__dateKey}-${entry.subjectId ?? "subject"}-${entry.status}-${entry.teacherId ?? "teacher"}`}>
                          {resolvedDetailColumns.map((column) => (
                            <td key={`${entry.id ?? entry.__dateKey}-${column.key}`}>
                              {column.render ? column.render(entry) : entry[column.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="helper-text">No attendance recorded for this day.</p>
          )
        ) : null}
      </Modal>
    </div>
  );
}

export default AttendanceCalendar;
