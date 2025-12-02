import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MarketingPanel } from "@/components/MarketingPanel";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link} from "react-router-dom";
import { routes } from "../constants/routes";
import Logo from "@/components/logo";
import { apiLogin } from "../service/auths";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { setNavigate } from "@/lib/navigation";
import { handleApiError } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

//  Define login schema
const staffIdSchema = z.object({
  staff_id: z.string().min(1, "Staff ID is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  rememberMe: z.boolean().optional(),
});

type StaffIdSchemaType = z.infer<typeof staffIdSchema>;

export default function LoginPage() {
  
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<StaffIdSchemaType>({
    resolver: zodResolver(staffIdSchema),
    mode: "onTouched",
    defaultValues: {
      staff_id: "",
      password: "",
      rememberMe: false,
    },
  });

  //  Handle login submission


 
 const navigate = useNavigate();
 const location = useLocation();
 const { login } = useAuth();

 // Set navigate function for axios interceptor (401 handler)
 useEffect(() => {
   setNavigate(navigate);
 }, [navigate]);

 const onSubmit = async (data: StaffIdSchemaType) => {
   try {
     const response = await apiLogin({
       staff_id: data.staff_id,
       password: data.password,
     });

     // Check if password setup is required
     if (response.data?.msg === "Password setup required" && response.data?.staff_id) {
       toast.error("Password setup required. Please create your account.");
       navigate(routes.signUp, { 
         state: { staff_id: response.data.staff_id },
         replace: true 
       });
       return;
     }

     const { access_token, user } = response.data;

     // Validate that we have the required fields for login
     if (!access_token || !user) {
       toast.error("Invalid login response. Please try again.");
       return;
     }

    // Persist via AuthContext (also stores in localStorage)
    login({ token: access_token, user });

     toast.success("Login successful!");
     console.log("Login successful:", user);

     // Redirect to 'from' if present, else dashboard
     const state = location.state as { from?: { pathname: string } } | null;
     const from = state?.from?.pathname ?? "/dashboard";
     navigate(from, { replace: true });
   } catch (error: unknown) {
     const errorMessage = handleApiError(
       error,
       "Login failed. Please check your credentials and try again.",
       "LoginPage.onSubmit"
     );
     toast.error(errorMessage);
   }
 };

  return (
    <div className="h-screen w-screen flex">
      <div className="w-full md:w-1/2 flex justify-center items-center px-4 md:px-8">
        <div className="w-full max-w-[538px] space-y-10">
          <div className="mb-16">
            <Logo />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#171923]">
                Log In
              </h1>
              <p className="text-sm mt-3 text-gray-500">
                Enter your staff ID to log in
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-10"
              >
                <div className="space-y-4">
                  {/* Staff ID */}
                  <FormField
                    control={form.control}
                    name="staff_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor={field.name}
                          className="text-lg font-semibold"
                        >
                          Staff ID
                        </FormLabel>
                        <FormControl>
                          <Input
                            id={field.name}
                            placeholder="DHG****"
                            {...field}
                            className="text-[#4A5568]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor={field.name}
                          className="text-lg font-semibold"
                        >
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              {...field}
                              className="pr-14"
                              placeholder="@#*"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                              {/* vertical border line */}
                              <div className="h-6 border-l border-gray-300"></div>

                              {/* eye toggle button */}
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {showPassword ? (
                                  <EyeOff size={20} />
                                ) : (
                                  <Eye size={20} />
                                )}
                              </button>
                            </div>
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Remember Me + Forgot Password */}
                  <div className="flex justify-between items-center">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              id={field.name}
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4 rounded border-[#CFD9E0]"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor={field.name}
                            className="text-sm font-normal mt-0"
                          >
                            Remember me
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <Link
                      to={routes.forgotPassword}
                      className="hover:text-primary text-primary/80 font-medium underline text-sm"
                    >
                      Forgot Password
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={
                    !form.formState.isValid || form.formState.isSubmitting
                  }
                  className="w-full"
                >
                  {form.formState.isSubmitting ? "Logging in..." : "Log in"}
                </Button>
                <div className="flex  gap-1 text-sm">
                  <span>Don&apos;t have an account?</span>
                  <Link
                    to={routes.signUp}
                    className="hover:text-primary text-primary/80 font-medium underline"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Marketing Panel */}
      <div className="hidden md:block md:w-1/2">
        <MarketingPanel />
      </div>
    </div>
  );
}
