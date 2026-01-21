# Task Specification

## 1. Overview

| Field    | Value                    |
| -------- | ------------------------ |
| Task ID  | DASH-004                 |
| Title    | Customer Value Dashboard |
| Type     | `feature`                |
| Priority | `medium`                 |

### Problem

The management team needs to track the financial efficiency and billing performance of the project team. Specifically, they need to compare the "Billable" (Estimated) hours against the "Earned" (Actual) hours to understand if the team is maximizing their billable potential (assignments) or under-utilizing their capacity.

### Solution

Implement a "Customer Value" dashboard page that aggregates "Cost Performance" metrics. It allows filtering by time period (Week/Month) and visualizes the performance ratio (Actual/Estimate) for each team member and the project as a whole.

---

## 2. Product Requirements (PRD)

### 2.1 User Stories

```
As a Project Manager (Billing)
I want to compare "Estimated Hours" vs "Actual Hours" for the current month
So that I can forecast the billable amount for the client.
```

```
As a Team Lead
I want to identify members who are "Under Performing" (Actual < 90% of Estimate)
So that I can ensure they have enough work or check if tasks are blocked.
```

```
As a Stakeholder
I want to see the overall "Cost Performance" percentage
So that I know if we are meeting our revenue targets based on the planned estimates.
```

### 2.2 Functional Requirements

| #   | Feature                  | Description                                                                    | Priority |
| --- | ------------------------ | ------------------------------------------------------------------------------ | -------- |
| F1  | Period Filter            | Filter data by Time Range (All, This Week, Last Week, This Month, Last Month). | Must     |
| F2  | Team Performance List    | Table showing Member Name, Role, Billable (Est), Earned (Act), and Perf %.     | Must     |
| F3  | Cost Performance Summary | Card showing Total Cost Perf %, Total Billable, and Total Earned.              | Must     |
| F4  | Performance Indicators   | Categorize members into High (>100%), Optimal (90-100%), Under (<90%).         | Must     |
| F5  | Dynamic Date Filtering   | Filter Backlog issues based on Start Date or Actual End Date within range.     | Must     |

### 2.3 UI/UX Requirements

- **Screens**: Customer Value Page (`/dashboard/customer-value`).
- **Layout**:
  - **Header**: Page Title + Period Select Dropdown (Right aligned).
  - **Main Grid**:
    - **Left (2/3)**: Team Cost Performance Table.
    - **Right (1/3)**: Summary Card (Vertical stack of 3 key metrics).
  - **Bottom**: Performance Indicators (Grid of 3 cards).
- **Colors**:
  - High (>100%): Green
  - Optimal (90-100%): Blue
  - Under (<90%): Yellow
- **Empty State**: Show friendly message if no data exists for the selected period.

### 2.4 Business Rules

```
RULE 1: Metric Definitions
- Billable Hours: Sum of "Estimated Hours" from Backlog issues.
- Earned Hours: Sum of "Actual Hours" from Backlog issues.
- Performance %: (Earned Hours / Billable Hours) * 100.

RULE 2: Performance Categories
- High Performance: > 100% (Spending more time/billing more than estimated).
- Optimal Performance: 90% - 100%.
- Under Performance: < 90% (Spending less time than estimated).

RULE 3: Date Filtering
- Issue is included if EITHER "Start Date" OR "Actual End Date" falls within the selected period.
- Period Ranges:
  - This Week: Monday to Today (or Sunday).
  - Last Week: Previous Monday to Previous Sunday.
  - This Month: 1st of current month to Today.
  - Last Month: 1st of previous month to last day of previous month.

RULE 4: Data Aggregation
- Groupped by Assignee (Member).
- Only members with Billable > 0 or Earned > 0 are displayed.
```

---

## 3. Implementation Plan

### Phase 1: Interactive Components

**Scope:** Build the UI with state management.

| Layer    | Task                                                        |
| -------- | ----------------------------------------------------------- |
| Frontend | Create `CustomerValueDashboard` with `useState` for Period. |
| Frontend | Create `TeamCostPerformanceTable` using `CommonTable`.      |
| Frontend | Create `SummaryCard` for aggregated metrics.                |
| Frontend | Create `PerformanceIndicators` logic for categorization.    |

**Done when:**

- [x] Date filter updates the displayed data.
- [x] Table sorts/renders correctly.
- [x] Indicators correctly count members in each category.

---

### Phase 2: Data Logic

**Scope:** Implement filtering and calculation algorithms.

| Layer    | Task                                                                |
| -------- | ------------------------------------------------------------------- |
| Frontend | Implement `getDateRange` helper for Week/Month logic.               |
| Frontend | Implement `isDateInRange` filter for issues.                        |
| Frontend | Implement Aggregation Logic: Map issues to Assignees and sum hours. |
| Frontend | Implement `useMemo` hooks to recalculate metrics on filter change.  |

**Done when:**

- [x] Filtering by "Last Week" shows correct issue subset.
- [x] Totals match the sum of individual member rows.
- [x] "Cost Performance" formula handles division by zero.

---

## 4. Technical Decisions

### Conventions

- **Billing Model**: Assumes **Time & Materials** (Higher Actuals = Higher Value/Revenue).
- **Date Handling**: JavaScript `Date` object manipulation for range calculation.

### Constraints

- **Backlog Data**: Relies on `estimatedHours` and `actualHours` being correctly filled in Backlog.
- **Date Overlap**: Simple inclusion logic (Start OR End inside range) might double-count "value" if an issue spans multiple weeks but is counted fully in both. (Current logic: if date matches, full hours are summed. This is a simplification).

---

## 5. Examples & Edge Cases

### 5.1 Happy Path

**Input**:

- Member A: Est 10h, Act 12h.
- Member B: Est 10h, Act 8h.

**Result**:

- Member A: 120% (High).
- Member B: 80% (Under).
- Total Billable: 20h.
- Total Earned: 20h.
- Cost Performance: 100%.

### 5.2 Edge Cases

| Case                | Expected Behavior                                      |
| ------------------- | ------------------------------------------------------ |
| No Data             | Show "Không có dữ liệu hiệu suất" empty state.         |
| Zero Estimate       | Billable = 0. Performance % = 0 (Avoid Infinity).      |
| Filter "Last Month" | Only issues with Start/End in last month are included. |

### 5.3 Data Validation

- Ensure hours are rounded to nearest integer (or formatted 1 decimal).
- Handle missing Assignee (skip or group under "Unassigned").

---

## 6. Acceptance Criteria

| #   | Scenario      | Expected Result                                      |
| --- | ------------- | ---------------------------------------------------- |
| AC1 | Change Period | Data refreshes to reflect the selected time range.   |
| AC2 | Check Totals  | Summary card matches sum of table columns.           |
| AC3 | Indicators    | Correctly categorizes members based on % thresholds. |
| AC4 | Empty State   | Shows placeholder when no issues match filter.       |

---

## 7. References

- **Backlog API**: [Backlog API v2 Documentation](https://developer.nulab.com/docs/backlog/)
- **Related Tasks**: DASH-002 (Workload)
