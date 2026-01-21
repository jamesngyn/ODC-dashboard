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

- **Screens**: Dashboard Overview Page.
- **Layout**:
  - **Top Row**: 4 Key Metrics Cards (Dark theme).
    1.  **Overall Completion**: Large Percentage + Progress Bar.
    2.  **Estimate Completed**: Big number (Completed) + Small number (Total).
    3.  **Tasks Completed**: Big number (Done) / Small number (Total) + Green text for weekly change (e.g., "+3 this week").
    4.  **USP Completed**: Big number (Done) / Small number (Total).
  - **Bottom Row**:
    1.  **Health Indicators**: List vertically (Schedule, Budget, Quality, Scope) with color-coded status text (Cyan/Green).
    2.  **Key Achievements**: Bulleted list of text.
- **Design reference**: See attached screenshot `uploaded_image_1768530162246.png`.

### 2.4 Business Rules

```
RULE 1: Overall Completion Calculation
- Formula: (Sum of Earned Value) / (Sum of Plan Value)
- Plan Value: Total planned hours (or USP) defined in Backlog/GTask.
- Earned Value Logic:
  - Phase Weighting:
    - Done Requirement: 20%
    - Done Code: 60%
    - Done Test: 80%
    - Release: 100%
  - For RELEASED (Done) tasks: Earned Value = Actual Hours recorded.
  - For IN-PROGRESS tasks: Earned Value = Current Actual Hours (time logs)
    *OR* (Progress % * Phase Weighting * Plan Value).
    (Note: The image suggests specific logic: "tính số giờ hiện tại dựa trên thời gian lúc kéo sang In Progress x tỉ lệ giai đoạn").

RULE 2: Estimate Completed
- Calculation: (Total Actual Hours of all GTasks) / (Total Plan Hours of all GTasks).

RULE 3: Task Completed
- Calculation: (Count of Closed GTasks) / (Count of Total GTasks).

RULE 4: USP Completed
- Calculation: (Sum of Earned USP) / (Sum of Plan USP).
- Earned USP logic follows the "Overall Completion" phase completion if partial credit is allowed, otherwise strictly for Done tasks (Needs clarification, default to Done = 100%, others = 0% for simple MVP unless Phase Ratio applies to USP too).

RULE 5: Health Indicators
- Initially "Not yet developed" (Chưa phát triển).
- Hardcode or allow manual toggle for: On Track, Under Budget, Meeting Target, Controlled.
```

---

## 3. Implementation Plan

### Phase 1: Static UI construction

**Scope:** Build the visual components with mock data.

| Layer    | Task                                                          |
| -------- | ------------------------------------------------------------- |
| Frontend | Create `WorkloadDashboard` container component.               |
| Frontend | Create `MetricCard` component (reusable for the 4 top cards). |
| Frontend | Create `HealthIndicator` and `KeyAchievement` components.     |

**Done when:**

- [ ] UI matches the screenshot pixel-perfectly (colors, spacing, fonts).
- [ ] Responsive design works on desktop/tablet.

---

### Phase 2: Data Integration (Read-Only)

**Scope:** Connect to Backlog/GTask API to fetch real numbers.

| Layer    | Task                                                                  |
| -------- | --------------------------------------------------------------------- |
| Database | Ensure GTask table has `plan_hours`, `actual_hours`, `usp`, `status`. |
| Backend  | Create API `/api/dashboard/workload` to aggregate these sums.         |
| Backend  | Implement logic for "Earned Value" based on status/phase.             |
| Frontend | Fetch data using React Query and feed into components.                |

**Done when:**

- [ ] Numbers reflect the database state.
- [ ] "Weekly delta" for tasks requires checking "completed_at" timestamp within last 7 days.

---

### Phase 3: Interactive/Admin Features

**Scope:** Allow editing of manual fields (Achievements, Health).

| Layer    | Task                                                                        |
| -------- | --------------------------------------------------------------------------- |
| Database | Create table/storage for `DashboardMeta` (Health status, Achievement text). |
| Backend  | API endpoints to Update Health/Achievements.                                |
| Frontend | Add "Edit" mode or Admin panel to input these values.                       |

**Done when:**

- [ ] User can update "Key Achievements" text.
- [ ] User can toggle Health statuses.

---

## 4. Technical Decisions

### Conventions

- Naming: `DashboardWorkload`, `MetricCard`.
- Patterns: Composition for the Dashboard widgets.
- Existing utils to use: `formatNumber`, `ProgressBar` component (if exists).

### Constraints

- Must: logic for "Earned Value" must be consistent across the system.
- Out of scope: The complex "time drag" calculation mentioned in the image for In-Progress tasks might be simplified to "Actual Logged Hours" for Phase 1 to avoid complexity.

---

## 5. Examples & Edge Cases

### Happy Path

**Input →** Project has 10 tasks, 5 done (50 hours), 5 todo (50 hours).
**Result →**

- Tasks Completed: 5/10.
- Estimate Completed: 50 / 100 (assuming actuals match plan).

### Error Cases

| Case                | Expected Behavior                           |
| ------------------- | ------------------------------------------- |
| No tasks in project | Display 0 or Empty State (dashes `-`).      |
| Plan Hours = 0      | Avoid Division by Zero. Show `N/A` or `0%`. |

---

## 6. Acceptance Criteria

| #   | Scenario       | Expected Result                                                        |
| --- | -------------- | ---------------------------------------------------------------------- |
| AC1 | View Dashboard | User sees 4 top cards and 2 bottom sections.                           |
| AC2 | Check Metrics  | Sum of completed tasks matches database count.                         |
| AC3 | Check Formula  | Overall Completion % follows the weighted logic (approximate for MVP). |

---

## 7. References

- Design: `uploaded_image_1768530162246.png`
- Logic: `uploaded_image_1768530433849.png`
