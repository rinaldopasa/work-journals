import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";

import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { useEffect, useRef } from "react";

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

  return entries;
}

export default function Index() {
  const fetcher = useFetcher();
  const entries = useLoaderData<typeof loader>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [fetcher.state]);

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

      {entries.map((entry) => (
        <p key={entry.id}>{entry.text}</p>
      ))}

      {/* <article className="mt-7">
        <header>
          <h2 className="font-bold">
            Week of January 20<sup>th</sup>
          </h2>
        </header>

        <div className="mt-3 space-y-4">
          <article>
            <h3>Work</h3>
            <ul className="ml-7 list-disc">
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </article>
          <article>
            <h3>Learnings</h3>
            <ul className="ml-7 list-disc">
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </article>
          <article>
            <h3>Interesting things</h3>
            <ul className="ml-7 list-disc">
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </article>
        </div>
      </article> */}
    </main>
  );
}
