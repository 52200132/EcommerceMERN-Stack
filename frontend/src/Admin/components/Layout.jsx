import { Outlet } from "react-router-dom";

import ModalDialog from "./modal-dialog";
import AProvider from 'Admin/a-context'

const Layout = () => {
  return (
    <AProvider>
      <div>Admin Layout</div>
      <Outlet />
      <ModalDialog />
    </AProvider>
  );
}

export default Layout;