import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <div>Admin Layout</div>
      <Outlet />
    </>
  );
}

export default Layout;