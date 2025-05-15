"use client";

export default function Home() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 p-6 dark:from-zinc-900 dark:to-zinc-800">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 rounded-2xl bg-white/80 p-8 shadow-xl dark:bg-zinc-900/80">
        <h1 className="text-center text-4xl font-extrabold text-blue-700 dark:text-blue-300">
          Chào mừng đến với dự án Repo!
        </h1>
        <p className="text-center text-lg text-zinc-700 dark:text-zinc-300">
          Đây là trang khởi tạo mặc định cho repo. Hãy bắt đầu xây dựng sản phẩm
          tuyệt vời của bạn từ đây 🚀
        </p>
      </div>
    </section>
  );
}
