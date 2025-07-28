import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/kit/card";
import type React from "react";

export function AuthLayout({
  form,
  title,
  description,
}: {
  form: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
}) {
  return (
    <main className="grow flex flex-col items-center pt-[180px] px-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{form}</CardContent>
      </Card>
    </main>
  );
}
