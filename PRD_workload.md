# Task Specification

## 1. Overview

| Field    | Value                         |
| -------- | ----------------------------- |
| Task ID  | DASH-002                      |
| Title    | Workload Completion Dashboard |
| Type     | `feature`                     |
| Priority | `high`                        |

### Problem

Users (Project Managers/Stakeholders) need a high-level view of the project's progress to understand how much work has been completed versus the plan, not just in terms of task count but also considering estimated hours and value (USP). Currently, this data is scattered or requires manual calculation.

### Solution

Implement a "Completed Workload" (Khối lượng công việc hoàn thành) dashboard widget that aggregates data from GTasks and Backlogs. It provides metrics on Overall Completion, Hours, Tasks, and USP, along with qualitative health indicators and key achievements.

---

## 2. Product Requirements (PRD)

### 2.1 User Stories

```
As a Project Manager
I want to view the overall project completion percentage based on actual progress
So that I can assess if the project is on track.
```

```
As a Stakeholder
I want to see the "Estimate Completed" vs "Total Estimate"
So that I understand the resource consumption relative to the plan.
```

```
As a Team Lead
I want to record key achievements for the week
So that the team's highlights are visible on the dashboard.
```

### 2.2 Functional Requirements

| #   | Feature                   | Description                                                                         | Priority |
| --- | ------------------------- | ----------------------------------------------------------------------------------- | -------- |
| F1  | Overall Completion Widget | Display a gauge/progress bar of the aggregated completion %.                        | Must     |
| F2  | Estimate Metrics          | Display Completed Hours / Total Planned Hours.                                      | Must     |
| F3  | Task Metrics              | Display Completed Tasks count / Total Tasks count (and weekly delta).               | Must     |
| F4  | USP Metrics               | Display Completed USP / Total USP.                                                  | Must     |
| F5  | Health Indicators         | Display status for Schedule, Budget, Quality, Scope (Currently placeholder/manual). | Should   |
| F6  | Key Achievements          | A text area or list to display manually entered highlights for the week.            | Must     |

### 2.3 UI/UX Requirements

- **Screens**: Dashboard Workload Page (`/dashboard/workload`).
- **Layout**:
  - **Top Row**: 4 Key Metrics Cards (Dark theme).
    1.  **Overall Completion**: Large Percentage + Progress Bar.
    2.  **Estimate Completed**: Big number (Completed) + Small number (Total).
    3.  **Tasks Completed**: Big number (Done) / Small number (Total) + Green text for weekly change (e.g., "+3 this week").
    4.  **USP Completed**: Big number (Done) / Small number (Total).
  - **Bottom Row**:
    1.  **Health Indicators**: List vertically (Schedule, Budget, Quality, Scope) with color-coded status text (Cyan/Green).
    2.  **Key Achievements**: Bulleted list or text area for manual input.
- **Responsive**: Grid layout adapts to tablet (2 columns) and desktop (4 columns).
- **Loading State**: Show spinner while fetching data.
- **Error State**: Display error message if API fails.

### 2.4 Business Rules

```
RULE 1: Overall Completion Calculation
- Formula: (Sum of Earned Hours) / (Total Plan Hours) * 100
- Plan Hours: Fixed constant (PLAN_VALUE_HOURS) representing total project hours.
- Earned Hours Logic:
  - For CLOSED tasks: Use actualHours if available, otherwise calculate from startDate to actualEndDate.
  - For IN-PROGRESS tasks: actualHours * Phase Completion Ratio
    - Phase Ratios:
      - Clear Requirement: 20%
      - Coding: 60%
      - Testing: 80%
      - UAT: 80%
      - Release: 100%
- Result capped at 0-100%.

RULE 2: Estimate Completed
- Calculation: (Total Actual Hours of all GTasks) / (Total Plan Hours).
- Actual Hours: Direct sum without phase ratio multiplication.

RULE 3: Task Completed
- Calculation: (Count of Closed Tasks) / (Count of Total Tasks).
- Only regular tasks (non-GTasks) are counted.

RULE 4: USP Completed
- Calculation: (Sum of Points from Closed Tasks) / (Total USP).
- Points extracted from "point" custom field in Backlog.
- Only Closed tasks contribute to completed USP.
- Total USP: Fixed constant (TOTAL_USP).

RULE 5: Task Type Separation
- GTasks: Issues with issueType.name containing "gtask" (case-insensitive).
- Regular Tasks: All other issues.
- GTasks used for: Overall Completion, Estimate Completed.
- Regular Tasks used for: Tasks Completed, USP Completed.

RULE 6: Health Indicators
- Initially hardcoded values:
  - Schedule: On Track (green)
  - Budget: Under Budget (cyan)
  - Quality: Meeting Target (green)
  - Scope: Controlled (cyan)
- Phase 3 will add manual toggle/edit functionality.

RULE 7: Category to Phase Mapping
- Backlog categories map to internal task phases:
  - "Clear Requirement" → Requirement (20%)
  - "Coding" → Development (60%)
  - "Testing" → Testing (80%)
  - "UAT" → UAT (80%)
  - "Release" → Release (100%)
```

---

## 3. Implementation Plan

### Phase 1: Static UI construction

**Scope:** Build the visual components with mock data.

| Layer    | Task                                            |
| -------- | ----------------------------------------------- |
| Frontend | Create dashboard container with 4 metric cards. |
| Frontend | Create reusable metric card component.          |
| Frontend | Create health indicators section.               |
| Frontend | Create key achievements section.                |
| Frontend | Implement responsive grid layout.               |
| Frontend | Add loading and error states.                   |

**Done when:**

- [ ] UI matches the design with proper spacing and colors.
- [ ] Responsive design works on desktop/tablet.
- [ ] Loading spinner displays correctly.
- [ ] Error message displays correctly.

---

### Phase 2: Data Integration (Read-Only)

**Scope:** Connect to Backlog API to fetch real numbers.

| Layer    | Task                                                          |
| -------- | ------------------------------------------------------------- |
| Backend  | Create Backlog API client to fetch issues.                    |
| Frontend | Implement data fetching with caching.                         |
| Frontend | Implement task separation logic (GTasks vs Regular Tasks).    |
| Frontend | Implement calculation logic for Overall Completion.           |
| Frontend | Implement calculation logic for Estimate Completed.           |
| Frontend | Implement calculation logic for Tasks Completed.              |
| Frontend | Implement calculation logic for USP Completed.                |
| Frontend | Connect real data to metric cards.                            |
| Config   | Define constants for plan hours, total USP, and phase ratios. |

**Done when:**

- [ ] Numbers reflect the Backlog database state.
- [ ] Overall Completion uses phase-based earned value calculation.
- [ ] Estimate Completed shows actual hours vs plan hours.
- [ ] Tasks Completed shows closed count vs total count.
- [ ] USP Completed shows points from closed tasks.
- [ ] "Weekly delta" for tasks requires checking "completed_at" timestamp within last 7 days (Future).

---

### Phase 3: Interactive/Admin Features

**Scope:** Allow editing of manual fields (Achievements, Health).

| Layer    | Task                                                                        |
| -------- | --------------------------------------------------------------------------- |
| Database | Create table/storage for `DashboardMeta` (Health status, Achievement text). |
| Backend  | API endpoints to Update Health/Achievements.                                |
| Frontend | Add "Edit" mode or Admin panel to input these values.                       |
| Frontend | Implement save functionality for Key Achievements textarea.                 |
| Frontend | Add toggle/dropdown for Health Indicators.                                  |
| Frontend | Add weekly delta calculation for Tasks Completed.                           |

**Done when:**

- [ ] User can update "Key Achievements" text and save to database.
- [ ] User can toggle Health statuses and persist changes.
- [ ] Tasks Completed shows "+X this week" based on completion dates.

---

## 4. Technical Decisions

### Conventions

- Component naming: Dashboard widgets follow consistent naming patterns.
- Patterns: Composition pattern for dashboard widgets.
- Reusable components for metric cards.

### Constraints

- **Must**: Logic for "Earned Value" must be consistent across the system.
- **Out of scope**: Complex "time drag" calculation for In-Progress tasks simplified to `actualHours * phaseRatio`.
- **Limitation**: Backlog API returns max 100 issues per request (pagination needed for large projects).
- **Data Source**: Backlog API (`/api/v2/issues`) with API Key authentication.

---

## 5. Examples & Edge Cases

### 5.1 Happy Path

**Input →** Project has 10 GTasks (5 closed with 50 hours, 5 in-progress with 30 hours at 60% phase), 20 regular tasks (10 closed with 50 points).

**Result →**

- Overall Completion: (50 + 30\*0.6) / 100 = 68%
- Estimate Completed: 80 / 100 hours
- Tasks Completed: 10 / 20
- USP Completed: 50 / 100

### 5.2 Error Cases

| Case                | Expected Behavior                                   |
| ------------------- | --------------------------------------------------- |
| No tasks in project | Display 0 or Empty State (0/0).                     |
| Plan Hours = 0      | Avoid Division by Zero. Show `N/A` or `0%`.         |
| API failure         | Show error message: "Có lỗi xảy ra khi tải dữ liệu" |
| No actualHours      | Calculate from startDate to actualEndDate           |
| No startDate        | Return 0 hours for that task                        |
| No "point" field    | Return 0 for USP calculation                        |
| More than 100 tasks | Only first 100 shown (needs pagination in future)   |

### 5.3 Data Validation

- Ensure actual hours values are non-negative
- Validate date formats before calculations
- Handle null/undefined values gracefully
- Cap Overall Completion at 0-100%

---

## 6. Acceptance Criteria

| #    | Scenario                 | Expected Result                                           |
| ---- | ------------------------ | --------------------------------------------------------- |
| AC1  | View Dashboard           | User sees 4 top cards and 2 bottom sections.              |
| AC2  | Check Overall Completion | Percentage reflects phase-based earned value calculation. |
| AC3  | Check Estimate           | Sum of actual hours matches Backlog data.                 |
| AC4  | Check Tasks              | Closed task count matches Backlog closed status.          |
| AC5  | Check USP                | Sum of points from closed tasks matches calculation.      |
| AC6  | Loading State            | Spinner shows while fetching data.                        |
| AC7  | Error State              | Error message shows if API fails.                         |
| AC8  | Responsive Layout        | Grid adapts to tablet (2 cols) and desktop (4 cols).      |
| AC9  | Health Indicators        | Shows 4 hardcoded statuses with correct colors.           |
| AC10 | Key Achievements         | Textarea is visible with placeholder text.                |

---

## 7. References

- **Backlog API**: [Backlog API v2 Documentation](https://developer.nulab.com/docs/backlog/)
- **Related Tasks**: DASH-001 (Progress Overview Dashboard)
