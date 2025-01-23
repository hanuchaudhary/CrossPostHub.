"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { guideContent } from "@/data/GuideData";

interface GuideProps {
  title?: string;
  size?: "default" | "sm" | "lg" | "icon" | "xl" | null | undefined;
}

export default function Guide({ title = "Guide", size }: GuideProps) {
  const [guideData] = React.useState(guideContent);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size={size}>
          {title}
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-2xl overflow-y-auto md::max-w-3xl">
        <SheetHeader>
          <SheetTitle>
            <h1 className="font-ClashDisplayMedium text-xl text-emerald-500">CrossPost Hub</h1>
            <SheetDescription className="text-neutral-500 dark:text-neutral-400">
              All your social media in one place.
            </SheetDescription>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <p className="dark:text-neutral-400 text-neutral-500">
            {guideData.intro.content
              .split("Kush Chaudhary")
              .map((part, index, array) => (
                <React.Fragment key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <a className="font-ClashDisplayMedium text-emerald-500 underline">Kush Chaudhary</a>
                  )}
                </React.Fragment>
              ))}
          </p>

          <Section title={guideData.targetUsers.title}>
            {guideData.targetUsers.content.map((tu) => (
              <div key={tu.role} className="mb-2">
                <h3 className="font-semibold">{tu.role}</h3>
                <p className="dark:text-neutral-400 text-neutral-500">
                  {tu.description}
                </p>
              </div>
            ))}
          </Section>

          <Section title={guideData.whatIsCrossPostHub.title}>
            <p className="dark:text-neutral-400 text-neutral-500">
              {guideData.whatIsCrossPostHub.content}
            </p>
          </Section>

          <Section title={guideData.features.title}>
            <ul className="list-disc pl-5">
              {guideData.features.content.map((feature) => (
                <li
                  className="dark:text-neutral-400 text-neutral-500"
                  key={feature}
                >
                  {feature}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={guideData.howToUse.title}>
            <ol className="list-decimal pl-5">
              {guideData.howToUse.steps.map((step) => (
                <li
                  className="dark:text-neutral-400 text-neutral-500"
                  key={step}
                >
                  {step}
                </li>
              ))}
            </ol>
          </Section>

          <Section title={guideData.pricing.title}>
            <p className="dark:text-neutral-400 text-neutral-500">
              {guideData.pricing.content}
            </p>
          </Section>

          <Section title={guideData.conclusion.title}>
            <p className="dark:text-neutral-400 text-neutral-500">
              {guideData.conclusion.content}
            </p>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-semibold text-xl mb-2">{title}</h2>
      {children}
    </div>
  );
}
