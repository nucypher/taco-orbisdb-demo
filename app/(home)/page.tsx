import { HomeModules } from "@/components/sections/home-modules";
import Posts from "@/components/sections/posts";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "DeForm - Home",
  description: "",
});

export default function IndexPage() {
  return (
    <div>
      <HomeModules />
      <Posts />
    </div>
  );
}
