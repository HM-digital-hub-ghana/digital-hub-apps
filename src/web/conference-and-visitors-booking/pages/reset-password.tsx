import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { handleApiError } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiResetPassword } from "../service/auths";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Logo from "@/components/logo";
import { routes } from "../constants/routes";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordSchemaType = z.infer<typeof passwordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordSchemaType>({
    resolver: zodResolver(passwordSchema),
    mode: "onTouched",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Extract token from URL query parameter
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      // If no token in URL, show error and redirect
      toast.error("Invalid or missing reset token. Please request a new password reset link.");
      navigate(routes.forgotPassword);
    }
  }, [searchParams, navigate]);

  const onSubmit = async (data: PasswordSchemaType) => {
    if (!token) {
      toast.error("Reset token is missing. Please request a new password reset link.");
      return;
    }

    try {
      await apiResetPassword({
        token,
        password: data.password,
      });
      toast.success("Password reset successfully! Redirecting to login...");
      form.reset();
      //redirect to login
      setTimeout(() => {
        navigate(routes.login);
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = handleApiError(
        error,
        "Password reset failed. Please try again.",
        "ResetPassword.onSubmit"
      );
      toast.error(errorMessage);
    }
  };

  return (
    <div className="relative flex justify-center items-center md:py-0 py-40 md:h-screen px-4">
      <div className="hidden absolute top-8 left-8 md:flex items-center gap-2">
        <Logo />
      </div>

      <div className="w-full max-w-[538px] p-6 md:p-8 rounded-3xl bg-white md:shadow-[0_1px_2px_0_#00000080]">
        <div className="mb-6 space-y-3">
          <div className="md:hidden mb-12">
            <Logo />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Reset Password</h1>
          <p className="text-sm text-gray-500">
            Enter and confirm your new password
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor={field.name}
                    className="text-lg font-semibold"
                  >
                    New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id={field.name}
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                 
                  <FormLabel
                    htmlFor={field.name}
                    className="text-lg font-semibold"
                  >
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      {/*  Added id */}
                      <Input
                        id={field.name}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={!token || !form.formState.isValid || form.formState.isSubmitting}
              className="w-full mt-8"
            >
              {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
