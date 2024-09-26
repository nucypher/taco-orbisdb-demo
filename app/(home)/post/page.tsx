import { constructMetadata } from "@/lib/utils";
import {PostModules} from "@/components/sections/newPost-modules";

export const metadata = constructMetadata({
  title: "Create a Post",
  description: "",
});

export default async function PostPage() {


  return (
    <div className="flex w-full flex-col gap-16 py-8 md:py-8">
      <PostModules />
    </div>
  );
}
