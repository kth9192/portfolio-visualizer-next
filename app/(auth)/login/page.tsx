"use client";

import GoogleSignInButton from "@/components/button/googleLoginBtn";
import CustomSpinner from "@/components/spinner/customSpinner";
import { showToast } from "@/components/toast/customToast";
import { Button } from "@/components/ui/button";
import { usePostGuestLogin } from "@/lib/hooks/query/usePostGuestLogin";
import { useRouter } from "next/navigation";

function LoginPage() {
  const router = useRouter();

  const { mutateAsync, isPending } = usePostGuestLogin({
    onCreateSuccess: () => {
      setTimeout(() => {
        showToast.success("로그인 성공");
        router.push("/");
      }, 1000);
    },
    onCreateError: (error) => {
      showToast.error("로그인 실패");
      console.log(error);
    },
  });

  const handleGuestLogin = async () => {
    try {
      await mutateAsync();
    } catch (error) {
      console.error(error);
      showToast.error("로그인 실패");
    }
  };

  return (
    <section className="flex justify-center items-center h-screen bg-gray-50">
      <div className="flex flex-col w-full max-w-sm mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-gray-900 mb-3">Welcome!</h1>
          <div className="w-12 h-0.5 bg-blue-600 mx-auto"></div>
        </div>

        {/*개발 모드 전용 로그인 폼 */}
        {process.env.NODE_ENV === "development" && (
          // <form className="space-y-6">
          //   <div className="space-y-1">
          //     <Input
          //       type="email"
          //       className="w-full px-0 py-3 rounded-none border-0 border-b-2 border-gray-200 bg-transparent  placeholder-gray-400 transition-colors shadow-none"
          //       placeholder="Email Address"
          //     />
          //   </div>

          //   <div className="space-y-1">
          //     <Input
          //       type="password"
          //       className="w-full px-0 py-3 rounded-none border-0 border-b-2 border-gray-200 bg-transparent  placeholder-gray-400 transition-colors shadow-none"
          //       placeholder="Password"
          //     />
          //   </div>

          //   <div className="pt-4">
          //     <button
          //       type="submit"
          //       className="w-full bg-black text-white py-3 px-6 rounded-none hover:bg-black/80 transition-colors"
          //     >
          //       로그인
          //     </button>
          //   </div>
          // </form>
          <GoogleSignInButton size="sm" />
        )}

        {/* 임시 계정 발급 및 로그인 */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {isPending ? (
            <CustomSpinner className="size-10" />
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="w-full h-10 underline py-5 shadow bg-white hover:text-white hover:bg-black  transition-colors"
              onClick={handleGuestLogin}
            >
              가입없이 로그인하기
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
