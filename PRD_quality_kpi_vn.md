# Đặc tả Tác vụ

## 1. Tổng quan

| Trường  | Giá trị               |
| ------- | --------------------- |
| Mã Task | DASH-003              |
| Tiêu đề | Quality KPI Dashboard |
| Loại    | `feature`             |
| Mức độ  | `medium`              |

### Vấn đề

Đội ngũ QA và Quản lý dự án cần một cái nhìn tổng hợp về các chỉ số chất lượng phần mềm để đảm bảo sản phẩm đáp ứng tiêu chuẩn phát hành. Hiện tại, dữ liệu lỗi được lưu trong Backlog, nhưng việc tính toán các chỉ số chính như Mật độ Lỗi (Defect Density) và Tỷ lệ Lọt lỗi (Leakage Rate) đòi hỏi trích xuất và xử lý thủ công.

### Giải pháp

Triển khai trang dashboard "Quality KPI" trực quan hóa các chỉ số chất lượng thời gian thực từ Backlog issues. Các tính năng chính bao gồm theo dõi Mật độ Lỗi, giám sát Lọt lỗi, phân tích mức độ nghiêm trọng và xu hướng lỗi hàng tuần.

---

## 2. Yêu cầu Sản phẩm (PRD)

### 2.1 User Stories

```
Là QA Lead
Tôi muốn theo dõi "Defect Density" qua các sprint khác nhau
Để tôi có thể xem liệu chất lượng code đang cải thiện hay suy giảm theo thời gian.
```

```
Là Product Owner
Tôi muốn biết tỷ lệ "Defect Leakage" (lỗi lọt ra production)
Để tôi có thể đánh giá hiệu quả của quy trình kiểm thử trước khi phát hành.
```

```
Là Developer
Tôi muốn xem phân bổ bug theo mức độ nghiêm trọng
Để tôi có thể ưu tiên sửa các vấn đề Critical và Major trước.
```

### 2.2 Yêu cầu Chức năng

| #   | Tính năng                     | Mô tả                                                                                            | Mức độ |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------ | ------ |
| F1  | Chỉ số Defect Density         | Hiển thị Defect Density hiện tại (Weighted Severity trên giờ sửa lỗi).                           | Must   |
| F2  | Chỉ số Defect Leakage         | Hiển thị Defect Leakage Rate hiện tại (Weighted Severity của Leakage bugs trên giờ sửa leakage). | Must   |
| F3  | Biểu đồ Defect Density        | Biểu đồ đường hiển thị xu hướng Defect Density qua các sprint/milestone gần đây.                 | Must   |
| F4  | Biểu đồ Xu hướng Lỗi          | Biểu đồ đường hiển thị số lượng lỗi Found vs. Fixed vs. Closed theo tuần.                        | Must   |
| F5  | Phân tích Mức độ nghiêm trọng | Biểu đồ thanh hiển thị số lượng bug theo severity (Critical, Major, Normal, Low).                | Must   |
| F6  | Quality Insights              | Danh sách các insight định tính tự động (VD: "Mật độ lỗi đã cải thiện").                         | Should |
| F7  | Testing Coverage              | Trực quan hóa độ bao phủ kiểm thử (Unit, Integration, System) - Hiện là Mock.                    | Could  |

### 2.3 Yêu cầu UI/UX

- **Màn hình**: Quality KPI Page (`/dashboard/quality-kpi`).
- **Bố cục**:
  - **Hàng trên**: 2 Biểu đồ chính.
    1.  **Defect Density Tracking**: Biểu đồ đường với dòng tham chiếu mục tiêu (Target: < 2.0).
    2.  **Defect Trends by Phase**: Biểu đồ đa đường cho số lượng Found/Fixed/Closed mỗi tuần.
  - **Hàng giữa**: Các thẻ chỉ số.
    1.  **Defect Density**: Số lớn + nhãn phụ + màu trạng thái (Xanh nếu < 2.0, ngược lại Xanh dương).
    2.  **Defect Leakage**: Số lớn + nhãn phụ + màu trạng thái (Xanh nếu < 0.05, ngược lại Xanh dương).
  - **Hàng dưới**: 3 Thẻ chi tiết.
    1.  **Severity Breakdown**: Biểu đồ thanh ngang.
    2.  **Testing Coverage**: Thanh tiến trình cho các mức độ kiểm thử khác nhau.
    3.  **Quality Insights**: Danh sách cảnh báo văn bản với icon mức độ.
- **Màu sắc**:
  - Critical/Crash: Đỏ
  - Major: Cam
  - Normal: Xanh dương
  - Low: Xám
  - Đường "Found": Đỏ
  - Đường "Fixed": Xanh lá
  - Đường "Closed": Tím

### 2.4 Quy tắc Nghiệp vụ (Cập nhật theo Logic Thực tế)

```
QUY TẮC 1: Tính toán Defect Density (Mật độ Lỗi)
- Công thức: (Tổng Weighted Severity của tất cả Bug) / (Tổng Actual Hours spent on Bugs)
  (Lưu ý: Logic Code chia cho Giờ thực tế sửa lỗi, KHÔNG chia cho Man Months của dự án như PRD gốc).
- Weighted Severity Logic:
  - Crash/Critical: Trọng số 10
  - Major: Trọng số 5
  - Normal: Trọng số 3
  - Low: Trọng số 1
- Ý nghĩa thực tế: Số điểm nghiêm trọng trung bình trên mỗi giờ bỏ ra để sửa lỗi (hoặc xử lý lỗi).

QUY TẮC 2: Tính toán Defect Leakage (Tỷ lệ Lọt lỗi)
- Công thức: (Tổng Weighted Severity của Leakage Bugs) / (Tổng Actual Hours spent on Leakage Bugs)
  (Lưu ý: Logic Code tính toán "Mật độ nghiêm trọng của Leakage" trên giờ sửa leakage, KHÔNG phải tỷ lệ % số lượng bug lọt lưới).
- Bug "Leakage": Bug có custom field "Bug Type" là "Leakage".
- Target Code: < 0.05 (Thấp hơn 0.05 điểm nghiêm trọng trên mỗi giờ sửa leakage).

QUY TẮC 3: Phân loại Bug
- Loại Issue: Phải là "Bug" (không phân biệt hoa thường).
- Custom Field "Bug Type":
  - "Internal Bug": Tìm thấy bởi QA/Dev nội bộ.
  - "External Bug": Tìm thấy bởi Client/UAT.
  - "Leakage": Bug tìm thấy trên Production.
- Custom Field "Bug Severity": Map sang Critical, Major, Normal, Low. Mặc định là Normal nếu thiếu.

QUY TẮC 4: Xu hướng Lỗi (Defect Trends)
- "Found": Số lượng bug Được tạo (Created) trong tuần.
- "Fixed": Số lượng bug Đã giải quyết/Đóng (Resolved/Closed) có "Actual End Date" (hoặc Updated date) trong tuần.
- "Closed": Số lượng bug Đã đóng (Closed) có "Actual End Date" trong tuần.
- Khoảng thời gian: 4 tuần gần nhất.
```

---

## 3. Kế hoạch Triển khai

### Giai đoạn 1: Cấu trúc Dashboard & Component Tĩnh

**Phạm vi:** Xây dựng bố cục và component trực quan.

**Hoàn thành khi:**

- [x] Tất cả biểu đồ và thẻ render với dữ liệu mock.
- [x] Bố cục responsive được triển khai.

---

### Giai đoạn 2: Tích hợp Dữ liệu & Logic

**Phạm vi:** Kết nối API Backlog và triển khai tính toán chỉ số.

| Lớp      | Công việc                                                             |
| -------- | --------------------------------------------------------------------- |
| Backend  | Triển khai `getBacklogIssues` với bộ lọc loại issue "Bug".            |
| Backend  | Triển khai `getBacklogMilestones`.                                    |
| Frontend | Triển khai logic `calculateDefectDensity` với trọng số và giờ actual. |
| Frontend | Triển khai logic `calculateDefectLeakage` (theo trọng số/giờ).        |
| Frontend | Triển khai `computeDefectTrendsByWeek` để phân tích xu hướng.         |
| Frontend | Triển khai `getSeverityCountsFromBugs`.                               |
| Frontend | Tạo hook `useDefectDensityBySprint` để tổng hợp dữ liệu theo sprint.  |

**Hoàn thành khi:**

- [x] Chỉ số Defect Density phản ánh dữ liệu trọng số thực tế.
- [x] Chỉ số Defect Leakage (dựa trên trọng số) được hiển thị.
- [x] Biểu đồ xu hướng hiển thị dữ liệu thực từ 4 tuần qua.
- [x] Phân tích mức độ nghiêm trọng khớp với dữ liệu Backlog.

---

### Giai đoạn 3: Tính năng Nâng cao (Tương lai)

**Phạm vi:** Nâng cao insight và phân tích tự động.

| Lớp      | Công việc                                                          |
| -------- | ------------------------------------------------------------------ |
| Frontend | Triển khai tạo `QualityInsights` tự động dựa trên ngưỡng.          |
| Frontend | Tích hợp dữ liệu "Testing Coverage" thực (yêu cầu tích hợp CI/CD). |
| Frontend | Thêm bộ chọn Date Range cho biểu đồ xu hướng.                      |

**Hoàn thành khi:**

- [ ] Insights tự động gắn cờ "Leakage Cao" hoặc "Mật độ Tăng".
- [ ] Testing Coverage phản ánh dữ liệu tool kiểm thử riêng biệt.

---

## 4. Quyết định Kỹ thuật

### Quy ước

- **Trọng số**: Critical(10), Major(5), Normal(3), Low(1).
- **Ngưỡng Mục tiêu**: Density < 2.0 (điểm/giờ), Leakage < 0.05 (điểm/giờ).

### Ràng buộc

- **Custom Fields**: Phụ thuộc vào tên custom field cụ thể ("Bug Type", "Bug Severity") trong Backlog. Tên không khớp sẽ dẫn đến mức "Normal" hoặc bị bỏ qua.
- **Actual Hours**: Các chỉ số phụ thuộc rất lớn vào việc log time (Actual Hours) cho task Bug. Nếu không log time, mẫu số sẽ là 0 -> Lỗi chia cho 0 hoặc vô cùng. Code hiện tại cần trả về 0 nếu hours <= 0.

---

## 5. Ví dụ & Edge Cases

### 5.1 Happy Path

**Input**:

- 1 Bug Critical (Trọng số 10) đã sửa trong 4 giờ.
- 1 Bug Normal (Trọng số 3) đã sửa trong 2 giờ.

**Kết quả**:

- Tổng Weighted Severity = 10 + 3 = 13.
- Tổng Actual Hours = 4 + 2 = 6.
- Defect Density = 13 / 6 = 2.16.

### 5.2 Edge Cases

| Trường hợp         | Hành vi mong đợi                   |
| ------------------ | ---------------------------------- |
| Không có Bug       | Density = 0, Leakage = 0.          |
| Thiếu Severity     | Mặc định là "Normal" (Trọng số 3). |
| Zero Actual Hours  | Density = 0 (Tránh chia cho 0).    |
| Không có "Leakage" | Leakage = 0.                       |

### 5.3 Xác thực dữ liệu

- Đảm bảo giá trị custom field được trim và map không phân biệt hoa thường.
- Validate parsing ngày tháng cho biểu đồ xu hướng.

---

## 6. Tiêu chí Chấp nhận (Acceptance Criteria)

| #   | Kịch bản       | Kết quả mong đợi                                            |
| --- | -------------- | ----------------------------------------------------------- |
| AC1 | Dashboard Load | Người dùng thấy biểu đồ trên, chỉ số giữa và chi tiết dưới. |
| AC2 | Density Calc   | Tính toán khớp với công thức trọng số / giờ thực tế.        |
| AC3 | Trend Chart    | Hiển thị các điểm dữ liệu cho ít nhất 4 tuần qua.           |
| AC4 | Severity       | Bug không có severity rõ ràng được đếm là Normal.           |
| AC5 | Mobile View    | Bố cục xếp chồng cho biểu đồ và thẻ.                        |

---

## 7. Tài liệu tham khảo

- **Backlog API**: [Backlog API v2 Documentation](https://developer.nulab.com/docs/backlog/)
- **Task liên quan**: DASH-001 (Progress Overview), DASH-002 (Workload)
