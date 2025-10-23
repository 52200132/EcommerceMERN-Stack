import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom';

import 'bootstrap-icons/font/bootstrap-icons.css'
import 'overlayscrollbars/overlayscrollbars.css';
import 'admin-lte/dist/css/adminlte.css'

import ModalDialog from "./components/modal-dialog";
import AProvider from 'Admin/a-context'
import Sidebar from "./components/sidebar";
import Header from "./components/header";

const Layout = () => {
  useEffect(() => {
    import('admin-lte/dist/js/adminlte.js?tps').then(() => {
      // console.log(window.adminlte);
    })
  }, [])

  return (
    <AProvider>
      <div className={`layout-fixed sidebar-expand-lg bg-body-tertiary`}>
        <div className="app-wrapper">
          <Header />
          <Sidebar />
          <main className="app-main">
            <Outlet />
          </main>
        </div>
      </div>
      <ModalDialog />
    </AProvider>
  );
}

export default Layout;