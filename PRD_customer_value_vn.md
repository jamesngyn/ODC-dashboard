# Đặc tả Tác vụ

## 1. Tổng quan

| Trường  | Giá trị                  |
| ------- | ------------------------ |
| Mã Task | DASH-004                 |
| Tiêu đề | Customer Value Dashboard |
| Loại    | `feature`                |
| Mức độ  | `medium`                 |

### Vấn đề

Đội ngũ quản lý cần theo dõi hiệu quả tài chính và hiệu suất thanh toán (billing) của đội dự án. Cụ thể, họ cần so sánh giờ "Billable" (Dự kiến/Được giao) với giờ "Earned" (Hoàn thành) để hiểu liệu đội ngũ có đang tối đa hóa tiềm năng thanh toán hoặc sử dụng hết công suất hay không.

### Giải pháp

Triển khai trang dashboard "Customer Value" tổng hợp các chỉ số "Hiệu suất Chi phí" (Cost Performance). Nó cho phép lọc theo khoảng thời gian (Tuần/Tháng) và trực quan hóa tỷ lệ hiệu suất (Earned / Billable) cho từng thành viên và toàn bộ dự án.

---

## 2. Yêu cầu Sản phẩm (PRD)

### 2.1 User Stories

```
Là Project Manager (Billing)
Tôi muốn so sánh "Estimated Hours" (Giờ dự kiến giao) vs "Earned Hours" (Giờ dự kiến hoàn thành) trong tháng hiện tại
Để tôi có thể dự báo số tiền có thể bill cho khách hàng (dựa trên khối lượng công việc đã đóng).
```

```
Là Team Lead
Tôi muốn xác định các thành viên "Under Performing" (Hoàn thành < 90% khối lượng được giao)
Để tôi có thể đảm bảo họ có đủ việc hoặc kiểm tra xem các task có bị tắc nghẽn không.
```

```
Là Stakeholder
Tôi muốn xem tỷ lệ phần trăm "Cost Performance" tổng thể
Để tôi biết liệu chúng ta có đạt mục tiêu doanh thu dựa trên các ước tính đã lên kế hoạch hay không.
```

### 2.2 Yêu cầu Chức năng

| #   | Tính năng           | Mô tả                                                                                                 | Mức độ |
| --- | ------------------- | ----------------------------------------------------------------------------------------------------- | ------ |
| F1  | Bộ lọc Thời gian    | Lọc dữ liệu theo Phạm vi thời gian (Tất cả, Tuần này, Tuần trước, Tháng này, Tháng trước).            | Must   |
| F2  | Bảng Hiệu suất Team | Bảng hiển thị Tên thành viên, Vai trò, Billable (Est), Earned (Est của task đã đóng), và % Hiệu suất. | Must   |
| F3  | Tóm tắt Hiệu suất   | Card hiển thị Tổng % Hiệu suất, Tổng Billable, và Tổng Earned.                                        | Must   |
| F4  | Chỉ số Hiệu suất    | Phân loại thành viên thành High (>100%), Optimal (90-100%), Under (<90%).                             | Must   |
| F5  | Lọc ngày động       | Lọc Backlog issues dựa trên Ngày bắt đầu (Start Date) hoặc Ngày kết thúc thực tế (Actual End Date).   | Must   |

### 2.3 Yêu cầu UI/UX

- **Màn hình**: Customer Value Page (`/dashboard/customer-value`).
- **Bố cục**:
  - **Header**: Tiêu đề trang + Dropdown chọn thời gian (Căn phải).
  - **Lưới chính**:
    - **Trái (2/3)**: Bảng Hiệu suất Chi phí Team (Team Cost Performance Table).
    - **Phải (1/3)**: Card Tóm tắt (Xếp dọc 3 chỉ số chính).
  - **Dưới cùng**: Các chỉ số Hiệu suất (Lưới 3 cards).
- **Màu sắc**:
  - High (>100%): Xanh lá (Green)
  - Optimal (90-100%): Xanh dương (Blue)
  - Under (<90%): Vàng (Yellow)
- **Trạng thái trống**: Hiển thị thông báo thân thiện nếu không có dữ liệu cho khoảng thời gian đã chọn.

### 2.4 Quy tắc Nghiệp vụ (Cập nhật theo Logic Thực tế)

```
QUY TẮC 1: Định nghĩa Chỉ số
- Billable Hours: Tổng "Estimated Hours" từ các Backlog issues được giao cho thành viên, có Start Date hoặc Actual End Date nằm trong khoảng thời gian đã chọn.
- Earned Hours: Tổng "Estimated Hours" (Lưu ý: Code sử dụng Estimated Hours, không phải Actual) của các Backlog issues ĐÃ ĐÓNG (Closed) có Actual End Date nằm trong khoảng thời gian đã chọn.
- Performance %: (Earned Hours / Billable Hours) * 100.
  -> Ý nghĩa thực tế: Tỷ lệ hoàn thành khối lượng công việc được giao (dựa trên estimate).

QUY TẮC 2: Phân loại Hiệu suất
- High Performance: > 100% (Hoàn thành nhiều hơn khối lượng được giao trong kỳ - có thể do làm xong việc tồn đọng hoặc làm nhanh).
- Optimal Performance: 90% - 100%.
- Under Performance: < 90% (Hoàn thành ít hơn khối lượng được giao).

QUY TẮC 3: Lọc dữ liệu theo Ngày
- Billable Issues: Issue được tính nếu EITHER "Start Date" OR "Actual End Date" nằm trong khoảng thời gian đã chọn.
- Earned Issues: Chỉ tính các issue có trạng thái "Closed" VÀ "Actual End Date" nằm trong khoảng thời gian đã chọn.
- Các khoảng thời gian:
  - Tuần này: Thứ Hai đến Hôm nay (hoặc Chủ Nhật).
  - Tuần trước: Thứ Hai tuần trước đến Chủ Nhật tuần trước.
  - Tháng này: Ngày 1 của tháng hiện tại đến Hôm nay.
  - Tháng trước: Ngày 1 của tháng trước đến ngày cuối cùng của tháng trước.

QUY TẮC 4: Tổng hợp dữ liệu
- Nhóm theo Người được giao (Assignee).
- Chỉ hiển thị thành viên có Billable > 0 hoặc Earned > 0.
```

---

## 3. Kế hoạch Triển khai

### Giai đoạn 1: Interactive Components

**Phạm vi:** Xây dựng UI với quản lý state.

| Lớp      | Công việc                                               |
| -------- | ------------------------------------------------------- |
| Frontend | Tạo `CustomerValueDashboard` với `useState` cho Period. |
| Frontend | Tạo `TeamCostPerformanceTable` sử dụng `CommonTable`.   |
| Frontend | Tạo `SummaryCard` cho các chỉ số tổng hợp.              |
| Frontend | Tạo logic `PerformanceIndicators` để phân loại.         |

**Hoàn thành khi:**

- [x] Bộ lọc ngày cập nhật dữ liệu hiển thị.
- [x] Bảng sắp xếp/render chính xác.
- [x] Các chỉ số đếm đúng số thành viên trong mỗi danh mục.

---

### Giai đoạn 2: Data Logic

**Phạm vi:** Triển khai các thuật toán lọc và tính toán.

| Lớp      | Công việc                                                            |
| -------- | -------------------------------------------------------------------- |
| Frontend | Triển khai helper `getDateRange` cho logic Tuần/Tháng.               |
| Frontend | Triển khai bộ lọc `isDateInRange` cho issues.                        |
| Frontend | Triển khai Logic Tổng hợp: Map issues sang Assignees và cộng giờ.    |
| Frontend | Triển khai `useMemo` hooks để tính toán lại chỉ số khi lọc thay đổi. |

**Hoàn thành khi:**

- [x] Lọc theo "Tuần trước" hiển thị tập hợp issue chính xác.
- [x] Tổng số khớp với tổng của các hàng thành viên.
- [x] Công thức "Cost Performance" xử lý được trường hợp chia cho 0.

---

## 4. Quyết định Kỹ thuật

### Quy ước

- **Mô hình**: Hiện tại logic đang tính toán dựa trên **Projected Progress** (Tiến độ theo Estimate) thay vì so sánh Cost (Actual) vs Value (Estimate).
- **Xử lý ngày tháng**: Sử dụng đối tượng `Date` của JavaScript để tính toán phạm vi.

### Ràng buộc

- **Dữ liệu Backlog**: Phụ thuộc vào việc điền đúng `estimatedHours` và trạng thái `Closed` trong Backlog.
- **Trùng lặp ngày**: Logic hiện tại bao gồm issue nếu Start hoặc End nằm trong khoảng, có thể dẫn đến việc tính "Billable" cho cùng một issue trong nhiều tuần nếu nó kéo dài (nhưng Earned chỉ tính 1 lần khi Close).

---

## 5. Ví dụ & Edge Cases

### 5.1 Happy Path

**Input**:

- Member A: Được giao 10h (Estimate), Đã đóng 1 task 12h (Estimate).
- Member B: Được giao 10h (Estimate), Đã đóng 1 task 8h (Estimate).

**Kết quả**:

- Member A: 120% (High - Hoàn thành 12h estimate trong khi được giao 10h trong kỳ này).
- Member B: 80% (Under).
- Cost Performance: 100%.

### 5.2 Edge Cases

| Trường hợp        | Hành vi mong đợi                                        |
| ----------------- | ------------------------------------------------------- |
| Không có dữ liệu  | Hiển thị trạng thái trống "Không có dữ liệu hiệu suất". |
| Estimate = 0      | Billable = 0. Performance % = 0 (Tránh vô cùng).        |
| Lọc "Tháng trước" | Chỉ issues phù hợp quy tắc ngày tháng mới được tính.    |

### 5.3 Xác thực dữ liệu

- Đảm bảo giờ được làm tròn đến số nguyên gần nhất.
- Xử lý trường hợp thiếu Assignee (bỏ qua hoặc nhóm vào "Unassigned").

---

## 6. Tiêu chí Chấp nhận (Acceptance Criteria)

| #   | Kịch bản         | Kết quả mong đợi                                       |
| --- | ---------------- | ------------------------------------------------------ |
| AC1 | Đổi kỳ           | Dữ liệu làm mới để phản ánh phạm vi thời gian đã chọn. |
| AC2 | Kiểm tra Tổng    | Card tóm tắt khớp với tổng các cột trong bảng.         |
| AC3 | Chỉ số           | Phân loại đúng thành viên dựa trên ngưỡng %.           |
| AC4 | Trạng thái Trống | Hiển thị placeholder khi không có issue nào khớp.      |

---

## 7. Tài liệu tham khảo

- **Backlog API**: [Backlog API v2 Documentation](https://developer.nulab.com/docs/backlog/)
- **Task liên quan**: DASH-002 (Workload)
