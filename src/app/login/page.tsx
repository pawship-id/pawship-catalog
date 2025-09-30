import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="bg-gray-100 flex items-center justify-center py-25 font-sans">
      <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg w-full max-w-lg mx-auto flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl font-normal mb-6 sm:mb-8 text-black">
            Login
          </h1>
          <div className="w-full space-y-4">
            <input
              type="email"
              placeholder="Email"
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
            />
          </div>
          <Link
            href="/forgot-password"
            className="text-xs sm:text-sm text-gray-600 mt-2 mb-4 sm:mb-6 self-start hover:underline"
          >
            Forgot your password?
          </Link>
          <button className="w-full px-4 py-3 bg-primary/90 hover:bg-primary text-white font-bold rounded-md  transition-colors duration-200 text-base sm:text-lg cursor-pointer">
            Sign in
          </button>
          <Link
            href="/register"
            className="text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6 hover:underline"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
