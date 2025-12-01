import { Outlet } from "react-router-dom";
import { Flip, ToastContainer } from "react-toastify";
import { createPortal } from "react-dom";

import { Header, Footer } from "#components/layout";
import ModalDialog from "#components/common/modal-dialog";

const Layout = () => {
  return (
    <>
      <Header />
      <div className="tps-content-container">
        <Outlet />
      </div>
      <Footer />

      {/* Toast */}
      {createPortal(<ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Flip}
      />, document.body)}

      <ModalDialog />
    </>
  );
}

export default Layout;
