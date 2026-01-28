// Fitness Data - Only dates matter now
const fitnessData = [
  "2025-09-12",
  "2025-09-14",
  "2025-09-15",
  "2025-09-17",
  "2025-09-18",
  "2025-09-19",
  "2025-09-20",
  "2025-09-23",
  "2025-09-24",
  "2025-09-25",
  "2025-09-28",
  "2025-10-10",
  "2025-10-11",
  "2025-10-12",
  "2025-10-15",
  "2025-10-16",
  "2025-10-17",
  "2025-10-19",
  "2025-10-21",
  "2025-10-22",
  "2025-10-29",
  "2025-10-30",
  "2025-11-01",
  "2025-11-02",
  "2025-11-03",
  "2025-11-04",
  "2025-11-06",
  "2025-11-07",
  "2025-11-08",
  "2025-11-09",
  "2025-11-11",
  "2025-11-12",
  "2025-11-14",
  "2025-11-16",
  "2025-11-18",
  "2025-11-19",
  "2025-11-21",
  "2025-11-22",
  "2025-11-23",
  "2025-11-24",
  "2025-11-25",
  "2025-11-26",
  "2025-11-27",
  "2025-11-28",
  "2025-11-30",
  "2025-12-01",
  "2025-12-03",
  "2025-12-04",
  "2025-12-05",
  "2025-12-10",
  "2025-12-12",
  "2025-12-15",
  "2025-12-17",
  "2025-12-18",
  "2025-12-19",
  "2025-12-20",
  "2025-12-23",
  "2025-12-24",
  "2025-12-25",
  "2025-12-26",
  "2025-12-28",
  "2025-12-29",
  "2025-12-31",
  "2026-01-01",
  "2026-01-02",
  "2026-01-04",
  "2026-01-05",
  "2026-01-06",
  "2026-01-08",
  "2026-01-09",
  "2026-01-11",
  "2026-01-13",
  "2026-01-21",
  "2026-01-22",
  "2026-01-23",
  "2026-01-26",
  "2026-01-27",
  "2026-01-30",
  "2026-01-31",
];

class FitnessTracker {
  constructor() {
    this.data = fitnessData;
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();
    this.tooltip = document.getElementById("tooltip");
    this.init();
  }

  init() {
    this.setupYearSelector();
    this.setupMonthSelector();
    this.renderHeatmap();
    this.updateStats();
    this.setupTooltips();
  }

  // Get all available years from data
  getAvailableYears() {
    const years = new Set();
    this.data.forEach((dateStr) => {
      const [year] = dateStr.split("-").map(Number);
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }

  // Setup year selector
  setupYearSelector() {
    const yearSelect = document.getElementById("year-select");
    const availableYears = this.getAvailableYears();

    yearSelect.innerHTML = "";

    availableYears.forEach((year) => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;

      if (year === this.currentYear) {
        option.selected = true;
      }

      yearSelect.appendChild(option);
    });

    yearSelect.addEventListener("change", (e) => {
      this.currentYear = parseInt(e.target.value);

      const availableMonths = this.getAvailableMonths();
      if (availableMonths.length > 0) {
        this.currentMonth = availableMonths[0];
      }

      this.setupMonthSelector();
      this.renderHeatmap();
      this.updateStats();
      this.setupTooltips();
    });
  }

  // Get available months from data for current year
  getAvailableMonths() {
    const months = new Set();
    this.data.forEach((dateStr) => {
      const [year, month] = dateStr.split("-").map(Number);
      if (year === this.currentYear) {
        months.add(month - 1); // Convert to 0-based month
      }
    });
    return Array.from(months).sort((a, b) => a - b);
  }

  // Setup month selector
  setupMonthSelector() {
    const monthSelect = document.getElementById("month-select");
    const availableMonths = this.getAvailableMonths();

    Array.from(monthSelect.options).forEach((option) => {
      option.style.display = "none";
      option.disabled = true;
    });

    availableMonths.forEach((monthIndex) => {
      monthSelect.options[monthIndex].style.display = "block";
      monthSelect.options[monthIndex].disabled = false;
    });

    if (
      !availableMonths.includes(this.currentMonth) &&
      availableMonths.length > 0
    ) {
      this.currentMonth = availableMonths[0];
    }

    if (availableMonths.includes(this.currentMonth)) {
      monthSelect.value = this.currentMonth;
    }

    const newMonthSelect = monthSelect.cloneNode(true);
    monthSelect.parentNode.replaceChild(newMonthSelect, monthSelect);

    Array.from(newMonthSelect.options).forEach((option) => {
      option.style.display = "none";
      option.disabled = true;
    });

    availableMonths.forEach((monthIndex) => {
      newMonthSelect.options[monthIndex].style.display = "block";
      newMonthSelect.options[monthIndex].disabled = false;
    });

    newMonthSelect.value = this.currentMonth;

    newMonthSelect.addEventListener("change", (e) => {
      this.currentMonth = parseInt(e.target.value);
      this.renderHeatmap();
      this.updateStats();
      this.setupTooltips();
    });
  }

  // Calculate day of week
  getDayOfWeek(year, month, day) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 ? 7 : dayOfWeek;
  }

  // Format date as YYYY-MM-DD (fix timezone issue)
  formatDate(date) {
    // Pad month and day with leading zeros
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Get day name
  getDayName(date) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  // Get month name
  getMonthName(date) {
    return date.toLocaleDateString("en-US", { month: "short" });
  }

  // Check if date exists in data
  isDateLogged(dateStr) {
    return this.data.includes(dateStr);
  }

  // Render exercise heatmap for the current month
  renderHeatmap() {
    const container = document.getElementById("exercise-heatmap");
    container.innerHTML = "";

    const daysInMonth = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0,
    ).getDate();

    const startDayOfWeek = this.getDayOfWeek(
      this.currentYear,
      this.currentMonth,
      1,
    );

    const emptyCellsBefore = startDayOfWeek - 1;
    const totalCells = emptyCellsBefore + daysInMonth;
    const totalRows = Math.ceil(totalCells / 7);

    for (let i = 0; i < totalRows * 7; i++) {
      const cell = document.createElement("div");
      cell.className = "heatmap-cell";

      const dayOfMonth = i - emptyCellsBefore + 1;

      if (dayOfMonth >= 1 && dayOfMonth <= daysInMonth) {
        const date = new Date(this.currentYear, this.currentMonth, dayOfMonth);
        const dateStr = this.formatDate(date);

        // Check if date is logged
        if (this.isDateLogged(dateStr)) {
          cell.classList.add("exercise-active");
          cell.dataset.logged = "true";
        } else {
          cell.classList.add("exercise-inactive");
          cell.dataset.logged = "false";
        }

        cell.dataset.date = dateStr;
        cell.dataset.dayName = this.getDayName(date);
        cell.dataset.monthName = this.getMonthName(date);
        cell.dataset.day = dayOfMonth;

        cell.textContent = dayOfMonth;
      } else {
        cell.style.visibility = "hidden";
      }

      container.appendChild(cell);
    }
  }

  // Calculate statistics for current month: count logged days
  calculateCurrentMonthStats() {
    const monthData = this.data.filter((dateStr) => {
      const [year, month] = dateStr.split("-").map(Number);
      return year === this.currentYear && (month - 1) === this.currentMonth;
    });

    return {
      activeDays: monthData.length
    };
  }

  // Calculate all-time statistics: count all logged days
  calculateAllTimeStats() {
    return {
      activeDays: this.data.length
    };
  }

  // Update statistics display
  updateStats() {
    const currentStats = this.calculateCurrentMonthStats();
    const allTimeStats = this.calculateAllTimeStats();

    const curEl = document.getElementById("current-exercise-days");
    const allEl = document.getElementById("all-exercise-days");
    if (curEl) curEl.textContent = currentStats.activeDays;
    if (allEl) allEl.textContent = allTimeStats.activeDays;
  }

  // Setup tooltip functionality
  setupTooltips() {
    const cells = document.querySelectorAll(".heatmap-cell");

    cells.forEach((cell) => {
      cell.addEventListener("mouseenter", (e) => {
        const target = e.currentTarget;
        const date = target.dataset.date || "";
        const dayName = target.dataset.dayName || "";
        const monthName = target.dataset.monthName || "";
        const day = target.dataset.day || "";
        const isLogged = target.dataset.logged === "true";

        let formattedDate = "";
        if (date) {
          const parts = date.split("-");
          formattedDate = `${dayName}, ${monthName} ${day}, ${parts[0]}`;
        }

        this.tooltip.innerHTML = `
          <div class="tooltip-date">${formattedDate}</div>
          <div class="tooltip-value">${isLogged ? "✓ Active" : "✗ Inactive"}</div>
        `;

        this.tooltip.style.display = "block";
        this.updateTooltipPosition(e);
      });

      cell.addEventListener("mousemove", (e) => this.updateTooltipPosition(e));
      cell.addEventListener("mouseleave", () => { this.tooltip.style.display = "none"; });
    });
  }

  // Update tooltip position
  updateTooltipPosition(e) {
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    let left = e.pageX + 10;
    let top = e.pageY - 10;

    if (left + tooltipRect.width > viewportWidth) {
      left = e.pageX - tooltipRect.width - 10;
    }

    if (top < 0) {
      top = e.pageY + 20;
    }

    this.tooltip.style.left = left + "px";
    this.tooltip.style.top = top + "px";
  }
}

// Initialize the fitness tracker when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new FitnessTracker();
});
