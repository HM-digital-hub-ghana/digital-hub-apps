
import { apiForgot } from "../service/auths";
import { useForm } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Logo from "@/components/logo";
import { useLocation } from "react-router-dom";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type EmailSchemaType = z.infer<typeof emailSchema>;

export default function ForgotPassword() {
  const location = useLocation();
  const locationState = (location.state ?? null) as
    | {
        title?: string;
        description?: string;
      }
    | null;

  const heading = locationState?.title ?? "Forgot Password";
  const helperText =
    locationState?.description ?? "Enter your email to receive a token";

  const form = useForm<EmailSchemaType>({
    resolver: zodResolver(emailSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
    },
  });


  const onSubmit = async (data: EmailSchemaType) => {
    try {
      await apiForgot(data);
      toast.success("A link has been sent to your email");
      form.reset();
    } catch (error: unknown) {
      const errorMessage = handleApiError(
        error,
        "Password reset failed. Please try again.",
        "ForgotPassword.onSubmit"
      );
      toast.error(errorMessage);
    }
  };


  return (
    <div className="relative flex justify-center items-center md:py-0 py-40 md:h-screen px-4">
      {/* Logo at the top left for desktop */}
      <div className="hidden absolute top-8 left-8 md:flex items-center gap-2">
        <Logo />
      </div>

      {/* Main form container */}
      <div className="w-full max-w-[538px] p-6 md:p-8 rounded-3xl bg-white md:shadow-[0_1px_2px_0_#00000080]">
        <div className="mb-6 space-y-3 text-left">
          {/* Logo for mobile */}
          <div className="md:hidden mb-12">
            <Logo />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold">{heading}</h1>
          <p className="text-sm text-gray-500">{helperText}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor={field.name}
                    className="text-lg font-semibold"
                  >
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      id={field.name}
                      placeholder="example@gmail.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={!form.formState.isValid || form.formState.isSubmitting}
              className="w-full mt-8"
            >
              {form.formState.isSubmitting ? "Sending..." : "Submit"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
