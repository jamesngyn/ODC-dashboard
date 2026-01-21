# Task Specification

## 1. Overview

| Field    | Value                 |
| -------- | --------------------- |
| Task ID  | DASH-003              |
| Title    | Quality KPI Dashboard |
| Type     | `feature`             |
| Priority | `medium`              |

### Problem

The Quality Assurance team and Project Managers need a consolidated view of software quality metrics to ensure the product meets release standards. Currently, defect data is stored in Backlog, but calculating key metrics like Defect Density and Leakage Rate requires manual extraction and processing.

### Solution

Implement a "Quality KPI" dashboard page that visualizes real-time quality metrics derived from Backlog issues. Key features include Defect Density tracking, Defect Leakage monitoring, severity breakdowns, and weekly defect trends.

---

## 2. Product Requirements (PRD)

### 2.1 User Stories

```
As a QA Lead
I want to track "Defect Density" over different sprints
So that I can see if the code quality is improving or degrading over time.
```

```
As a Product Owner
I want to know the "Defect Leakage" rate to production
So that I can assess the effectiveness of our testing process before release.
```

```
As a Developer
I want to see the distribution of bugs by severity
So that I can prioritize fixing Critical and Major issues first.
```

### 2.2 Functional Requirements

| #   | Feature               | Description                                                                   | Priority |
| --- | --------------------- | ----------------------------------------------------------------------------- | -------- |
| F1  | Defect Density Metric | Display current Defect Density (weighted severity / man-months).              | Must     |
| F2  | Defect Leakage Metric | Display current Defect Leakage % (escaped bugs / total weighted bugs).        | Must     |
| F3  | Defect Density Chart  | Line chart showing Defect Density trends across recent sprints/milestones.    | Must     |
| F4  | Defect Trends Chart   | Line/Bar chart showing Found vs. Fixed vs. Closed bugs over weekly intervals. | Must     |
| F5  | Severity Breakdown    | Bar chart showing count of bugs by severity (Critical, Major, Normal, Low).   | Must     |
| F6  | Quality Insights      | List of automated qualitative insights (e.g., "Leakage within threshold").    | Should   |
| F7  | Testing Coverage      | Visual representation of testing coverage (Unit, Integration, System).        | Could    |

### 2.3 UI/UX Requirements

- **Screens**: Quality KPI Page (`/dashboard/quality-kpi`).
- **Layout**:
  - **Top Row**: 2 Main Charts.
    1.  **Defect Density Tracking**: Line chart with a reference target line (Target: < 2.0).
    2.  **Defect Trends by Phase**: Multi-line chart for Found/Fixed/Closed counts per week.
  - **Middle Row**: metric cards.
    1.  **Defect Density**: Big number + sub-label + status color (Green if < 2.0, else Blue/Red).
    2.  **Defect Leakage**: Big percentage + sub-label + status color (Green if < 5%, else Blue/Red).
  - **Bottom Row**: 3 Detail Cards.
    1.  **Severity Breakdown**: Horizontal bar chart.
    2.  **Testing Coverage**: Progress bars for different testing levels (currently static).
    3.  **Quality Insights**: List of text alerts with severity icons.
- **Colors**:
  - Critical/Crash: Red
  - Major: Orange
  - Normal: Blue
  - Low: Gray
  - "Found" Line: Red
  - "Fixed" Line: Green
  - "Closed" Line: Purple

### 2.4 Business Rules

```
RULE 1: Defect Density Calculation
- Formula: (Sum of Weighted Severity) / (Total Man Months)
- Weighted Severity Logic:
  - Crash/Critical: Weight 10
  - Major: Weight 5
  - Normal: Weight 3
  - Low: Weight 1
- Scope: Includes "Internal Bug" and "External Bug" types.
- Man Months: Calculated based on project members and working days (Default: 100 for global, or calculated per sprint).

RULE 2: Defect Leakage Calculation
- Formula: (Leakage Count) / (Total Weighted Severity + Leakage Count)
- Leakage Count: Number of bugs with type "Leakage".
- Target: < 5%.

RULE 3: Bug Classification
- Issue Type: Must be "Bug" (case-insensitive).
- "Bug Type" Custom Field:
  - "Internal Bug": Found by QA/Dev internally.
  - "External Bug": Found by Client/UAT.
  - "Leakage": Bugs found in Production.
- "Bug Severity" Custom Field: Maps to Critical, Major, Normal, Low.

RULE 4: Defect Trends
- "Found": Count of bugs Created within the week.
- "Fixed": Count of bugs Resolved/Closed with "Actual End Date" within the week.
- "Closed": Count of bugs Closed with "Actual End Date" within the week.

RULE 5: Man Month Calculation
- Formula: (Members * Working Days) / 20.
- Default Working Days: 20 per month.
```

---

## 3. Implementation Plan

### Phase 1: Dashboard Structure & Static Components

**Scope:** Build the layout and visual components.

| Layer    | Task                                                     |
| -------- | -------------------------------------------------------- |
| Frontend | Create `QualityKPIDashboard` container.                  |
| Frontend | Create `DefectDensityChart` using Recharts.              |
| Frontend | Create `DefectTrendsByPhaseChart` using Recharts.        |
| Frontend | Create `QualityMetricCard` component.                    |
| Frontend | Create `SeverityBreakdownCard` and `TestingCoverageCard` |

**Done when:**

- [x] All charts and cards render with mock data.
- [x] Responsive layout is implemented.

---

### Phase 2: Data Integration & Logic

**Scope:** Connect to Backlog API and implement metric calculations.

| Layer    | Task                                                                 |
| -------- | -------------------------------------------------------------------- |
| Backend  | Implement `getBacklogIssues` with filters for "Bug" issue type.      |
| Backend  | Implement `getBacklogMilestones` and `getBacklogProjectMembers`.     |
| Frontend | Implement `calculateDefectDensity` logic with weights.               |
| Frontend | Implement `calculateDefectLeakage` logic.                            |
| Frontend | Implement `computeDefectTrendsByWeek` for trend analysis.            |
| Frontend | Implement `getSeverityCountsFromBugs` aggregator.                    |
| Frontend | Create `useDefectDensityBySprint` hook to aggregate data per sprint. |

**Done when:**

- [x] Defect Density Metric reflects real weighted severity data.
- [x] Defect Leakage Metric shows percentage of leakage bugs.
- [x] Trend charts show real data from the last 4 weeks.
- [x] Severity Breakdown matches Backlog data.

---

### Phase 3: Advanced Features (Future)

**Scope:** Enhance insights and automated analysis.

| Layer    | Task                                                                  |
| -------- | --------------------------------------------------------------------- |
| Frontend | Implement automated `QualityInsights` generation based on thresholds. |
| Frontend | Integrate real "Testing Coverage" data (requires CI/CD integration).  |
| Frontend | Add Date Range picker for Trend Chart.                                |

**Done when:**

- [ ] Insights automatically flag "High Leakage" or "Increasing Density".
- [ ] Testing Coverage reflects distinct testing tools data.

---

## 4. Technical Decisions

### Conventions

- **Weights**: Critical(10), Major(5), Normal(3), Low(1).
- **Target Thresholds**: Density < 2.0, Leakage < 5%.

### Constraints

- **Custom Fields**: Reliance on specific custom field names ("Bug Type", "Bug Severity") in Backlog. Mismatched names will result in "Normal" severity or ignored counts.
- **Man Month Accuracy**: Depends on accurate project member count in Backlog.

---

## 5. Examples & Edge Cases

### 5.1 Happy Path

**Input**:

- 1 Critical Bug (Internal), 5 Normal Bugs (Internal).
- Man Months = 10.

**Result**:

- Weighted Sum = (1*10) + (5*3) = 25.
- Defect Density = 25 / 10 = 2.5 (Red status).

### 5.2 Edge Cases

| Case              | Expected Behavior                     |
| ----------------- | ------------------------------------- |
| No Bugs           | Density = 0, Leakage = 0%.            |
| Missing Severity  | Defaults to "Normal" (Weight 3).      |
| Zero Man Months   | Density = 0 (Avoid division by zero). |
| No "Leakage" Bugs | Leakage = 0%.                         |

### 5.3 Data Validation

- Ensure custom field values are trimmed and case-insensitive mapped.
- Validate date parsing for trend charts.

---

## 6. Acceptance Criteria

| #   | Scenario       | Expected Result                                             |
| --- | -------------- | ----------------------------------------------------------- |
| AC1 | Dashboard Load | User sees top charts, middle metrics, and bottom breakdown. |
| AC2 | Density Calc   | Calculation matches the weighted formula.                   |
| AC3 | Trend Chart    | Shows data points for at least the last 4 weeks.            |
| AC4 | Severity       | Bugs without explicit severity are counted as Normal.       |
| AC5 | Mobile View    | Stacked layout for charts and cards.                        |

---

## 7. References

- **Backlog API**: [Backlog API v2 Documentation](https://developer.nulab.com/docs/backlog/)
- **Related Tasks**: DASH-001 (Progress Overview), DASH-002 (Workload)
