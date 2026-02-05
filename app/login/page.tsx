import AuthForm from "@/app/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Login to Your Account</h1>
      <AuthForm mode="login" />
    </main>
  );
}
