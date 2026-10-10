"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TemplateMeta } from "@/lib/types";

export function TemplateCard({
  template,
  useLabel,
}: {
  template: TemplateMeta;
  useLabel: string;
}) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="aspect-[16/10] w-full bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.thumbnail}
          alt={template.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/thumbnails/placeholder.svg";
          }}
        />
      </div>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto">
        <Button asChild>
          <Link href={`/editor?template=${template.id}`}>
            {useLabel}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
