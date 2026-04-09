# Báo cáo: PerformanceMemberTab gặp lỗi 429 (Rate Limit)

## 1) Hiện trạng

Màn `components/dashboard/customer-value/PerformanceMemberTab.tsx` hiện đang:

- Lấy danh sách project ACMS có `backlog_project_id` (tức project đã mapping sang Backlog).
- Với **mỗi** project mapping, gọi Backlog API để lấy:
  - `GET /projects/:id/users` (members)
  - `GET /projects/:id/statuses` (statuses)
  - `GET /projects/:id/issueTypes` (issue types)
  - `GET /issues` + filter client theo `Actual End-date` (issues trong khoảng ngày)

Tức tổng số request Backlog xấp xỉ:  
\[
  \text{requests} \approx 4 \times N
\]
với \(N\) là số project đã mapping backlog.

## 2) Lý do trước đây không có vấn đề

Trước đây số lượng project mapping backlog còn ít (N nhỏ) → tổng request thấp, ít khi chạm rate limit.

## 3) Vấn đề hiện tại

Khi số lượng project mapping backlog tăng (N lớn), tổng số request tăng tuyến tính theo \(4N\) → dễ gặp lỗi:

- `429 Rate Limit Exceeded` từ Backlog API
- UI load chậm / timeout / fail nhiều lần khi đổi khoảng ngày hoặc filter

## 4) Nguyên nhân kỹ thuật

Màn đang **quét toàn bộ** dự án mapping backlog trong một lần render/query (Promise.all theo danh sách mapping).
Điều này tạo burst request lớn trong thời gian ngắn.

## 5) Đề xuất hướng xử lý

### Phương án A (khuyến nghị): Xem performance theo từng dự án cụ thể

- UI bắt buộc/chủ động chọn **1 project** khi xem Performance (filter project).
- Chỉ fetch backlog data cho đúng project đó.
- Ưu điểm: giảm request xuống còn ~4 request/lần xem, tránh 429 đáng kể.
- Nhược điểm: không còn “toàn cảnh tất cả dự án” trong 1 lần load.

### Phương án B: Giảm request nhưng vẫn cho xem nhiều dự án

- Cache `statuses` + `issueTypes` theo project, chỉ fetch lại khi cần.
- Giới hạn concurrency (queue) khi call Backlog, tránh burst.
- Chia nhỏ theo trang dự án hoặc theo team.

## 6) Khuyến nghị triển khai

Ưu tiên triển khai Phương án A để chặn 429 ngay, sau đó cân nhắc bổ sung Phương án B nếu vẫn cần view tổng hợp.

