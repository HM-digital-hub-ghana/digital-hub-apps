import  { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@web/components/ui/form";
import { Input } from "@web/components/ui/input";
import { Button } from "@web/components/ui/button";
import { Checkbox } from "@web/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@web/components/logo";
import toast from "react-hot-toast";
import { apiRegister } from "@web/conference-and-visitors-booking/service/auths";
import { handleApiError } from "@/lib/utils";
import { routes } from "../constants/routes";
import TermsFormDialog from "@web/components/TermsForm";
import { MarketingPanel } from "@web/components/MarketingPanel";

// Zod schema
const passwordSchema = z.object({
  staff_id: z.string().min(1, { message: "Staff ID is required" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  acceptedTerms: z
    .boolean()
    .refine((val) => val, {
      message: "You must accept the terms and conditions",
    }),
});

type PasswordSchemaType = z.infer<typeof passwordSchema>;

export default function SignUpForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const form = useForm<PasswordSchemaType>({
    resolver: zodResolver(passwordSchema),
    mode: "onTouched",
    defaultValues: { staff_id: "", password: "", acceptedTerms: false },
  });

  const acceptedTerms = form.watch("acceptedTerms");

  // Pre-fill staff_id if passed from login page
  useEffect(() => {
    const state = location.state as { staff_id?: string } | null;
    if (state?.staff_id) {
      form.setValue("staff_id", state.staff_id);
    }
  }, [location.state, form]);

  const onSubmit = async (data: PasswordSchemaType) => {
    try {
      await apiRegister(data);
      toast.success("Registration successful!");
      navigate(routes.login);
    } catch (error: unknown) {
      toast.error(
        handleApiError(error, "Registration failed", "SignUpForm.onSubmit")
      );
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
                Create Account
              </h1>
              <p className="text-sm text-gray-500 mt-3">
                Enter your details to create your account
              </p>
            </div>
            <Form {...form}>
              <form
                id="sign-up-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                        htmlFor="password"
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

                {/* Terms Checkbox */}
                <FormField
                  control={form.control}
                  name="acceptedTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={() => {
                              if (field.value) {
                                field.onChange(false);
                              } else {
                                setIsTermsOpen(true);
                              }
                            }}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor="acceptedTerms"
                          className="text-sm text-gray-500"
                        >
                          Accept terms and conditions
                          <span
                            className="text-primary hover:underline cursor-pointer ml-1"
                            onClick={() => setIsTermsOpen(true)}
                          >
                            Terms and Conditions
                          </span>
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={
                    !form.formState.isValid ||
                    !acceptedTerms ||
                    form.formState.isSubmitting
                  }
                  className="w-full mt-8"
                >
                  {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                </Button>

                {/* Login link */}
                <div className="flex  gap-1 text-sm">
                  <span>Already have an account?</span>
                  <Link
                    to={routes.login}
                    className="hover:text-primary text-primary/80 font-medium underline"
                  >
                    Log In
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Terms Dialog */}
      <TermsFormDialog
        open={isTermsOpen}
        onOpenChange={setIsTermsOpen}
        accepted={form.getValues("acceptedTerms")} // can also use watch
        onAcceptChange={(val) =>
          form.setValue("acceptedTerms", val, { shouldValidate: true })
        }
      />
      {/* Marketing Panel */}
      <div className="hidden md:block md:w-1/2">
        <MarketingPanel />
      </div>
    </div>
  );
}
