"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
import { ApprikartLogo , XircularLogo} from "./Icons";
import "./navbar.css";

export default function NavBar() {
  return (
    <Navbar style={{backgroundColor:'white'}}>
      <NavbarBrand>
        {/* <Link isExternal aria-label="HeyGen" href="https://app.heygen.com/"> */}
          <ApprikartLogo />
        {/* </Link> */}
        <div className="bg-gradient-to-br from-sky-300 to-indigo-500 bg-clip-text"id="headingtext">
          <p className="text-xl font-semibold text-transparent">
          Interactive Avatar Demo
          </p>
        </div>
        <XircularLogo/>
      </NavbarBrand>
    </Navbar>
  );
}
