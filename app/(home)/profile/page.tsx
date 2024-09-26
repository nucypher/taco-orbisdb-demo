import { constructMetadata } from "@/lib/utils";
import {ProfileModules} from "@/components/sections/profile-modules";

export const metadata = constructMetadata({
  title: "Your Profile",
  description: "",
});

export default async function ProfilePage() {



  return (
    <div className="flex w-full flex-col gap-16 py-8 md:py-8">
      <ProfileModules />
    </div>
  );
}
