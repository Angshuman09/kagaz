"use client";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

const Header = ({ name }: { name: string }) => {
  const { user } = useUser();

  const createUser = useMutation(api.user.createUser);
  useEffect(() => {
    if (!user) return;
    createUser({
      email: user?.primaryEmailAddress?.emailAddress as string,
      userName: user?.firstName as string,
      imageUrl: user?.imageUrl as string,
    });
  }, [user, createUser]);

  const getUser = useQuery(api.user.getUser, {
    email: user?.primaryEmailAddress?.emailAddress as string,
  });
  console.log(getUser);

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">{name}</h1>
          {name !== "Upgrade" && (
            <p className="text-xs text-slate-500">Manage your documents</p>
          )}
        </div>
        <div className="lg:hidden">
          <h1 className="text-lg font-semibold text-slate-900 ml-12">{name}</h1>
        </div>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-slate-900">
            {user?.firstName}
          </p>
          <p className="text-xs text-slate-500">
            {getUser && getUser?.upgrade == true ? "Pro plan" : "Free plan"}
          </p>
        </div>
        <UserButton
          appearance={{
            elements: {
              userButtonAvatar: "w-12 h-12", // Tailwind classes
              userButtonTrigger: "p-2",
            },
          }}
        />
      </div>
    </header>
  );
};

export default Header;
