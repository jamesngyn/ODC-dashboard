# Workload Dashboard Page - Technical Analysis

## 1. Overview

| Field           | Value                                                    |
| --------------- | -------------------------------------------------------- |
| Page Path       | `/dashboard/workload`                                    |
| Page Component  | `app/dashboard/workload/page.tsx`                        |
| Main Component  | `components/dashboard/workload/WorkloadDashboard.tsx`    |
| Purpose         | Display project workload completion metrics and insights |
| Data Source     | Backlog API (Issues)                                     |
| Related Task ID | DASH-002                                                 |

### Page Description

The Workload Dashboard provides a comprehensive view of project progress through key performance metrics. It aggregates data from Backlog issues (GTasks and regular tasks) to display overall completion percentage, estimate hours, task counts, and USP (User Story Points) completion. The dashboard also includes health indicators and a section for recording key achievements.

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```
WorkloadPage (page.tsx)
└── WorkloadDashboard (WorkloadDashboard.tsx)
    ├── MetricCard (×4) - Top row metrics
    │   ├── Overall Completion
    │   ├── Estimate Completed
    │   ├── Tasks Completed
    │   └── USP Completed
    ├── HealthIndicators - Bottom left
    └── KeyAchievements - Bottom right
```

### 2.2 Component Details

#### **WorkloadPage** (`app/dashboard/workload/page.tsx`)

- **Type**: Server Component (default Next.js)
- **Responsibility**: Page wrapper and layout
- **Features**:
  - Page title: "Workload Completion"
  - Padding and spacing container
  - Renders `WorkloadDashboard` component

#### **WorkloadDashboard** (`components/dashboard/workload/WorkloadDashboard.tsx`)

- **Type**: Client Component (`"use client"`)
- **Responsibility**: Main dashboard logic and data orchestration
- **Key Features**:
  - Fetches Backlog issues using `useBacklogIssues` hook
  - Separates GTasks from regular tasks
  - Calculates all metrics using utility functions
  - Handles loading and error states
  - Renders 4 metric cards + 2 bottom sections

**Data Flow**:

1. Fetch all issues from Backlog API
2. Split into GTasks and regular tasks
3. Calculate metrics using `useMemo` for optimization:
   - Overall Completion (from GTasks)
   - Estimate Completed (from GTasks)
   - Tasks Completed (from regular tasks)
   - USP Completed (from regular tasks)
4. Pass calculated data to child components

#### **MetricCard** (`components/dashboard/workload/MetricCard.tsx`)

- **Type**: Reusable presentational component
- **Props**:
  - `title`: Card title
  - `mainValue`: Primary metric value
  - `subValue`: Secondary value (optional)
  - `subLabel`: Label for secondary value (optional)
  - `progress`: Progress bar percentage (optional)
  - `trend`: Trend indicator text (optional)
  - `className`: Additional styling (optional)
- **Features**:
  - Dark theme card with shadcn/ui Card component
  - Conditional progress bar
  - Conditional trend display (green text)

#### **HealthIndicators** (`components/dashboard/workload/HealthIndicators.tsx`)

- **Type**: Static presentational component
- **Data**: Hardcoded health status array
- **Displays**:
  - Schedule: On Track (green)
  - Budget: Under Budget (cyan)
  - Quality: Meeting Target (green)
  - Scope: Controlled (cyan)
- **Note**: Currently static, Phase 3 will add edit functionality

#### **KeyAchievements** (`components/dashboard/workload/KeyAchievements.tsx`)

- **Type**: Static presentational component
- **Features**:
  - Textarea for manual input
  - Placeholder text in Vietnamese
  - Min height: 200px
- **Note**: Currently UI only, Phase 3 will add save functionality

---

## 3. Data Layer

### 3.1 API Integration

#### **Backlog API** (`lib/api/backlog.ts`)

**Base Configuration**:

- Base URL: From `configs.BACKLOG_BASE_URL`
- API Key: From `configs.BACKLOG_API_KEY`
- Project ID: From `configs.BACKLOG_PROJECT_ID`

**Key Functions**:

```typescript
getBacklogIssues(options?: GetBacklogIssuesOptions): Promise<BacklogIssue[]>
```

- Fetches issues from Backlog
- Parameters:
  - `issueTypeIds`: Filter by issue type (optional)
  - `count`: Max records (default 100, max 100)
- Returns: Array of BacklogIssue objects

**BacklogIssue Interface**:

```typescript
interface BacklogIssue {
  id: number;
  issueKey: string;
  summary: string;
  status: { id: number; name: string };
  issueType: { id: number; name: string };
  startDate: string | null;
  dueDate: string | null;
  actualEndDate: string | null;
  actualHours?: number | null;
  estimatedHours?: number | null;
  assignee?: { id: number; userId: string; name: string } | null;
  category?: BacklogCategoryItem[];
  customFields?: { id: number; name: string; value: string }[];
}
```

### 3.2 React Query Hook

#### **useBacklogIssues** (`hooks/useBacklogIssues.ts`)

**Purpose**: Fetch and cache Backlog issues with React Query

**Options**:

- `issueTypeIds`: Filter by issue type IDs
- `count`: Number of records (default 100)
- `enabled`: Enable/disable query (default true)

**Query Key**: `[QUERY_KEYS.BACKLOG.ISSUES, issueTypeIds]`

**Returns**:

- `issues`: Array of BacklogIssue
- `isLoading`: Loading state
- `isError`: Error state
- `error`: Error object

### 3.3 Business Logic Utilities

#### **Task Separation** (`WorkloadDashboard.tsx`)

```typescript
function splitGtasksAndRegularTasks(issues: BacklogIssue[]);
```

- Splits issues into GTasks and regular tasks
- GTasks: `issueType.name` contains "gtask" (case-insensitive)
- Regular tasks: All other issues

#### **Calculation Functions** (`lib/utils/index.ts`)

**1. Overall Completion**

```typescript
calculateOverallCompletion(issues: BacklogIssue[]): number
```

- Formula: `(Total Earned Hours / PLAN_VALUE_HOURS) * 100`
- Earned Hours calculated using `calculateTaskHours()`
- Capped at 0-100%

**2. Task Hours Calculation**

```typescript
calculateTaskHours(issue: BacklogIssue): number
```

Logic:

- **For Closed tasks**:
  - Use `actualHours` if available
  - Otherwise: Calculate from `startDate` to `actualEndDate`
- **For In-Progress tasks**:
  - Must have `startDate`
  - Formula: `actualHours * phaseRatio`
  - Phase ratios based on category:
    - Requirement: 20%
    - Development: 60%
    - Testing: 80%
    - UAT: 80%
    - Release: 100%

**3. Estimate Completed**

```typescript
calculateEstimateCompleted(issues: BacklogIssue[]): { completed: number; total: number }
```

- Completed: Sum of all `actualHours` (no phase ratio)
- Total: `PLAN_VALUE_HOURS` constant

**4. Tasks Completed**

```typescript
calculateTasksCompleted(issues: BacklogIssue[]): { completed: number; total: number }
```

- Completed: Count of tasks with `status.name === "Closed"`
- Total: Total count of issues

**5. USP Completed**

```typescript
calculateUSPCompleted(issues: BacklogIssue[]): { completed: number; total: number }
```

- Completed: Sum of "point" custom field from Closed tasks
- Total: `TOTAL_USP` constant
- Point extraction: Searches `customFields` for field named "point"

**6. Category Mapping**

```typescript
mapBacklogCategoryToTaskStatus(categories: BacklogCategoryItem[]): TaskType
```

Maps Backlog categories to internal TaskType enum:

- "Clear Requirement" → Requirement
- "Coding" → Development
- "Testing" → Testing
- "UAT" → UAT
- "Release" → Release

---

## 4. Constants and Configuration

### 4.1 Constants (`constants/common.ts`)

```typescript
PLAN_VALUE_HOURS: number // Total planned hours for the project
TOTAL_USP: number // Total User Story Points

PHASE_COMPLETION_RATIO: {
  REQUIREMENT: 0 
  DEVELOPMENT: 0.2,  
  TESTING: 0.6,     
  UAT: 0.8,        
  RELEASE: 0.8       
}

QUERY_KEYS: {
  BACKLOG: {
    ISSUES: string
  }
}
```

### 4.2 Enums (`types/enums/common.ts`)

```typescript
enum TaskStatus {
  Closed = "Closed",
  // ... other statuses
}

enum TaskType {
  Requirement = "Requirement",
  Development = "Development",
  Testing = "Testing",
  UAT = "UAT",
  Release = "Release",
}

enum BacklogCategory {
  ClearRequirement = "Clear Requirement",
  Coding = "Coding",
  Testing = "Testing",
  UAT = "UAT",
  Release = "Release",
}
```

---

## 5. UI/UX Implementation

### 5.1 Layout Structure

**Grid Layout**:

- **Top Row**: 4 columns (responsive: 2 on tablet, 4 on desktop)
  - Each column contains a `MetricCard`
- **Bottom Row**: 7 columns total (responsive)
  - Left: 3 columns - `HealthIndicators`
  - Right: 4 columns - `KeyAchievements`

### 5.2 Styling

- **Theme**: Dark mode with shadcn/ui components
- **Cards**: `bg-card text-card-foreground`
- **Spacing**: `space-y-6` between rows, `gap-4` between cards
- **Typography**:
  - Page title: `text-3xl font-bold tracking-tight`
  - Card titles: `text-sm font-medium`
  - Main values: `text-2xl font-bold`
  - Sub values: `text-xs text-muted-foreground`

### 5.3 State Handling

**Loading State**:

```tsx
<Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
```

- Centered in 400px min-height container

**Error State**:

```tsx
<p className="text-muted-foreground text-sm">Có lỗi xảy ra khi tải dữ liệu</p>
```

- Vietnamese error message
- Centered in 400px min-height container

---

## 6. Performance Optimizations

### 6.1 Memoization

All metric calculations use `useMemo` to prevent unnecessary recalculations:

```typescript
const overallCompletion = useMemo(() => {
  if (gtasks.length === 0) return 0;
  return calculateOverallCompletion(gtasks);
}, [gtasks]);
```

Dependencies:

- `overallCompletion`, `estimateCompleted`: `[gtasks]`
- `tasksCompleted`, `uspCompleted`: `[regularTasks]`

### 6.2 Data Caching

- React Query automatically caches Backlog API responses
- Cache key: `[QUERY_KEYS.BACKLOG.ISSUES, issueTypeIds]`
- Prevents redundant API calls

---

## 7. Current Limitations & Future Enhancements

### 7.1 Current Limitations

1. **Static Health Indicators**: Hardcoded values, not dynamic
2. **No Achievement Persistence**: Textarea doesn't save data
3. **No Weekly Delta**: Tasks Completed doesn't show "+X this week"
4. **Fixed Constants**: `PLAN_VALUE_HOURS` and `TOTAL_USP` are hardcoded
5. **No Pagination**: Limited to 100 issues from Backlog API
6. **No Date Range Filter**: Shows all-time data, no weekly/monthly views

### 7.2 Planned Enhancements (Per PRD)

**Phase 3 - Interactive Features**:

- [ ] Add database table for `DashboardMeta` (health status, achievements)
- [ ] Create API endpoints for updating health indicators
- [ ] Create API endpoints for saving key achievements
- [ ] Add "Edit" mode for admin users
- [ ] Implement weekly delta calculation for Tasks Completed
- [ ] Add date range filters

---

## 8. Testing Scenarios

### 8.1 Happy Path

**Scenario**: Project with mixed task statuses

- **Input**: 10 GTasks (5 Closed, 5 In-Progress), 20 regular tasks (10 Closed)
- **Expected Output**:
  - Overall Completion: Calculated based on earned hours
  - Estimate Completed: Sum of actual hours / PLAN_VALUE_HOURS
  - Tasks Completed: 10/20
  - USP Completed: Sum of points from 10 closed tasks / TOTAL_USP

### 8.2 Edge Cases

| Case                    | Current Behavior                   | Expected Behavior   |
| ----------------------- | ---------------------------------- | ------------------- |
| No issues in project    | Shows 0 for all metrics            | ✅ Correct          |
| All GTasks, no tasks    | Tasks/USP show 0/0                 | ✅ Correct          |
| No actualHours data     | Falls back to date calculation     | ✅ Correct          |
| No startDate for task   | Returns 0 hours                    | ✅ Correct          |
| PLAN_VALUE_HOURS = 0    | Division by zero → NaN or Infinity | ⚠️ Needs validation |
| No "point" custom field | Returns 0 for USP                  | ✅ Correct          |
| Issue type not "gtask"  | Treated as regular task            | ✅ Correct          |
| More than 100 issues    | Only shows first 100               | ⚠️ Needs pagination |
| API failure             | Shows error message                | ✅ Correct          |
| Slow API response       | Shows loading spinner              | ✅ Correct          |

### 8.3 Data Validation

**Required Validations**:

1. ✅ Prevent division by zero in completion calculations
2. ✅ Handle null/undefined actualHours gracefully
3. ✅ Validate date formats before calculations
4. ✅ Handle missing custom fields
5. ⚠️ Validate PLAN_VALUE_HOURS > 0 (not implemented)
6. ⚠️ Validate TOTAL_USP > 0 (not implemented)

---

## 9. Dependencies

### 9.1 External Libraries

- **React Query** (`@tanstack/react-query`): Data fetching and caching
- **shadcn/ui**: UI components (Card, Progress, Textarea)
- **Lucide React**: Icons (Loader2)
- **clsx + tailwind-merge**: Utility for className merging

### 9.2 Internal Dependencies

- `@/lib/api/backlog`: Backlog API integration
- `@/hooks/useBacklogIssues`: React Query hook
- `@/lib/utils`: Calculation utilities
- `@/constants/common`: Constants and query keys
- `@/types/enums/common`: Type definitions
- `@/components/ui/*`: shadcn/ui components

---

## 10. File Structure

```
app/dashboard/workload/
└── page.tsx                           # Page component

components/dashboard/workload/
├── WorkloadDashboard.tsx              # Main dashboard logic
├── MetricCard.tsx                     # Reusable metric card
├── HealthIndicators.tsx               # Health status display
└── KeyAchievements.tsx                # Achievements textarea

lib/
├── api/
│   └── backlog.ts                     # Backlog API client
└── utils/
    └── index.ts                       # Calculation utilities

hooks/
└── useBacklogIssues.ts                # React Query hook

constants/
└── common.ts                          # Constants and config

types/enums/
└── common.ts                          # Enum definitions
```

---

## 11. Key Insights

### 11.1 Design Decisions

1. **Separation of GTasks and Regular Tasks**: GTasks are used for hour-based metrics (Overall Completion, Estimate), while regular tasks are used for count-based metrics (Tasks, USP)

2. **Phase-Based Completion**: In-progress tasks contribute partial value based on their current phase, providing more accurate progress tracking

3. **Memoization Strategy**: All calculations are memoized to prevent performance issues when re-rendering

4. **Static Bottom Sections**: Health and Achievements are currently static to deliver Phase 1 quickly, with interactivity planned for Phase 3

### 11.2 Business Logic Highlights

- **Earned Value Calculation**: Complex logic that considers task status, phase, and time tracking
- **Dual Data Sources**: GTasks for effort metrics, regular tasks for deliverable metrics
- **Flexible Category Mapping**: Handles both exact matches and fuzzy matching for Backlog categories

### 11.3 Potential Improvements

1. **Error Boundaries**: Add React error boundaries for better error handling
2. **Retry Logic**: Add retry mechanism for failed API calls
3. **Optimistic Updates**: For Phase 3 edit features
4. **Real-time Updates**: WebSocket or polling for live data
5. **Export Functionality**: Allow exporting dashboard data as PDF/Excel
6. **Historical Tracking**: Store snapshots for trend analysis
7. **Configurable Constants**: Move PLAN_VALUE_HOURS and TOTAL_USP to database

---

## 12. References

- **Related PRD**: `PRD_dashboard.md` (DASH-002)
- **Backlog API Documentation**: Backlog REST API v2
- **Design System**: shadcn/ui documentation
- **React Query**: TanStack Query v4/v5 documentation
