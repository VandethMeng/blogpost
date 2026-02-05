import AuthForm from "@/app/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Create Your Account</h1>
      <AuthForm mode="signup" />
    </main>
  );
}
