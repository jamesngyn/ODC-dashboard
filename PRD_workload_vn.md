# Đặc tả Tác vụ

## 1. Tổng quan

| Trường  | Giá trị                       |
| ------- | ----------------------------- |
| Mã Task | DASH-002                      |
| Tiêu đề | Workload Completion Dashboard |
| Loại    | `feature`                     |
| Mức độ  | `high`                        |

### Vấn đề

Người dùng (Quản lý dự án/Stakeholders) cần một cái nhìn tổng quan cấp cao về tiến độ của dự án để hiểu khối lượng công việc đã hoàn thành so với kế hoạch, không chỉ về số lượng đầu việc mà còn xét đến số giờ dự kiến và giá trị (USP). Hiện tại, dữ liệu này nằm rải rác hoặc yêu cầu tính toán thủ công.

### Giải pháp

Triển khai widget dashboard "Completed Workload" (Khối lượng công việc hoàn thành) tổng hợp dữ liệu từ GTasks và Backlogs. Nó cung cấp các chỉ số về Tổng thể Hoàn thành (Overall Completion), Giờ (Hours), Tasks, và USP, cùng với các chỉ số sức khỏe định tính và thành tựu chính.

---

## 2. Yêu cầu Sản phẩm (PRD)

### 2.1 User Stories

```
Là Project Manager
Tôi muốn xem tỷ lệ phần trăm hoàn thành tổng thể của dự án dựa trên tiến độ thực tế (quy đổi từ Estimate)
Để tôi có thể đánh giá xem dự án có đang đi đúng hướng hay không.
```

```
Là Stakeholder
Tôi muốn xem "Estimate Completed" (Giờ thực tế đã làm) vs "Total Estimate" (Tổng giờ kế hoạch)
Để tôi hiểu mức độ tiêu thụ tài nguyên so với kế hoạch.
```

```
Là Team Lead
Tôi muốn ghi lại các thành tựu chính trong tuần
Để các điểm nổi bật của team được hiển thị trên dashboard.
```

### 2.2 Yêu cầu Chức năng

| #   | Tính năng                  | Mô tả                                                                        | Mức độ |
| --- | -------------------------- | ---------------------------------------------------------------------------- | ------ |
| F1  | Widget Hoàn thành Tổng thể | Hiển thị thanh tiến trình/gauge của % hoàn thành tổng hợp.                   | Must   |
| F2  | Chỉ số Estimate            | Hiển thị Giờ đã hoàn thành (Actual) / Tổng giờ kế hoạch (Plan).              | Must   |
| F3  | Chỉ số Task                | Hiển thị số Task đã hoàn thành / Tổng số Task (và thay đổi hàng tuần).       | Must   |
| F4  | Chỉ số USP                 | Hiển thị USP đã hoàn thành / Tổng USP.                                       | Must   |
| F5  | Chỉ số Sức khỏe            | Hiển thị trạng thái cho Thời gian, Ngân sách, Chất lượng, Phạm vi .          | Should |
| F6  | Thành tựu Chính            | Khu vực văn bản hoặc danh sách hiển thị các điểm nổi bật được nhập thủ công. | Must   |

### 2.3 Yêu cầu UI/UX

- **Màn hình**: Dashboard Workload Page (`/dashboard/workload`).
- **Bố cục**:
  - **Hàng trên**: 4 Card Chỉ số Chính (Theme tối).
    1.  **Overall Completion**: Phần trăm lớn + Thanh tiến trình.
    2.  **Estimate Completed**: Số lớn (Completed Actual) + Số nhỏ (Total Plan).
    3.  **Tasks Completed**: Số lớn (Done) / Số nhỏ (Total) + Chữ xanh cho thay đổi hàng tuần (VD: "+3 tuần này").
    4.  **USP Completed**: Số lớn (Done) / Số nhỏ (Total).
  - **Hàng dưới**:
    1.  **Health Indicators**: Danh sách dọc (Schedule, Budget, Quality, Scope) với text trạng thái có màu (Cyan/Green).
    2.  **Key Achievements**: Danh sách có gạch đầu dòng hoặc vùng nhập văn bản.
- **Responsive**: Bố cục lưới thích ứng với tablet (2 cột) và desktop (4 cột).
- **Trạng thái tải**: Hiển thị spinner khi đang tải dữ liệu.
- **Trạng thái lỗi**: Hiển thị thông báo lỗi nếu API thất bại.

### 2.4 Quy tắc Nghiệp vụ (Cập nhật theo Logic Thực tế)

```
QUY TẮC 1: Tính toán Hoàn thành Tổng thể (Overall Completion)
- Công thức: (Tổng Weighted Estimate) / (Tổng Estimated Hours của các issue) * 100
  (Logic cập nhật: Dùng Estimate * Tỷ lệ, không phải Actual)
- Weighted Estimate Logic:
  - Cho mọi task (Closed hoặc In-Progress): Estimated Hours * Tỷ lệ Hoàn thành Giai đoạn (Phase Ratio).
  - Tỷ lệ Giai đoạn:
    - Clear Requirement: 20%
    - Coding: 60%
    - Testing: 80%
    - UAT: 80%
    - Release: 100%
- Kết quả giới hạn 0-100%.

QUY TẮC 2: Estimate Completed
- Công thức: (Tổng Actual Hours của tất cả GTasks) / (Tổng Estimated Hours của tất cả GTasks).
  (Logic cập nhật: Tổng Plan/Estimate được tính động từ dữ liệu GTasks thực tế, KHÔNG dùng hằng số cấu hình).
- Actual Hours: Tổng trực tiếp, không nhân tỷ lệ giai đoạn.

QUY TẮC 3: Task Completed
- Công thức: (Số lượng Regular Tasks đã đóng) / (Tổng số Regular Tasks).
  (Logic cập nhật: Tính toán trên Regular Tasks).

QUY TẮC 4: USP Completed
- Công thức: (Tổng Points từ các Regular Task đã đóng) / (Tổng Points của tất cả Regular Tasks).
  (Logic cập nhật: Tổng USP được tính động từ dữ liệu thực tế, KHÔNG dùng hằng số cấu hình).
- Points được trích xuất từ custom field "point" trong Backlog.
- Chỉ các Regular Task đã Đóng (Closed) mới đóng góp vào USP hoàn thành.

QUY TẮC 5: Phân tách Loại Task
- GTasks: Các vấn đề có issueType.name chứa "gtask" (không phân biệt hoa thường).
- Regular Tasks: Tất cả các vấn đề còn lại.
- GTasks được dùng cho: Overall Completion, Estimate Completed.
- Regular Tasks được dùng cho: Tasks Completed, USP Completed.

QUY TẮC 6: Chỉ số Sức khỏe
- Giá trị hardcode ban đầu:
  - Schedule: On Track (green)
  - Budget: Under Budget (cyan)
  - Quality: Meeting Target (green)
  - Scope: Controlled (cyan)

QUY TẮC 7: Ánh xạ Category sang Phase
- Backlog categories map sang các phase nội bộ:
  - "Clear Requirement" → Requirement (20%)
  - "Coding" → Development (60%)
  - "Testing" → Testing (80%)
  - "UAT" → UAT (80%)
  - "Release" → Release (100%)
```

---

## 3. Kế hoạch Triển khai

### Giai đoạn 1: Xây dựng UI Tĩnh

**Phạm vi:** Xây dựng các component trực quan với mock data.

| Lớp      | Công việc                                   |
| -------- | ------------------------------------------- |
| Frontend | Tạo dashboard container với 4 metric cards. |
| Frontend | Tạo component metric card tái sử dụng.      |
| Frontend | Tạo phần health indicators.                 |
| Frontend | Tạo phần key achievements.                  |
| Frontend | Triển khai bố cục lưới responsive.          |
| Frontend | Thêm trạng thái loading và error.           |

**Hoàn thành khi:**

- [x] UI khớp với thiết kế, khoảng cách và màu sắc đúng.
- [x] Responsive làm việc tốt trên desktop/tablet.
- [x] Loading spinner hiển thị đúng.
- [x] Thông báo lỗi hiển thị đúng.

---

### Giai đoạn 2: Tích hợp Dữ liệu (Read-Only)

**Phạm vi:** Kết nối tới Backlog API để lấy số liệu thực.

| Lớp      | Công việc                                                      |
| -------- | -------------------------------------------------------------- |
| Backend  | Tạo Backlog API client để fetch issues.                        |
| Frontend | Triển khai data fetching với caching.                          |
| Frontend | Triển khai logic phân tách task (GTasks vs Regular Tasks).     |
| Frontend | Triển khai logic tính toán Overall Completion (Estimate base). |
| Frontend | Triển khai logic tính toán Estimate Completed (Actual base).   |
| Frontend | Triển khai logic tính toán Tasks Completed.                    |
| Frontend | Triển khai logic tính toán USP Completed.                      |
| Frontend | Kết nối dữ liệu thực vào metric cards.                         |
| Config   | Định nghĩa hằng số cho plan hours, total USP, và phase ratios. |

**Hoàn thành khi:**

- [x] Số liệu phản ánh trạng thái database Backlog.
- [x] Overall Completion sử dụng tính toán giá trị dựa trên estimate và phase.
- [x] Estimate Completed hiển thị actual hours vs plan hours.
- [x] Tasks Completed hiển thị số lượng closed vs tổng số.
- [x] USP Completed hiển thị points từ closed tasks.

---

### Giai đoạn 3: Tính năng Tương tác/Admin

**Phạm vi:** Cho phép chỉnh sửa các trường thủ công (Achievements, Health).

| Lớp      | Công việc                                                               |
| -------- | ----------------------------------------------------------------------- |
| Database | Tạo bảng/storage cho `DashboardMeta` (Health status, Achievement text). |
| Backend  | API endpoints để cập nhật Health/Achievements.                          |
| Frontend | Thêm chế độ "Edit" hoặc Admin panel để nhập các giá trị này.            |
| Frontend | Triển khai chức năng lưu cho Key Achievements textarea.                 |
| Frontend | Thêm toggle/dropdown cho Health Indicators.                             |
| Frontend | Thêm tính toán weekly delta cho Tasks Completed.                        |

**Hoàn thành khi:**

- [ ] Người dùng có thể cập nhật text "Key Achievements" và lưu vào DB.
- [ ] Người dùng có thể toggle trạng thái Health và lưu thay đổi.
- [ ] Tasks Completed hiển thị "+X this week" dựa trên ngày hoàn thành.

---

## 4. Quyết định Kỹ thuật

### Quy ước

- Tên Component: Dashboard widgets tuân theo quy tắc đặt tên nhất quán.
- Patterns: Composition pattern cho dashboard widgets.
- Component tái sử dụng cho metric cards.

### Ràng buộc

- **Bắt buộc**: Logic "Overall Completion" hiện tại dựa trên Estimate.
- **Giới hạn**: Backlog API trả về tối đa 100 issues mỗi request (cần phân trang cho dự án lớn).
- **Nguồn dữ liệu**: Backlog API (`/api/v2/issues`) với xác thực API Key.

---

## 5. Ví dụ & Edge Cases

### 5.1 Happy Path

**Input →** Dự án có 100h Estimate tổng. Task A (20h) đang Coding (60%). Task B (20h) đã Release (100%).

**Kết quả →**

- Overall Completion: (20*0.6 + 20*1.0) / (20+20) = 32 / 40 = 80% (trên tổng số task hiện có).
  _Lưu ý: Code thực tế chia cho tổng estimate của issues lấy về, hoặc chia cho hằng số PLAN nếu muốn (cần kiểm tra lại implement chi tiết, hiện tại code chia cho tổng estimate của issues)._

### 5.2 Error Cases

| Trường hợp           | Hành vi mong đợi                                     |
| -------------------- | ---------------------------------------------------- |
| Không có task        | Hiển thị 0 hoặc Trạng thái Trống (0/0).              |
| API lỗi              | Hiển thị thông báo: "Có lỗi xảy ra khi tải dữ liệu". |
| Không có actualHours | Estimate Completed cộng 0 giờ.                       |

### 5.3 Xác thực dữ liệu

- Đảm bảo giá trị actual hours không âm.
- Xử lý giá trị null/undefined nhẹ nhàng.
- Giới hạn Overall Completion ở mức 0-100%.

---

## 6. Tiêu chí Chấp nhận (Acceptance Criteria)

| #    | Kịch bản                 | Kết quả mong đợi                                             |
| ---- | ------------------------ | ------------------------------------------------------------ |
| AC1  | Xem Dashboard            | Người dùng thấy 4 card trên và 2 phần dưới.                  |
| AC2  | Check Overall Completion | Phần trăm phản ánh tính toán theo trọng số giai đoạn.        |
| AC3  | Check Estimate           | Tổng actual hours khớp với dữ liệu Backlog.                  |
| AC4  | Check Tasks              | Số lượng closed task khớp với trạng thái Backlog closed.     |
| AC5  | Check USP                | Tổng points từ closed tasks khớp với tính toán.              |
| AC6  | Trạng thái Loading       | Spinner hiển thị trong khi fetch dữ liệu.                    |
| AC7  | Trạng thái Lỗi           | Thông báo lỗi hiển thị nếu API thất bại.                     |
| AC8  | Responsive               | Bố cục lưới thích ứng với tablet (2 cột) và desktop (4 cột). |
| AC9  | Health Indicators        | Hiển thị 4 trạng thái hardcoded với màu sắc đúng.            |
| AC10 | Key Achievements         | Textarea hiển thị với placeholder text.                      |

---

## 7. Tài liệu tham khảo

- **Backlog API**: [Backlog API v2 Documentation](https://developer.nulab.com/docs/backlog/)
- **Task liên quan**: DASH-001 (Progress Overview Dashboard)
