import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { nameStoneService } from "@/services/namestone";
import { useAccount } from "wagmi";

const schema = z.object({
  name: z.string().trim().min(3).max(20),
});

type FormData = z.infer<typeof schema>;

const SetNameForm: React.FC = () => {
  const { address } = useAccount();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: FormData) {
    console.log("submitting");
    if (!address) throw new Error("No address found");

    try {
      const res = await fetch("/api/names", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          address,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Error claiming name");
      }

      const result = await res.json();
      console.log(result.message);
    } catch (error) {
      console.error("Error claiming name:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, console.log)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Participant</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="abc.eth or 0xabc..." type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
};

export default SetNameForm;
