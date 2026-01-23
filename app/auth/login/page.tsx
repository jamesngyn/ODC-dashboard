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

type LoginValues = z.infer<ReturnType<typeof getLoginSchema>>;

function getLoginSchema(t: (key: string) => string) {
  return z.object({
    usernameOrEmail: z.string().min(1, t("auth.login.usernameOrEmailRequired")),
    password: z.string().min(1, t("auth.login.passwordRequired")),
  });
}

export default function LoginPage() {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState("");
  const loginSchema = getLoginSchema(t);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: LoginValues) => {
    setServerError("");
    // TODO: Gọi API đăng nhập ở đây
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
            {t("auth.login.title")}
          </h1>
          {serverError && (
            <Alert variant="destructive">
              <AlertTitle>{t("common.error")}</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="usernameOrEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.login.usernameOrEmail")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("auth.login.usernameOrEmailPlaceholder")}
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.login.password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("auth.login.passwordPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-2" disabled={isSubmitting}>
            {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
          <div className="flex flex-col items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {t("auth.login.forgotPassword")}
            </Link>
            <span>
              {t("auth.login.noAccount")}{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {t("auth.login.register")}
              </Link>
            </span>
          </div>
        </form>
      </Form>
    </section>
  );
}
