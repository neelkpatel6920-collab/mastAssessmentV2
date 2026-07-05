import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="panel w-full max-w-md rounded-2xl p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">MAST Admin</p>
        <h1 className="mt-3 text-3xl font-bold text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Use your admin account to access scoped MAST responses.</p>
        <LoginForm />
      </section>
    </main>
  );
}
