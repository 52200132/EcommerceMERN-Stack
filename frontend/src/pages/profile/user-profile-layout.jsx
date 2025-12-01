import { Outlet } from "react-router-dom";
import { Offcanvas } from "react-bootstrap";

import { useResponsiveOffcanvasPlacement } from "#component-hooks/use-user-profile-hooks";
import ProfileSmUpSidebar from "#components/profile/profile-sm-up-sidebar";
import './user-profile-layout.scss';
import { useOffCanvasStore, useShallow } from "#custom-hooks";

const UserProfileLayout = () => {
  const { placement } = useResponsiveOffcanvasPlacement();
  const { show, setShow, canvasBody } = useOffCanvasStore(
    useShallow(zs => ({
      show: zs.show,
      setShow: zs.setShow,
      canvasBody: zs.getActiveOffCanvasBody(),
    }))
  );

  return (
    <section className="profile-dashboard-wrap">
      <div className="profile-dashboard">
        {/* <aside className="profile-dashboard__sidebar"> */}
        <ProfileSmUpSidebar />
        {/* </aside> */}
        <div className="profile-dashboard__content">
          <Outlet />
        </div>
      </div>

      <Offcanvas
        show={show}
        onHide={() => setShow(false)}
        placement={placement}
        className="profile-dashboard__offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{canvasBody?.title}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{canvasBody?.component}</Offcanvas.Body>
      </Offcanvas>
    </section>
  );
}

export default UserProfileLayout;