import { z } from "zod";

// Email: chuẩn RFC, không để trống
export const emailSchema = z
  .string({ required_error: "Email không được để trống" })
  .email("Email không hợp lệ");

// Phone: chỉ nhận số, tối thiểu 9, tối đa 15 ký tự (tùy chuẩn quốc tế), không để trống
export const phoneSchema = z
  .string({ required_error: "Số điện thoại không được để trống" })
  .regex(/^\+?\d{9,15}$/, "Số điện thoại không hợp lệ");
