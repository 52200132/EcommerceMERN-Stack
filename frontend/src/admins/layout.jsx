import { useEffect } from 'react'
import { Outlet } from 'react-router-dom';
import { Flip, ToastContainer } from 'react-toastify';

import 'bootstrap-icons/font/bootstrap-icons.css'
import 'overlayscrollbars/overlayscrollbars.css';
import 'admin-lte/dist/css/adminlte.css'
import './index.scss';

import ModalDialog from "./components/layout/modal-dialog";
import { default as MD2 } from '#a-components/modal-dialog';
import Sidebar from "./components/layout/sidebar";
import Header from "./components/layout/header";
import Breadcrumb from './components/layout/breadcrumb';

const Layout = () => {
  useEffect(() => {
    import('admin-lte/dist/js/adminlte.js?tps').then(() => {
      // console.log(window.adminlte);
    })
  }, [])

  return (
    <>
      <div className={`layout-fixed sidebar-expand-lg bg-body-tertiary`}>
        <div className="app-wrapper">
          <Header />
          <Sidebar />
          <main className="app-main">
            <Breadcrumb />
            <Outlet />
          </main>
        </div>
      </div>

      {/* Modal */}
      <ModalDialog />

      {/* Modal is managed by userModalDialogStore */}
      <MD2 />

      {/* Toast */}
      <ToastContainer
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
      />
    </>
  );
}

export default Layout;