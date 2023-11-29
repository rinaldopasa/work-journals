import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Work Journals" },
    { name: "description", content: "Welcome to my work journals" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  let formData = await request.formData();
  let json = Object.fromEntries(formData);

  console.log(json);
  return redirect("/");
}

export default function Index() {
  return (
    <main className="p-20">
      <h1 className="text-5xl font-medium">Work Journals</h1>
      <p className="mt-3 text-lg text-gray-400">
        Learnings and doings. Updated weekly.
      </p>

      <div className="my-7 border p-3">
        <Form method="POST" className="space-y-3">
          <p className="italic text-gray-400">Create an entry</p>

          <input type="date" name="date" className="text-gray-700" />

          <div className="space-x-7">
            <label>
              <input
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
              />
              Learning
            </label>
            <label>
              <input
                className="mr-1"
                type="radio"
                name="category"
                value="interesting"
              />
              Interesting
            </label>
          </div>

          <textarea
            className="w-full text-gray-700"
            name="text"
            placeholder="Write your entry..."
          ></textarea>

          <button className="ml-auto block bg-blue-500 px-4 py-1 font-medium text-white">
            Save
          </button>
        </Form>
      </div>

      <article className="mt-7">
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
      </article>
    </main>
  );
}
