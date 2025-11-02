// Fitness Data - Modify this object to update your tracking data
const fitnessData = {
  "2025-09-12": { exercise: 10},
  "2025-09-14": { exercise: 10},
  "2025-09-15": { exercise: 10},
  "2025-09-17": { exercise: 10},
  "2025-09-18": { exercise: 10},
  "2025-09-19": { exercise: 10},
  "2025-09-20": { exercise: 10},
  "2025-09-23": { exercise: 10},
  "2025-09-24": { exercise: 10},
  "2025-09-25": { exercise: 10},
  "2025-09-28": { exercise: 10},
  "2025-10-10": { exercise: 10},
  "2025-10-11": { exercise: 10},
  "2025-10-12": { exercise: 10},
  "2025-10-15": { exercise: 10},
  "2025-10-16": { exercise: 10},
  "2025-10-17": { exercise: 10},
  "2025-10-19": { exercise: 10},
  "2025-10-21": { exercise: 10},
  "2025-10-22": { exercise: 10},
  "2025-10-29": { exercise: 10},
  "2025-10-30": { exercise: 10},
  "2025-11-01": { exercise: 10},
  "2025-11-02": { exercise: 10},
};

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
    this.renderHeatmaps();
    this.updateStats();
    this.setupTooltips();
  }

  // Get all available years from data
  getAvailableYears() {
    const years = new Set();
    Object.keys(this.data).forEach((dateStr) => {
      const [year] = dateStr.split("-").map(Number);
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
  }

  // Setup year selector
  setupYearSelector() {
    const yearSelect = document.getElementById("year-select");
    const availableYears = this.getAvailableYears();

    // Clear existing options
    yearSelect.innerHTML = "";

    // Create year options
    availableYears.forEach((year) => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;

      if (year === this.currentYear) {
        option.selected = true;
      }

      yearSelect.appendChild(option);
    });

    // Add event listener
    yearSelect.addEventListener("change", (e) => {
      this.currentYear = parseInt(e.target.value);

      // Reset to first available month of the new year
      const availableMonths = this.getAvailableMonths();
      if (availableMonths.length > 0) {
        this.currentMonth = availableMonths[0];
      }

      // Re-setup month selector and re-render
      this.setupMonthSelector();
      this.renderHeatmaps();
      this.updateStats();
      this.setupTooltips();
    });
  }

  // Get available months from data
  getAvailableMonths() {
    const months = new Set();
    Object.keys(this.data).forEach((dateStr) => {
      const [year, month] = dateStr.split("-").map(Number);
      if (year === this.currentYear) {
        months.add(month - 1); // JavaScript月份是0-based (0=Jan, 11=Dec)
      }
    });
    return Array.from(months).sort((a, b) => a - b);
  }

  // Setup month selector
  setupMonthSelector() {
    const monthSelect = document.getElementById("month-select");
    const availableMonths = this.getAvailableMonths();

    // Hide all options first
    Array.from(monthSelect.options).forEach((option) => {
      option.style.display = "none";
      option.disabled = true;
    });

    // Show only available months for current year
    availableMonths.forEach((monthIndex) => {
      monthSelect.options[monthIndex].style.display = "block";
      monthSelect.options[monthIndex].disabled = false;
    });

    // Set first available month as current if current month has no data
    if (
      !availableMonths.includes(this.currentMonth) &&
      availableMonths.length > 0
    ) {
      this.currentMonth = availableMonths[0];
    }

    // Set current month as selected
    if (availableMonths.includes(this.currentMonth)) {
      monthSelect.value = this.currentMonth;
    }

    // Add event listener (remove existing ones first)
    const newMonthSelect = monthSelect.cloneNode(true);
    monthSelect.parentNode.replaceChild(newMonthSelect, monthSelect);

    // Re-setup available months display
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
      this.renderHeatmaps();
      this.updateStats();
      this.setupTooltips();
    });
  }

  // Get score level (0-4) based on value (0-10)
  getScoreLevel(value) {
    if (value === 0) return 0;
    if (value <= 2) return 1;
    if (value <= 4) return 2;
    if (value <= 7) return 3;
    return 4;
  }

  // Generate dates for a specific month
  generateMonthDates(year, month) {
    const dates = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }

    return dates;
  }

  // Calculate day of week using reference date: 2025-09-07 is Sunday
  getDayOfWeek(year, month, day) {
    // IMPORTANT: JavaScript Date constructor uses 0-based months
    // So month parameter here is already 0-based (0=Jan, 1=Feb, ..., 8=Sep)
    const referenceDate = new Date(2025, 8, 7); // 2025-09-07 (September 7, 2025) - Sunday
    const targetDate = new Date(year, month, day); // month is already 0-based

    // Calculate difference in days
    const timeDiff = targetDate.getTime() - referenceDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Reference date (Sept 7, 2025) is Sunday
    // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    let standardDayOfWeek = ((daysDiff % 7) + 7) % 7;

    // Convert to our Monday-first system (Monday=1, ..., Sunday=7)
    if (standardDayOfWeek === 0) {
      return 7; // Sunday
    } else {
      return standardDayOfWeek; // Monday=1, Tuesday=2, ..., Saturday=6
    }
  }

  // Format date as YYYY-MM-DD
  formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  // Get day name
  getDayName(date) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  // Get month name
  getMonthName(date) {
    return date.toLocaleDateString("en-US", { month: "short" });
  }

  // Render a single heatmap for the current month
  renderHeatmap(containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const daysInMonth = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0,
    ).getDate();

    // Calculate what day of the week the 1st falls on using our reference date
    const startDayOfWeek = this.getDayOfWeek(
      this.currentYear,
      this.currentMonth,
      1,
    );

    // Calculate how many empty cells we need before the 1st
    const emptyCellsBefore = startDayOfWeek - 1;

    // Calculate total rows needed
    const totalCells = emptyCellsBefore + daysInMonth;
    const totalRows = Math.ceil(totalCells / 7);

    // Create grid with proper number of cells
    for (let i = 0; i < totalRows * 7; i++) {
      const cell = document.createElement("div");
      cell.className = "heatmap-cell";

      // Calculate the day of month for this position
      const dayOfMonth = i - emptyCellsBefore + 1;

      if (dayOfMonth >= 1 && dayOfMonth <= daysInMonth) {
        // Valid day in the month
        const date = new Date(this.currentYear, this.currentMonth, dayOfMonth);
        const dateStr = this.formatDate(date);

        // Adjust date string by adding one day to match fitnessData format
        const adjustedDate = new Date(
          this.currentYear,
          this.currentMonth,
          dayOfMonth + 1,
        );
        const adjustedDateStr = this.formatDate(adjustedDate);
        const dayData = this.data[adjustedDateStr];

        let value = 0;
        if (dayData) {
          if (type === "overall") {
            value = Math.round(
              (dayData.exercise + dayData.calorie + dayData.discipline) / 3,
            );
          } else {
            value = dayData[type] || 0;
          }

          // Fill with color based on score level
          cell.classList.add(`${type}-${this.getScoreLevel(value)}`);

          // Set data attributes for tooltip
          cell.dataset.exercise = dayData.exercise;
          cell.dataset.calorie = dayData.calorie;
          cell.dataset.discipline = dayData.discipline;
          cell.dataset.overall = Math.round(
            (dayData.exercise + dayData.calorie + dayData.discipline) / 3,
          );
        } else {
          // No data for this day - show empty state with border only
          cell.classList.add(`${type}-0`);
          cell.dataset.exercise = 0;
          cell.dataset.calorie = 0;
          cell.dataset.discipline = 0;
          cell.dataset.overall = 0;
        }

        // Set common data attributes
        cell.dataset.date = dateStr;
        cell.dataset.value = value;
        cell.dataset.type = type;
        cell.dataset.dayName = this.getDayName(date);
        cell.dataset.monthName = this.getMonthName(date);
        cell.dataset.day = dayOfMonth;

        // Add day number display
        cell.textContent = dayOfMonth;
        cell.style.fontSize = "11px";
        cell.style.fontWeight = "bold";
        cell.style.color = "#fff";
        cell.style.display = "flex";
        cell.style.alignItems = "center";
        cell.style.justifyContent = "center";
        cell.style.position = "relative";
      } else {
        // Empty cell for padding (before month start or after month end)
        cell.style.visibility = "hidden";
      }

      container.appendChild(cell);
    }
  }

  // Render all heatmaps -> 修改为只渲染 exercise heatmap
  renderHeatmaps() {
    this.renderHeatmap("exercise-heatmap", "exercise");
    // calorie/discipline/overall heatmaps removed
  }

  // Calculate statistics for current month: count days where exercise > 0
  calculateCurrentMonthStats() {
    const monthData = Object.entries(this.data).filter(([dateStr]) => {
      const [year, month] = dateStr.split("-").map(Number);
      return year === this.currentYear && (month - 1) === this.currentMonth;
    });

    const exerciseDaysCount = monthData.reduce((acc, [, data]) => {
      return acc + ((data && Number(data.exercise) > 0) ? 1 : 0);
    }, 0);

    return {
      exerciseDays: exerciseDaysCount.toFixed(2) // 两位小数显示
    };
  }

  // Calculate all-time statistics: count days where exercise > 0
  calculateAllTimeStats() {
    const values = Object.values(this.data);
    const exerciseDaysCount = values.reduce((acc, data) => {
      return acc + ((data && Number(data.exercise) > 0) ? 1 : 0);
    }, 0);

    return {
      exerciseDays: exerciseDaysCount.toFixed(2) // 两位小数显示
    };
  }

  // Update statistics display (只更新 exercise 计数)
  updateStats() {
    const currentStats = this.calculateCurrentMonthStats();
    const allTimeStats = this.calculateAllTimeStats();

    const curEl = document.getElementById("current-exercise-days");
    const allEl = document.getElementById("all-exercise-days");
    if (curEl) curEl.textContent = currentStats.exerciseDays;
    if (allEl) allEl.textContent = allTimeStats.exerciseDays;
  }

  // Setup tooltip functionality - show only exercise
  setupTooltips() {
    const cells = document.querySelectorAll(".heatmap-cell");

    cells.forEach((cell) => {
      cell.addEventListener("mouseenter", (e) => {
        const target = e.currentTarget;
        const date = target.dataset.date || "";
        const dayName = target.dataset.dayName || "";
        const monthName = target.dataset.monthName || "";
        const day = target.dataset.day || "";
        const exercise = target.dataset.exercise || "0";

        let formattedDate = "";
        if (date) {
          const parts = date.split("-");
          // 直接使用 dataset.day 而不是从 date 字符串解析
          formattedDate = `${dayName}, ${monthName} ${day}, ${parts[0]}`;
        }

        this.tooltip.innerHTML = `
          <div class="tooltip-date">${formattedDate}</div>
          <div class="tooltip-value">Exercise: ${exercise}/10</div>
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
    const viewportHeight = window.innerHeight;

    let left = e.pageX + 10;
    let top = e.pageY - 10;

    // Adjust if tooltip goes off screen
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
