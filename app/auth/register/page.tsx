"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

function getRegisterSchema(t: (key: string) => string) {
  return z
    .object({
      username: z.string().min(3, t("auth.register.usernameMinLength")),
      email: z.string().email(t("auth.register.emailInvalid")),
      password: z.string().min(6, t("auth.register.passwordMinLength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.register.passwordMismatch"),
      path: ["confirmPassword"],
    });
}

type RegisterValues = z.infer<ReturnType<typeof getRegisterSchema>>;

export default function RegisterPage() {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState("");
  const registerSchema = getRegisterSchema(t);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: RegisterValues) => {
    setServerError("");
    // TODO: Gọi API đăng ký ở đây
    // Nếu có lỗi từ server, setServerError("Lỗi ...")
    // Nếu thành công, chuyển hướng hoặc hiển thị thông báo thành công
  };

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 p-6 dark:from-zinc-900 dark:to-zinc-800">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-white/80 p-8 shadow-xl dark:bg-zinc-900/80"
          autoComplete="off"
        >
          <h1 className="text-center text-3xl font-extrabold text-blue-700 dark:text-blue-300">
            {t("auth.register.title")}
          </h1>
          {serverError && (
            <Alert variant="destructive">
              <AlertTitle>{t("common.error")}</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.register.username")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("auth.register.usernamePlaceholder")}
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.register.email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("auth.register.emailPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.register.password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("auth.register.passwordPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.register.confirmPassword")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("auth.register.confirmPasswordPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-2" disabled={isSubmitting}>
            {isSubmitting ? t("auth.register.submitting") : t("auth.register.submit")}
          </Button>
          <div className="flex flex-col items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <span>
              {t("auth.register.hasAccount")}{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {t("auth.register.login")}
              </Link>
            </span>
          </div>
        </form>
      </Form>
    </section>
  );
}
