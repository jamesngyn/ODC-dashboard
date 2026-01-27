# ODC Dashboard

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Cài đặt & Khởi động](#cài-đặt--khởi-động)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Quy tắc phát triển](#quy-tắc-phát-triển)
- [Testing](#testing)
- [Liên hệ](#liên-hệ)

---

## Giới thiệu

ODC Dashboard là một nền tảng analytics và quản lý dự án được xây dựng với Next.js 15, React 19, TypeScript, shadcn/ui, React Query, và i18next. 

Ứng dụng cung cấp các dashboard tổng quan về tiến độ dự án, workload, chất lượng, velocity và hiệu suất team, giúp Project Managers và Stakeholders có cái nhìn toàn diện về tình trạng dự án.

**Tech Stack:**
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5.8
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: React Query (TanStack Query)
- **Internationalization**: i18next, react-i18next
- **Styling**: Tailwind CSS 4
- **Form Handling**: React Hook Form, Zod
- **Charts**: Recharts
- **API Client**: Axios

---

## Tính năng

### Dashboard Pages

- **Progress Overview**: Tổng quan tiến độ dự án với phân bố task theo phase (Dev, Test, UAT)
- **Workload**: Khối lượng công việc hoàn thành với metrics về Hours, Tasks, và USP
- **Team Productivity**: Năng suất và hiệu quả làm việc của team
- **Quality KPI**: Chỉ số chất lượng phần mềm (Defect Density, Defect Leakage, Severity Breakdown)
- **Customer Value**: Giá trị mang lại cho khách hàng
- **Team Velocity**: Vận tốc phát triển của team theo sprint
- **Resource Utilization**: Sử dụng tài nguyên
- **Internal Performance**: Hiệu suất nội bộ

### Tính năng khác

- ✅ Đa ngôn ngữ (Tiếng Việt, English, 日本語)
- ✅ Dark/Light theme
- ✅ Responsive design
- ✅ Tích hợp Backlog API
- ✅ Authentication (Login/Register)

---

## Cài đặt & Khởi động

### Yêu cầu

- Node.js 18+ 
- pnpm (khuyến nghị) hoặc npm/yarn

### Cài đặt

```bash
# Clone repository
git clone git@git.amela.vn:duyen.ngothi/odc-dashboard.git

# Di chuyển vào thư mục project
cd odc-dashboard

# Cài đặt dependencies
pnpm install
```

### Khởi động

```bash
# Development mode
pnpm dev

# Build production
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

---

## Cấu trúc thư mục

```
odc-dashboard/
├── app/                      # Next.js App Router
│   ├── auth/                 # Authentication pages (login, register)
│   ├── dashboard/            # Dashboard pages
│   │   ├── progress-overview/
│   │   ├── workload/
│   │   ├── team-productivity/
│   │   ├── quality-kpi/
│   │   ├── customer-value/
│   │   ├── velocity/
│   │   ├── resource-utilization/
│   │   └── internal-performance/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── not-found.tsx         # 404 page
├── components/                # React components
│   ├── dashboard/            # Dashboard-specific components
│   ├── layout/               # Layout components (AppSidebar, ...)
│   ├── ui/                   # shadcn/ui components
│   ├── locale-toggle.tsx     # Language switcher
│   ├── theme-toggle.tsx      # Theme switcher
│   └── provider.tsx          # App providers
├── constants/                 # Constants và configuration
│   ├── common.ts             # Common constants (query keys, ...)
│   ├── config.ts             # App configuration
│   ├── navigation.ts         # Navigation config
│   └── schema.ts             # Zod schemas
├── hooks/                     # Custom React hooks
│   ├── useBacklog*.ts        # Backlog API hooks
│   ├── useDebounce.ts
│   └── use-mobile.ts
├── lib/                       # Utilities và helpers
│   ├── api/                  # API clients (axios, backlog)
│   ├── utils/                # Utility functions
│   ├── i18n.ts               # i18next configuration
│   ├── quality-kpi.ts
│   └── velocity.ts
├── locales/                   # Translation files
│   ├── vi/                   # Tiếng Việt
│   ├── en/                   # English
│   └── ja/                   # 日本語
├── types/                     # TypeScript types
│   ├── interfaces/           # TypeScript interfaces
│   ├── enums/                # Enums (as const maps)
│   └── dashboard.ts
├── __tests__/                # Test files
├── public/                   # Static assets
└── ...
```

---

## Quy tắc phát triển

### Code Style

- **TypeScript 100%**: Ưu tiên interface, tránh enum (dùng const map), type-safe mọi nơi
- **Component structure**: Exports → Subcomponents → Helpers → Types
- **Naming conventions**:
  - Descriptive names với auxiliary verbs: `isLoading`, `hasError`, `canEdit`
  - Event handlers prefix `handle`: `handleClick`, `handleSubmit`
- **DRY principle**: Functional, declarative code
- **Early returns**: Cho logic rõ ràng hơn

### File Organization

- **Query keys**: Định nghĩa tại `constants/common.ts`
- **Interfaces**: Định nghĩa tại `types/interfaces/`
- **Enums**: Định nghĩa tại `types/enums/` (dùng const map thay vì enum)
- **Schemas**: Định nghĩa tại `constants/schema.ts`

### Best Practices

- ✅ Sử dụng React Server Components (RSC) khi có thể
- ✅ Minimize `'use client'` directives
- ✅ Sử dụng shadcn/ui cho UI components
- ✅ Sử dụng Zod cho validation
- ✅ Sử dụng React Hook Form cho forms
- ✅ Tất cả text phải dùng translation keys (không hardcode)
- ✅ Tất cả page mới phải có unit test

### Next.js 15 App Router

- Sử dụng async runtime APIs:
  ```typescript
  const cookieStore = await cookies()
  const headersList = await headers()
  const params = await props.params
  ```

---

## Testing

- Viết unit test cho mọi page, component, và logic quan trọng
- Đặt file test trong `__tests__/` hoặc cùng thư mục với file chính
- Sử dụng Jest và Testing Library
- Không merge PR nếu thiếu test cho page mới

```bash
# Run tests in watch mode
pnpm test

# Run tests in CI mode
pnpm test:ci
```

---

## Liên hệ

- **Repository**: git@git.amela.vn:duyen.ngothi/odc-dashboard.git
- **Đóng góp**: Mở Pull Request, tuân thủ quy tắc phát triển

---

## License

Private - Amela Technology
