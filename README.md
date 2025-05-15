# Vexere FE

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Cài đặt & Khởi động](#cài-đặt--khởi-động)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Quy tắc phát triển](#quy-tắc-phát-triển)
- [Testing](#testing)
- [Liên hệ](#liên-hệ)

---

## Giới thiệu

Đây là frontend project sử dụng Next.js 15, React 19, TypeScript, shadcn/ui, React Query, Zod, và các best practice hiện đại.  
Repo này tuân thủ các quy tắc phát triển nghiêm ngặt về code style, type safety, test coverage và cấu trúc thư mục.

---

## Cài đặt & Khởi động

```bash
pnpm install
pnpm dev
```

Hoặc dùng npm/yarn tương ứng.

---

## Cấu trúc thư mục

```
vexere-fe/
├── app/                  # Next.js app directory (routing, page, layout, ...), chia module rõ ràng
│   ├── auth/             # Các route xác thực: login, register
│   ├── page.tsx          # Trang chính
│   ├── layout.tsx        # Layout gốc
│   └── ...
├── components/           # UI components (shadcn/ui, custom component, provider, icon, ...)
│   └── ui/               # Các component shadcn/ui (button, input, form, alert, ...)
├── constants/            # Các hằng số dùng chung (query key, schema, config, ...)
├── hooks/                # Custom React hooks (logic dùng lại)
├── lib/                  # Helper, API client, utils
│   ├── api/              # API helper (axios, ...)
│   └── utils/            # Hàm tiện ích dùng lại
├── types/                # TypeScript type, interface, enum
│   ├── interfaces/       # Định nghĩa interface chung (API, model, ...)
│   └── enums/            # Định nghĩa enum (nếu có)
├── __tests__/            # Unit test cho page, component, module
├── public/               # Static assets (ảnh, favicon, ...)
├── .gitlab-ci.yml        # CI config
├── package.json
├── tsconfig.json
├── README.md             # Hướng dẫn sử dụng repo
└── ...
```

---

## Quy tắc phát triển

- **TypeScript 100%**: Ưu tiên interface, tránh enum, dùng const map, type-safe mọi nơi.
- **Component logic rõ ràng**: Exports, subcomponents, helpers, types.
- **Đặt tên descriptive, dùng auxiliary verbs**: `isLoading`, `hasError`, ...
- **Event handler prefix `handle`**: `handleClick`, `handleSubmit`, ...
- **DRY, functional, declarative code.**
- **Early return cho logic rõ ràng.**
- **Tất cả page mới phải có unit test tương ứng.**
- **Sử dụng shadcn/ui cho UI, Zod cho validation, React Hook Form cho form.**
- **Query key quản lý tập trung tại `constants/common.ts`.**
- **Interface dùng chung quản lý tại `types/interfaces/common.ts`.**
- **Schema dùng chung quản lý tại `constants/schema.ts`.**

---

## Testing

- Viết unit test cho mọi page, component, logic quan trọng.
- Đặt file test trong `__tests__/` hoặc cùng thư mục với file chính.
- Sử dụng Jest, Testing Library.
- Không merge PR nếu thiếu test cho page mới.

---

## Liên hệ

- Đội ngũ phát triển: [Tên team/Slack/Email]
- Đóng góp: Mở PR, tuân thủ quy tắc phát triển.
