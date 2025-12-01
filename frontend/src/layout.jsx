import { Outlet, useNavigate } from "react-router-dom";
import { Flip, ToastContainer } from "react-toastify";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";

import { Header, Footer } from "#components/layout";
import { userModalDialogStore, useTpsSelector } from "#custom-hooks";
import ModalDialog from "#components/common/modal-dialog";

const Layout = () => {
  const navigate = useNavigate();
  const { pathname } = window.location;
  const { resetPasswordFirstTime, isLoggedIn } = useTpsSelector((state) => state.auth.user, { includeProps: ['resetPasswordFirstTime', 'isLoggedIn'] });
  const [passChanged, setPassChanged] = useState(false);
  const push = userModalDialogStore(zs => zs.push);
  const setShow = userModalDialogStore(zs => zs.setShow);
  useEffect(() => {
    if (pathname === '/thong-tin-ca-nhan/doi-mat-khau') return;
    if (resetPasswordFirstTime === false && isLoggedIn === true && passChanged === false) {
      push({
        size: "md",
        title: 'Đặt lại mật khẩu',
        bodyComponent: () => (
          <div>
            <p>
              Vì đây là lần đầu bạn đăng nhập, vui lòng đặt lại mật khẩu để bảo vệ tài khoản của bạn.
            </p>
            <p>
              Vui lòng nhấn nút bên dưới để chuyển đến trang đặt lại mật khẩu.
            </p>
          </div>
        ),
        buttons: [
          <Button variant="success" onClick={() => {
            navigate("/thong-tin-ca-nhan/doi-mat-khau");
            setPassChanged(true);
            setShow(false);
          }}
          >
            Đồng ý
          </Button>,
          <Button variant="warning" onClick={() => {
            setPassChanged(true);
            setShow(false);
          }}>Bỏ qua</Button>
        ]
      });
    }
  }, [resetPasswordFirstTime, passChanged, isLoggedIn, navigate, push, setShow, pathname]);

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
