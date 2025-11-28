import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Flip, ToastContainer } from 'react-toastify';

import 'bootstrap-icons/font/bootstrap-icons.css'
import 'overlayscrollbars/overlayscrollbars.css';
import './index.scss';

import ModalDialog from "./components/layout/modal-dialog";
import { default as MD2 } from '#components/common/modal-dialog';
import Sidebar from "./components/layout/sidebar";
import Header from "./components/layout/header";
import Breadcrumb from './components/layout/breadcrumb';

const Layout = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebar, setIsMobileSidebar] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 990 : false
  );

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 990;
      setIsMobileSidebar(isMobile);
      if (!isMobile) {
        setShowOffcanvas(false);
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobileSidebar) {
      setShowOffcanvas((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  return (
    <>
      <div className="admin-layout bg-body-tertiary">
        <div className={`admin-wrapper ${isCollapsed && !isMobileSidebar ? 'sidebar-collapsed' : ''}`}>
          <Sidebar
            isMobile={isMobileSidebar}
            show={isMobileSidebar ? showOffcanvas : true}
            onHide={() => {
              if (isMobileSidebar) {
                setShowOffcanvas(false);
              } else {
                setIsCollapsed(true);
              }
            }}
            collapsed={!isMobileSidebar && isCollapsed}
          />
          <main className="app-main admin-main">
            <Header onToggleSidebar={handleToggleSidebar} />
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
