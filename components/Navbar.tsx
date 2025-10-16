import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const Navbar = () => {
  return (
    <nav className="navbar flex justify-between items-center px-6 py-4 bg-white shadow-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/images/logo.svg" alt="logo" width={46} height={44}/>
        {/*<span className="font-bold text-lg">MyApp</span>*/}
      </Link>

      {/* Navigation & Auth Buttons */}
      <div className="flex items-center gap-6">
        {/* Navigation links */}
        <NavItems/>

        {/* Authentication */}
        <div className="flex items-center gap-4">
          {/* Shown when user is signed out */}
          <SignedOut>
            <SignInButton>
              <button className="btn-primary">Sign In</button>
            </SignInButton>
            {/*<SignUpButton>*/}
            {/*  <button className="btn-outline">Sign Up</button>*/}
            {/*</SignUpButton>*/}
          </SignedOut>

          {/* Shown when user is signed in */}
          <SignedIn>
            <UserButton/>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
