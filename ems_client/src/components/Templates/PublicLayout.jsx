import { Navbar } from "../Molecules/Navbar";
import { Outlet } from "react-router-dom";
function PublicLayout({ children }) {
  return (
    <>
        <Navbar/>
        <Outlet/>
    </>
  );
}

export default PublicLayout;