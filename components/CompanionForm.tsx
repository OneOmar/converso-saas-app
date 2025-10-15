"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { subjects } from "@/constants";
import {createCompanion} from "@/lib/actions/companion.actions";
import {redirect} from "next/navigation";

// ------------------ Schema ------------------
const schema = z.object({
  name: z.string().min(1, "Companion name is required."),
  subject: z.string().min(1, "Subject is required."),
  topic: z.string().min(1, "Topic is required."),
  voice: z.string().min(1, "Voice is required."),
  style: z.string().min(1, "Style is required."),
  duration: z.number().min(1, "Duration is required."),
});

type FormData = z.infer<typeof schema>;

// ------------------ Options ------------------
const VOICES = ["male", "female"];
const STYLES = ["formal", "casual"];

// ------------------ Component ------------------
export default function CompanionForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      subject: "",
      topic: "",
      voice: "",
      style: "",
      duration: 15,
    },
  });

  const onSubmit = async (values: FormData) => {
    try {
      const companion = await createCompanion(values);
      redirect(`/companions/${companion.id}`);
    } catch (error) {
      console.error("Failed to create companion:", error);
      // TODO: Show error toast/notification to user
      redirect("/");
    }
  };

  const renderSelect = (
    name: keyof FormData,
    label: string,
    options: string[],
    placeholder: string
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
              <Select
                onValueChange={(value) => {
                  const parsedValue = name === "duration" ? Number(value) : value
                  field.onChange(parsedValue)
                }}
                value={field.value?.toString()}
              >
              <SelectTrigger className="input capitalize">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option} className="capitalize">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Companion name</FormLabel>
              <FormControl>
                <Input placeholder="Enter the companion name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subject */}
        {renderSelect("subject", "Subject", subjects, "Select the subject")}

        {/* Topic */}
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Companion topic</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex. Derivatives & Integrals" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Voice */}
        {renderSelect("voice", "Voice", VOICES, "Select the voice")}

        {/* Style */}
        {renderSelect("style", "Style", STYLES, "Select the style")}

        {/* Duration */}
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session duration (mins)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="15" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Build Your Companion
        </Button>
      </form>
    </Form>
  );
}
