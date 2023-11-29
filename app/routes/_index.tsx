import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";

import { PrismaClient } from "@prisma/client";
import { format, parseISO, startOfWeek } from "date-fns";
import React, { useEffect, useRef } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Work Journals" },
    { name: "description", content: "Welcome to my work journals" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const prisma = new PrismaClient();
  const formData = await request.formData();
  const { createdAt, category, text } = Object.fromEntries(formData);

  // For dev purposes
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (
    typeof createdAt !== "string" ||
    typeof category !== "string" ||
    typeof text !== "string"
  ) {
    throw new Error("Bad request");
  }

  return prisma.entry.create({
    data: {
      createdAt: new Date(createdAt),
      category: category,
      text: text,
    },
  });
}

export async function loader() {
  const prisma = new PrismaClient();
  const entries = await prisma.entry.findMany();

  return entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString().substring(0, 10),
  }));
}

type Category = "work" | "learnings" | "interestingThings";

export default function Index() {
  const fetcher = useFetcher();
  const entries = useLoaderData<typeof loader>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  let entriesByWeek = entries.reduce<Record<string, typeof entries>>(
    (acc, entry) => {
      const sunday = startOfWeek(parseISO(entry.createdAt));
      const sundayString = format(sunday, "yyyy-MM-dd");

      acc[sundayString] ??= [];
      acc[sundayString].push(entry);

      return acc;
    },
    {},
  );

  const sortedDate = Object.keys(entriesByWeek).sort((a, b) =>
    a.localeCompare(b),
  );
  const weeks = new Map<string, Record<Category, typeof entries>>();

  for (const dateString of sortedDate) {
    const weekObject: Record<Category, typeof entries> = {
      work: [],
      learnings: [],
      interestingThings: [],
    };

    for (const entry of entriesByWeek[dateString]) {
      switch (entry.category) {
        case "work":
          weekObject.work.push(entry);
          break;
        case "learning":
          weekObject.learnings.push(entry);
          break;
        case "interesting-thing":
          weekObject.interestingThings.push(entry);
          break;
        default:
          break;
      }
    }

    weeks.set(dateString, weekObject);
  }

  useEffect(() => {
    if (fetcher.state === "idle" && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [fetcher.state]);

  function getWeeklySummary(weeksMap: typeof weeks) {
    const summaries: React.ReactNode[] = [];
    weeksMap.forEach((category, dateString) =>
      summaries.push(
        <article key={dateString}>
          <header>
            <h2 className="text-xl font-bold">
              Week of {format(parseISO(dateString), "MMMM, d")}
            </h2>
          </header>

          <div className="mt-3 space-y-4">
            {category.work.length > 0 && (
              <article>
                <h3 className="font-semibold">Work</h3>
                <ul className="ml-7 list-disc">
                  {category.work.map((entry) => (
                    <li key={entry.id} className="font-mono">
                      {entry.text}
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {category.learnings.length > 0 && (
              <article>
                <h3 className="font-semibold">Learnings</h3>
                <ul className="ml-7 list-disc">
                  {category.learnings.map((entry) => (
                    <li key={entry.id} className="font-mono">
                      {entry.text}
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {category.interestingThings.length > 0 && (
              <article>
                <h3 className="font-semibold">Interesting Things</h3>
                <ul className="ml-7 list-disc">
                  {category.interestingThings.map((entry) => (
                    <li key={entry.id} className="font-mono">
                      {entry.text}
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        </article>,
      ),
    );
    return summaries;
  }

  return (
    <main className="p-20">
      <h1 className="text-5xl font-medium">Work Journals</h1>
      <p className="mt-3 text-lg text-gray-400">
        Learnings and doings. Updated weekly.
      </p>

      <div className="my-7 border p-3">
        <fetcher.Form method="POST">
          <fieldset
            disabled={fetcher.state === "submitting"}
            className="space-y-3 disabled:opacity-70"
          >
            <legend className="italic text-gray-400">Create an entry</legend>
            <input
              type="date"
              name="createdAt"
              required
              defaultValue={format(new Date(), "yyyy-MM-dd")}
              className="text-gray-900"
            />
            <div className="space-x-7">
              <label>
                <input
                  required
                  className="mr-1"
                  type="radio"
                  name="category"
                  value="work"
                />
                Work
              </label>
              <label>
                <input
                  className="mr-1"
                  type="radio"
                  name="category"
                  value="learning"
                  defaultChecked
                />
                Learning
              </label>
              <label>
                <input
                  className="mr-1"
                  type="radio"
                  name="category"
                  value="interesting-thing"
                />
                Interesting
              </label>
            </div>
            <textarea
              ref={textareaRef}
              className="w-full text-gray-900"
              name="text"
              placeholder="Write your entry..."
              required
            ></textarea>
            <button className="ml-auto block bg-blue-500 px-4 py-1 font-medium text-white">
              {fetcher.state === "submitting" ? "Saving..." : "Save"}
            </button>
          </fieldset>
        </fetcher.Form>
      </div>

      <div className="mt-12 space-y-12">{getWeeklySummary(weeks)}</div>
    </main>
  );
}

// function WeeklySummary({ createdAt, category}: WeeklySummaryProps) {
//   return (

//   );
// }
