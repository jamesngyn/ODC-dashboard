# Đặc tả Tác vụ

## 1. Tổng quan

| Trường  | Giá trị                     |
| ------- | --------------------------- |
| Mã Task | DASH-001                    |
| Tiêu đề | Progress Overview Dashboard |
| Loại    | `feature`                   |
| Mức độ  | `high`                      |

### Vấn đề

Stakeholders và quản lý dự án cần một bản chụp nhanh, thời gian thực về trạng thái dự án để xác định các điểm tắc nghẽn và đảm bảo dự án tiến triển theo kế hoạch. Các danh sách nhiệm vụ đơn giản là không đủ để hình dung sự phân bổ tổng thể của công việc qua các giai đoạn khác nhau (Requirement, Dev, Test, UAT).

### Giải pháp

Triển khai widget dashboard "Progress Overview" trực quan hóa phân bổ nhiệm vụ bằng biểu đồ donut và cung cấp các thông tin chi tiết hữu ích (On Track, Needs Monitoring, Ready for UAT) dựa trên dữ liệu thời gian thực từ Backlog.

---

## 2. Yêu cầu Sản phẩm (PRD)

### 2.1 User Stories

```
Là Project Manager
Tôi muốn xem sự phân bổ nhiệm vụ qua các giai đoạn khác nhau (Dev, Test, UAT)
Để tôi có thể nhanh chóng hiểu được phần lớn nỗ lực của team hiện đang tập trung ở đâu.
```

```
Là QA Lead
Tôi muốn biết có bao nhiêu nhiệm vụ đã sẵn sàng cho UAT
Để tôi có thể chuẩn bị môi trường và tài nguyên kiểm thử.
```

```
Là Stakeholder
Tôi muốn xác định các nhiệm vụ "Needs Monitoring" (bị chậm hoặc tắc)
Để tôi có thể can thiệp trước khi chúng trở thành vấn đề nghiêm trọng.
```

### 2.2 Yêu cầu Chức năng

| #   | Tính năng                   | Mô tả                                                                         | Mức độ |
| --- | --------------------------- | ----------------------------------------------------------------------------- | ------ |
| F1  | Biểu đồ Phân bổ Trạng thái  | Biểu đồ Donut hiển thị phân bổ số lượng task theo giai đoạn.                  | Must   |
| F2  | Danh sách Tóm tắt Giai đoạn | Danh sách chi tiết các danh mục task với số lượng và phần trăm.               | Must   |
| F3  | Insight: On Track           | Số lượng task hoàn thành (Closed/Resolved) đúng hạn (trong khoảng Start-Due). | Must   |
| F4  | Insight: Needs Monitoring   | Số lượng task bị chậm, quá hạn hoặc tắc nghẽn.                                | Must   |
| F5  | Insight: Ready for UAT      | Số lượng task hiện đang ở giai đoạn UAT.                                      | Must   |
| F6  | Cảnh báo Tắc nghẽn          | Cảnh báo trực quan nếu số lượng task "Needs Monitoring" vượt ngưỡng (VD: 5).  | Should |

### 2.3 Yêu cầu UI/UX

- **Màn hình**: Dashboard Progress Overview Page (`/dashboard/progress-overview`).
- **Bố cục**:
  - **Phần trên**: Card tích hợp chứa cả Biểu đồ và Danh sách Tóm tắt.
    - **Trái (70%)**: Biểu đồ Donut lớn với tổng số task ở giữa.
    - **Phải (30%)**: Danh sách dọc các giai đoạn với chú thích màu, số lượng và phần trăm.
  - **Phần dưới**: 3 Card Insight Chính (Bố cục lưới).
    1.  **On Track**: Theme xanh lá, hiển thị % và số lượng task đúng tiến độ.
    2.  **Needs Monitoring**: Theme vàng, hiển thị số lượng task rủi ro. Hiển thị "⚠️ Bottleneck Detected" nếu số lượng > 5.
    3.  **Ready for UAT**: Theme tím, hiển thị số lượng task đang chờ nghiệm thu.
- **Màu sắc**:
  - Requirement: Teal/Green (#4FD2A8)
  - Development: Blue (#5C9DFF)
  - Testing: Yellow (#FFC738)
  - UAT: Purple (#A687FF)
  - Release: Dark Green (#2BC48A)
- **Tooltips**: Hover qua các phân đoạn biểu đồ để xem chi tiết.

### 2.4 Quy tắc Nghiệp vụ

```
QUY TẮC 1: Ánh xạ Giai đoạn (Phase Mapping)
- Các danh mục Backlog được map sang các giai đoạn chuẩn hóa:
  - "Clear Requirement" -> Requirement
  - "Coding" -> Development
  - "Testing" -> Testing
  - "UAT" -> UAT
  - "Release" -> Release

QUY TẮC 2: Tính toán On Track
- Tiêu chí: Task đã Closed hoặc Resolved VÀ (Ngày kết thúc thực tế nằm trong khoảng Ngày bắt đầu và Ngày hết hạn).
- Yêu cầu: Phải có Start Date, Due Date, và Actual End Date.

QUY TẮC 3: Tính toán Needs Monitoring
- Tiêu chí:
  1. Task CHƯA Closed/Resolved (tức là In Progress, Open) nhưng đã có Start/Due dates (tất cả task đang chạy được coi là cần theo dõi nếu chưa xong? Thực tế code: Nếu chưa xong -> True).
  2. HOẶC Task đã Closed/Resolved nhưng Actual End Date nằm NGOÀI khoảng [Start Date, Due Date] (Quá hạn).
- Ngưỡng cảnh báo: Nếu số lượng > 5, hiển thị cảnh báo trực quan.

QUY TẮC 4: Ready for UAT
- Tiêu chí: Số lượng task có trạng thái/danh mục hiện tại map sang "UAT".

QUY TẮC 5: Phạm vi Dữ liệu
- Tổng hợp từ tất cả issues trả về bởi Backlog API query.
- Loại bỏ các issues không map được category (nếu có strict mapping).
```

---

## 3. Kế hoạch Triển khai

### Giai đoạn 1: Xây dựng Component

**Phạm vi:** Xây dựng UI components.

| Lớp      | Công việc                                           |
| -------- | --------------------------------------------------- |
| Frontend | Tạo `ProgressOverviewWidget` container.             |
| Frontend | Tạo `StatusDonutChart` sử dụng Recharts.            |
| Frontend | Tạo `SummaryList` component cho chú thích bên cạnh. |
| Frontend | Tạo `InsightCards` component cho hàng dưới.         |

**Hoàn thành khi:**

- [x] Biểu đồ render đúng màu và text ở giữa.
- [x] Danh sách tóm tắt căn chỉnh với các phân đoạn biểu đồ.
- [x] Các card insight hiển thị mock data chính xác.

---

### Giai đoạn 2: Logic & Tích hợp

**Phạm vi:** Kết nối dữ liệu thực và triển khai logic nghiệp vụ.

| Lớp      | Công việc                                               |
| -------- | ------------------------------------------------------- |
| Frontend | Fetch issues sử dụng Backlog hook hiện có.              |
| Frontend | Triển khai utility `mapBacklogCategoryToTaskStatus`.    |
| Frontend | Triển khai logic lọc cho insights On Track/Monitor/UAT. |
| Frontend | Tính toán phần trăm phân bổ động.                       |
| Frontend | Xử lý trạng thái trống và loading.                      |

**Hoàn thành khi:**

- [x] "Needs Monitoring" xác định đúng các task quá hạn hoặc đang chạy.
- [x] Biểu đồ Donut phản ánh trạng thái backlog thời gian thực.
- [x] Cảnh báo tắc nghẽn xuất hiện khi vượt ngưỡng.

---

## 4. Quyết định Kỹ thuật

### Quy ước

- **Thư viện biểu đồ**: Recharts.
- **Icons**: Lucide React.
- **Styling**: Tailwind CSS + shadcn/ui.

### Ràng buộc

- **Biến động dữ liệu**: Logic "Needs Monitoring" phụ thuộc nhiều vào việc nhập liệu ngày tháng chính xác trong Backlog (Start/Due/Actual). Thiếu ngày tháng có thể làm sai lệch chỉ số này.
- **Phụ thuộc Danh mục**: Logic dựa trên việc các issue trong Backlog có trường Category chính xác.

---

## 5. Ví dụ & Edge Cases

### 5.1 Happy Path

**Input**:

- 10 Task ở Dev, 5 ở Test, 5 ở UAT.
- 15 On Track, 2 Quá hạn.

**Kết quả**:

- Biểu đồ hiển thị các phân đoạn cho Dev, Test, UAT.
- "Ready for UAT": 5.
- "Needs Monitoring": 2 (Không cảnh báo).

### 5.2 Edge Cases

| Trường hợp       | Hành vi mong đợi                                            |
| ---------------- | ----------------------------------------------------------- |
| Không có Task    | Biểu đồ trống hoặc 0 task. Insights hiển thị 0.             |
| Thiếu ngày tháng | Task bị loại khỏi tính toán "On Track" (mặc định là false). |
| Vượt ngưỡng      | Card "Needs Monitoring" hiển thị text cảnh báo thêm.        |

### 5.3 Xác thực dữ liệu

- Phần trăm phải tổng bằng 100% (xử lý làm tròn).
- Đảm bảo số lượng task không âm.

---

## 6. Tiêu chí Chấp nhận (Acceptance Criteria)

| #   | Kịch bản          | Kết quả mong đợi                                             |
| --- | ----------------- | ------------------------------------------------------------ |
| AC1 | Dashboard Load    | Người dùng thấy biểu đồ Donut và 3 card insight.             |
| AC2 | Tương tác Biểu đồ | Hover qua phân đoạn biểu đồ hiển thị số lượng phase đó.      |
| AC3 | UAT Insight       | Số lượng khớp với số task trong danh mục UAT.                |
| AC4 | Monitor Alert     | Nếu 6 task cần theo dõi, text cảnh báo hiển thị.             |
| AC5 | Mobile View       | Biểu đồ và Danh sách xếp chồng dọc; Insight cards xếp chồng. |

---

## 7. Tài liệu tham khảo

- **Backlog API**: [Backlog API v2 Documentation](https://developer.nulab.com/docs/backlog/)
- **Task liên quan**: DASH-002 (Workload Dashboard)
