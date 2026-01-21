# Task Specification

## 1. Overview

| Field    | Value                       |
| -------- | --------------------------- |
| Task ID  | DASH-001                    |
| Title    | Progress Overview Dashboard |
| Type     | `feature`                   |
| Priority | `high`                      |

### Problem

Stakeholders and project managers need a real-time, high-level snapshot of the project's status to identify bottlenecks and ensure the project is moving forward as planned. Simple task lists are insufficient for visualizing the overall distribution of work across different phases (Requirement, Dev, Test, UAT).

### Solution

Implement a "Progress Overview" dashboard widget that visualizes task distribution using a donut chart and provides actionable insights (On Track, Needs Monitoring, Ready for UAT) based on real-time data from Backlog.

---

## 2. Product Requirements (PRD)

### 2.1 User Stories

```
As a Project Manager
I want to see the distribution of tasks across different phases (Dev, Test, UAT)
So that I can quickly understand where the majority of the team's effort is currently focused.
```

```
As a QA Lead
I want to know how many tasks are ready for UAT
So that I can prepare the testing environment and resources.
```

```
As a Stakeholder
I want to identify "Needs Monitoring" tasks (delayed or stuck)
So that I can intervene before they become critical issues.
```

### 2.2 Functional Requirements

| #   | Feature                   | Description                                                              | Priority |
| --- | ------------------------- | ------------------------------------------------------------------------ | -------- |
| F1  | Status Distribution Chart | Donut chart showing task count distribution by phase.                    | Must     |
| F2  | Phase Summary List        | detailed list of task categories with counts and percentages.            | Must     |
| F3  | Insight: On Track         | Count of tasks completed within the scheduled timeframe.                 | Must     |
| F4  | Insight: Needs Monitoring | Count of tasks that are delayed, overdue, or stuck in progress.          | Must     |
| F5  | Insight: Ready for UAT    | Count of tasks currently in the UAT phase.                               | Must     |
| F6  | Bottleneck Alert          | Visual warning if "Needs Monitoring" tasks exceed a threshold (e.g., 5). | Should   |

### 2.3 UI/UX Requirements

- **Screens**: Dashboard Progress Overview Page (`/dashboard/progress-overview`).
- **Layout**:
  - **Upper Section**: Integrated card containing both the Chart and Summary List.
    - **Left (70%)**: Large Donut Chart with total task count in the center.
    - **Right (30%)**: Vertical list of phases with color-coded legends, counts, and percentages.
  - **Lower Section**: 3 Key Insight Cards (Grid layout).
    1.  **On Track**: Green theme, showing % and count of tasks on schedule.
    2.  **Needs Monitoring**: Yellow theme, showing count of risky tasks. Displays "⚠️ Bottleneck Detected" if count > 5.
    3.  **Ready for UAT**: Purple theme, showing count of tasks waiting for acceptance.
- **Colors**:
  - Requirement: Teal/Green (#4FD2A8)
  - Development: Blue (#5C9DFF)
  - Testing: Yellow (#FFC738)
  - UAT: Purple (#A687FF)
  - Release: Dark Green (#2BC48A)
- **Tooltips**: Hovering over chart segments should show details.

### 2.4 Business Rules

```
RULE 1: Phase Mapping
- Backlog categories are mapped to standardized phases:
  - "Clear Requirement" -> Requirement
  - "Coding" -> Development
  - "Testing" -> Testing
  - "UAT" -> UAT
  - "Release" -> Release

RULE 2: On Track Calculation
- Criteria: Task is Closed or Resolved AND (Actual End Date is within the range of Start Date and Due Date).
- Requires: Start Date, Due Date, and Actual End Date to be set.

RULE 3: Needs Monitoring Calculation
- Criteria:
  1. Task is NOT Closed/Resolved (i.e., In Progress, Open) but has Start/Due dates.
  2. OR Task is Closed/Resolved but Actual End Date is outside the [Start Date, Due Date] range (Overdue).
- Alert Threshold: If count > 5, display visual warning.

RULE 4: Ready for UAT
- Criteria: Count of tasks where current status (category) maps to "UAT".

RULE 5: Data Scope
- aggregated from all issues returned by the Backlog API query.
- excludes issues without categories if category-based mapping is strict (or maps to "Unknown").
```

---

## 3. Implementation Plan

### Phase 1: Component Construction

**Scope:** Build the UI components.

| Layer    | Task                                                |
| -------- | --------------------------------------------------- |
| Frontend | Create `ProgressOverviewWidget` container.          |
| Frontend | Create `StatusDonutChart` using Recharts.           |
| Frontend | Create `SummaryList` component for the side legend. |
| Frontend | Create `InsightCards` component for the bottom row. |

**Done when:**

- [x] Chart renders with correct colors and center text.
- [x] Summary list aligns with chart segments.
- [x] Insight cards display mock data correctly.

---

### Phase 2: Logic & Integration

**Scope:** Connect to real data and implement business logic.

| Layer    | Task                                                         |
| -------- | ------------------------------------------------------------ |
| Frontend | Fetch issues using existing Backlog hook.                    |
| Frontend | Implement `mapBacklogCategoryToTaskStatus` utility.          |
| Frontend | Implement filtering logic for On Track/Monitor/UAT insights. |
| Frontend | Calculate distribution percentages dynamically.              |
| Frontend | Handle empty states and loading states.                      |

**Done when:**

- [x] "Needs Monitoring" correctly identifies overdue tasks.
- [x] Donut chart reflects real-time backlog status.
- [x] Bottleneck alert appears when threshold is exceeded.

---

## 4. Technical Decisions

### Conventions

- **Charting Library**: Recharts (Standard for this dashboard).
- **Icons**: Lucide React.
- **Styling**: Tailwind CSS + shadcn/ui.

### Constraints

- **Data Volatility**: "Needs Monitoring" logic depends heavily on accurate date entry in Backlog (Start/Due/Actual). Missing dates might skew this metric.
- **Category Dependence**: logic relies on Backlog issues having correct Category fields.

---

## 5. Examples & Edge Cases

### 5.1 Happy Path

**Input**:

- 10 Tasks in Dev, 5 in Test, 5 in UAT.
- 15 On Track, 2 Overdue.

**Result**:

- Chart shows segments for Dev, Test, UAT.
- "Ready for UAT": 5.
- "Needs Monitoring": 2 (No alert).

### 5.2 Edge Cases

| Case               | Expected Behavior                                               |
| ------------------ | --------------------------------------------------------------- |
| No Tasks           | Chart shows empty or 0 tasks. Insights show 0.                  |
| Missing Dates      | Tasks excluded from "On Track" calculation (defaults to false). |
| Threshold Exceeded | "Needs Monitoring" card shows additional warning text.          |

### 5.3 Data Validation

- Percentages should sum to 100% (handle rounding).
- Ensure task counts are non-negative.

---

## 6. Acceptance Criteria

| #   | Scenario          | Expected Result                                       |
| --- | ----------------- | ----------------------------------------------------- |
| AC1 | Dashboard Load    | User sees Donut chart and 3 insight cards.            |
| AC2 | Chart Interaction | Hovering over chart shows counts for that phase.      |
| AC3 | UAT Insight       | Number matches count of tasks in UAT category.        |
| AC4 | Monitor Alert     | If 6 tasks need monitoring, alert text is visible.    |
| AC5 | Mobile View       | Chart and List stack vertically; Insight cards stack. |

---

## 7. References

- **Backlog API**: [Backlog API v2 Documentation](https://developer.nulab.com/docs/backlog/)
- **Related Tasks**: DASH-002 (Workload Dashboard)
