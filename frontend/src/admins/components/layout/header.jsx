import { Link } from 'react-router-dom'

const Header = ({ onToggleSidebar }) => {
  const handleToggleSidebar = (event) => {
    event.preventDefault();
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  return (
    <>
      {/* <!--begin::Header--> */}
      <nav className="app-header navbar navbar-expand bg-body">
        {/* <!--begin::Container--> */}
        <div className="container-fluid">
          {/* <!--begin::Start Navbar Links--> */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <button type="button" className="nav-link btn btn-link px-2 nav-link-toggle" onClick={handleToggleSidebar}>
                <i className="bi bi-list"></i>
              </button>
            </li>
            {/* <li className="nav-item d-none d-md-block"><Link to="#" className="nav-link">Home</Link></li> */}
            {/* <li className="nav-item d-none d-md-block"><Link to="#" className="nav-link">Contact</Link></li> */}
          </ul>
          {/* <!--end::Start Navbar Links--> */}
          {/* <!--begin::End Navbar Links--> */}
          {/* <Temp /> */}
          {/* <!--end::End Navbar Links--> */}
        </div>
        {/* <!--end::Container--> */}
      </nav>
      {/* <!--end::Header--> */}
    </>
  )
}

const Temp = () => {
  return (
    <ul className="navbar-nav ms-auto">
      {/* <!--begin::Navbar Search--> */}
      <li className="nav-item">
        <Link className="nav-link" data-widget="navbar-search" to="#" role="button">
          <i className="bi bi-search"></i>
        </Link>
      </li>
      {/* <!--end::Navbar Search--> */}
      {/* <!--begin::Messages Dropdown Menu--> */}
      <li className="nav-item dropdown">
        <Link className="nav-link" data-bs-toggle="dropdown" to="#">
          <i className="bi bi-chat-text"></i>
          <span className="navbar-badge badge text-bg-danger">3</span>
        </Link>
        <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
          <Link to="#" className="dropdown-item">
            {/* <!--begin::Message--> */}
            <div className="d-flex">
              <div className="flex-shrink-0">
                <img
                  src="../assets/img/user1-128x128.jpg"
                  alt="User Avatar"
                  className="img-size-50 rounded-circle me-3"
                />
              </div>
              <div className="flex-grow-1">
                <h3 className="dropdown-item-title">
                  Brad Diesel
                  <span className="float-end fs-7 text-danger"
                  ><i className="bi bi-star-fill"></i
                  ></span>
                </h3>
                <p className="fs-7">Call me whenever you can...</p>
                <p className="fs-7 text-secondary">
                  <i className="bi bi-clock-fill me-1"></i> 4 Hours Ago
                </p>
              </div>
            </div>
            {/* <!--end::Message--> */}
          </Link>
          <div className="dropdown-divider"></div>
          <Link to="#" className="dropdown-item">
            {/* <!--begin::Message--> */}
            <div className="d-flex">
              <div className="flex-shrink-0">
                <img
                  src="../assets/img/user8-128x128.jpg"
                  alt="User Avatar"
                  className="img-size-50 rounded-circle me-3"
                />
              </div>
              <div className="flex-grow-1">
                <h3 className="dropdown-item-title">
                  John Pierce
                  <span className="float-end fs-7 text-secondary">
                    <i className="bi bi-star-fill"></i>
                  </span>
                </h3>
                <p className="fs-7">I got your message bro</p>
                <p className="fs-7 text-secondary">
                  <i className="bi bi-clock-fill me-1"></i> 4 Hours Ago
                </p>
              </div>
            </div>
            {/* <!--end::Message--> */}
          </Link>
          <div className="dropdown-divider"></div>
          <Link to="#" className="dropdown-item">
            {/* <!--begin::Message--> */}
            <div className="d-flex">
              <div className="flex-shrink-0">
                <img
                  src="../assets/img/user3-128x128.jpg"
                  alt="User Avatar"
                  className="img-size-50 rounded-circle me-3"
                />
              </div>
              <div className="flex-grow-1">
                <h3 className="dropdown-item-title">
                  Nora Silvester
                  <span className="float-end fs-7 text-warning">
                    <i className="bi bi-star-fill"></i>
                  </span>
                </h3>
                <p className="fs-7">The subject goes here</p>
                <p className="fs-7 text-secondary">
                  <i className="bi bi-clock-fill me-1"></i> 4 Hours Ago
                </p>
              </div>
            </div>
            {/* <!--end::Message--> */}
          </Link>
          <div className="dropdown-divider"></div>
          <Link to="#" className="dropdown-item dropdown-footer">See All Messages</Link>
        </div>
      </li>
      {/* <!--end::Messages Dropdown Menu--> */}
      {/* <!--begin::Notifications Dropdown Menu--> */}
      <li className="nav-item dropdown">
        <Link className="nav-link" data-bs-toggle="dropdown" to="#">
          <i className="bi bi-bell-fill"></i>
          <span className="navbar-badge badge text-bg-warning">15</span>
        </Link>
        <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
          <span className="dropdown-item dropdown-header">15 Notifications</span>
          <div className="dropdown-divider"></div>
          <Link to="#" className="dropdown-item">
            <i className="bi bi-envelope me-2"></i> 4 new messages
            <span className="float-end text-secondary fs-7">3 mins</span>
          </Link>
          <div className="dropdown-divider"></div>
          <Link to="#" className="dropdown-item">
            <i className="bi bi-people-fill me-2"></i> 8 friend requests
            <span className="float-end text-secondary fs-7">12 hours</span>
          </Link>
          <div className="dropdown-divider"></div>
          <Link to="#" className="dropdown-item">
            <i className="bi bi-file-earmark-fill me-2"></i> 3 new reports
            <span className="float-end text-secondary fs-7">2 days</span>
          </Link>
          <div className="dropdown-divider"></div>
          <Link to="#" className="dropdown-item dropdown-footer"> See All Notifications </Link>
        </div>
      </li>
      {/* <!--end::Notifications Dropdown Menu--> */}
      {/* <!--begin::Fullscreen Toggle--> */}
      <li className="nav-item">
        <Link className="nav-link" to="#" data-lte-toggle="fullscreen">
          <i data-lte-icon="maximize" className="bi bi-arrows-fullscreen"></i>
          <i data-lte-icon="minimize" className="bi bi-fullscreen-exit" style={{ display: 'none' }}></i>
        </Link>
      </li>
      {/* <!--end::Fullscreen Toggle--> */}
      {/* <!--begin::User Menu Dropdown--> */}
      <li className="nav-item dropdown user-menu">
        <Link to="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
          <img
            src="../assets/img/user2-160x160.jpg"
            className="user-image rounded-circle shadow"
            alt="User"
          />
          <span className="d-none d-md-inline">Alexander Pierce</span>
        </Link>
        <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
          {/* <!--begin::User Image--> */}
          <li className="user-header text-bg-primary">
            <img
              src="../assets/img/user2-160x160.jpg"
              className="rounded-circle shadow"
              alt="User"
            />
            <p>
              Alexander Pierce - Web Developer
              <small>Member since Nov. 2023</small>
            </p>
          </li>
          {/* <!--end::User Image--> */}
          {/* <!--begin::Menu Body--> */}
          <li className="user-body">
            {/* <!--begin::Row--> */}
            <div className="row">
              <div className="col-4 text-center"><Link to="#">Followers</Link></div>
              <div className="col-4 text-center"><Link to="#">Sales</Link></div>
              <div className="col-4 text-center"><Link to="#">Friends</Link></div>
            </div>
            {/* <!--end::Row--> */}
          </li>
          {/* <!--end::Menu Body--> */}
          {/* <!--begin::Menu Footer--> */}
          <li className="user-footer">
            <Link to="#" className="btn btn-default btn-flat">Profile</Link>
            <Link to="#" className="btn btn-default btn-flat float-end">Sign out</Link>
          </li>
          {/* <!--end::Menu Footer--> */}
        </ul>
      </li>
      {/* <!--end::User Menu Dropdown--> */}
    </ul>
  );
}

export default Header;
