"use client";

// Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Form
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import type { Address } from "viem";
import { useRouter } from "next/navigation";

export function SetNameButtonAndDialog({ address }: { address: Address }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="xs">
          Set Name
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Profile Name</DialogTitle>
          <DialogDescription>Set your public profile name</DialogDescription>
        </DialogHeader>
        <SetNameForm address={address} />
      </DialogContent>
    </Dialog>
  );
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormDataType = z.infer<typeof formSchema>;

function SetNameForm({ address }: { address: Address }) {
  const form = useForm<FormDataType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });
  const router = useRouter();

  const { watch } = form;
  const name = watch("name");
  const [debouncedName] = useDebounce(name, 500);

  const queryEnabled = !!debouncedName && name.length >= 1;
  const { data: nameExists, status: queryStatus } = useQuery({
    queryKey: ["checkName", debouncedName],
    queryFn: async () => {
      if (!debouncedName) return false;
      try {
        const res = await fetch(`api/names/${debouncedName}`);
        const data = (await res.json()) as { message: string; data?: any };
        return !!data.data;
      } catch (error) {
        console.error("Error checking name:", error);
        return false;
      }
    },
    enabled: queryEnabled,
  });

  const onSubmit: SubmitHandler<FormDataType> = async (values) => {
    try {
      const body = { name: values.name, address };
      const res = await fetch("/api/names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error submitting name");
      router.refresh();
      form.reset(form.getValues());
    } catch (error) {
      console.error(error);
    }
  };

  const { isSubmitting, isSubmitSuccessful } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              {queryEnabled && (
                <>
                  {queryStatus === "pending" && <FormDescription>Checking name...</FormDescription>}
                  {queryStatus === "success" && nameExists && (
                    <FormMessage>This name is already taken</FormMessage>
                  )}
                  {queryStatus === "success" && !nameExists && (
                    <FormDescription>Available!</FormDescription>
                  )}
                </>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
