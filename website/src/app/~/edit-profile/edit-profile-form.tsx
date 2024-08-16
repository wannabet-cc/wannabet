"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { nameStone_NameSchema } from "@/lib/types/namestone";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  name: nameStone_NameSchema,
});

type FormData = z.infer<typeof schema>;

const EditProfileForm: React.FC<{ currentName: string }> = ({ currentName }) => {
  const router = useRouter();
  const wallet = useActiveWallet();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: currentName,
    },
  });

  async function onSubmit(data: FormData) {
    console.log("submitting");
    if (!wallet) throw new Error("No address found");

    try {
      // Send to server
      const res = await fetch("/api/names", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          address: wallet.address,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      // Invalidate local cache
      queryClient.invalidateQueries({ queryKey: ["username", wallet.address] });
      // Redirect to account page
      router.push(`/u/${data.name}`);
    } catch (error) {
      console.error("Error claiming name:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      form.setError("name", { message: errorMessage });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, console.log)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel className="sr-only">Name</FormLabel>
                <FormControl className="flex">
                  <div className="flex items-center space-x-1">
                    <Input {...field} placeholder="example" type="text" />
                    <div>.wannabet.eth</div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <div className="w-full pt-2 *:w-full">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditProfileForm;
