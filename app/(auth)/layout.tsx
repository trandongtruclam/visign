import type { PropsWithChildren } from "react";

import { Header } from "./header";

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center bg-green-100">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
