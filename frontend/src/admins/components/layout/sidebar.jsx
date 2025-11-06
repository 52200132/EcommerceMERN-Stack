import { Link, NavLink } from 'react-router-dom'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { Nav } from 'react-bootstrap';

const Default = {
  scrollbarTheme: "os-theme-light",
  scrollbarAutoHide: "leave",
  scrollbarClickScroll: true,
};

const Sidebar = () => {
  return (
    <aside className="app-sidebar bg-body-secondary shadow tps-animation-transition" data-bs-theme="dark">
      {/*  */}
      <div className="sidebar-brand">
        <Link to="../index.html" className="brand-link">
          <img
            src="../assets/img/adminsLTELogo.png"
            alt="adminsLTE Logo"
            className="brand-image opacity-75 shadow"
          />
          <span className="brand-text fw-light">adminsLTE 4</span>
        </Link>
      </div>

      <OverlayScrollbarsComponent
        className="sidebar-wrapper"
        options={{
          scrollbars: {
            theme: Default.scrollbarTheme,
            autoHide: Default.scrollbarAutoHide,
            clickScroll: Default.scrollbarClickScroll,
          }
        }}
      >
        <nav className="mt-2">
          <ul
            className="nav sidebar-menu flex-column"
            data-lte-toggle="treeview"
            role="navigation"
            aria-label="Main navigation"
            data-accordion="false"
            id="navigation"
          >
            <Nav.Item>
              <Nav.Link>
                <i className="nav-icon bi bi-speedometer"></i>
                <p>
                  Dashboard
                  <i className="nav-arrow bi bi-chevron-right"></i>
                </p>
              </Nav.Link>
              <Nav className="nav-treeview">
                <Nav.Item>
                  <Link to="#" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Dashboard v1</p>
                  </Link>
                </Nav.Item>
                <Nav.Item>
                  <Link to="#" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Dashboard v2</p>
                  </Link>
                </Nav.Item>
                <Nav.Item>
                  <Link to="#" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Dashboard v3</p>
                  </Link>
                </Nav.Item>
              </Nav>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link>
                <i className="nav-icon bi bi-speedometer"></i>
                <p>
                  Sản phẩm
                  <i className="nav-arrow bi bi-chevron-right"></i>
                </p>
              </Nav.Link>
              <Nav className="nav-treeview">
                <Nav.Item>
                  <NavLink to="manage-products" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Quản lý sản phẩm</p>
                  </NavLink>
                </Nav.Item>
                <Nav.Item>
                  <NavLink to="sang/test" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Nhập hàng</p>
                  </NavLink>
                </Nav.Item>
              </Nav>
            </Nav.Item>
            {/* <li className="nav-item">
              <Link to="../generate/theme.html" className="nav-link">
                <i className="nav-icon bi bi-palette"></i>
                <p>Theme Generate</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <i className="nav-icon bi bi-box-seam-fill"></i>
                <p>
                  Widgets
                  <i className="nav-arrow bi bi-chevron-right"></i>
                </p>
              </Link>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="../widgets/small-box.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Small Box</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../widgets/info-box.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>info Box</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../widgets/cards.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Cards</p>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item menu-open">
              <Link to="#" className="nav-link active">
                <i className="nav-icon bi bi-clipboard-fill"></i>
                <p>
                  Layout Options
                  <span className="nav-badge badge text-bg-secondary me-3">6</span>
                  <i className="nav-arrow bi bi-chevron-right"></i>
                </p>
              </Link>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="../layout/unfixed-sidebar.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Default Sidebar</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../layout/fixed-sidebar.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Fixed Sidebar</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../layout/fixed-header.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Fixed Header</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../layout/fixed-footer.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Fixed Footer</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../layout/fixed-complete.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Fixed Complete</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../layout/layout-custom-area.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Layout <small>+ Custom Area </small></p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../layout/sidebar-mini.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Sidebar Mini</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../layout/collapsed-sidebar.html" className="nav-link active">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Sidebar Mini <small>+ Collapsed</small></p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../layout/logo-switch.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Sidebar Mini <small>+ Logo Switch</small></p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../layout/layout-rtl.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Layout RTL</p>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <i className="nav-icon bi bi-tree-fill"></i>
                <p>
                  UI Elements
                  <i className="nav-arrow bi bi-chevron-right"></i>
                </p>
              </Link>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="../UI/general.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>General</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../UI/icons.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Icons</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../UI/timeline.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Timeline</p>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <i className="nav-icon bi bi-pencil-square"></i>
                <p>
                  Forms
                  <i className="nav-arrow bi bi-chevron-right"></i>
                </p>
              </Link>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="../forms/general.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>General Elements</p>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <i className="nav-icon bi bi-table"></i>
                <p>
                  Tables
                  <i className="nav-arrow bi bi-chevron-right"></i>
                </p>
              </Link>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="../tables/simple.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Simple Tables</p>
                  </Link>
                </li>
              </ul>
            </li> */}

            <li className="nav-header">EXAMPLES</li>
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <i className="nav-icon bi bi-box-arrow-in-right"></i>
                <p>
                  Auth
                  <i className="nav-arrow bi bi-chevron-right"></i>
                </p>
              </Link>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="#" className="nav-link">
                    <i className="nav-icon bi bi-box-arrow-in-right"></i>
                    <p>
                      Version 1
                      <i className="nav-arrow bi bi-chevron-right"></i>
                    </p>
                  </Link>
                  <ul className="nav nav-treeview">
                    <li className="nav-item">
                      <Link to="../examples/login.html" className="nav-link">
                        <i className="nav-icon bi bi-circle"></i>
                        <p>Login</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="../examples/register.html" className="nav-link">
                        <i className="nav-icon bi bi-circle"></i>
                        <p>Register</p>
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item">
                  <Link to="#" className="nav-link">
                    <i className="nav-icon bi bi-box-arrow-in-right"></i>
                    <p>
                      Version 2
                      <i className="nav-arrow bi bi-chevron-right"></i>
                    </p>
                  </Link>
                  <ul className="nav nav-treeview">
                    <li className="nav-item">
                      <Link to="../examples/login-v2.html" className="nav-link">
                        <i className="nav-icon bi bi-circle"></i>
                        <p>Login</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="../examples/register-v2.html" className="nav-link">
                        <i className="nav-icon bi bi-circle"></i>
                        <p>Register</p>
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item">
                  <Link to="../examples/lockscreen.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Lockscreen</p>
                  </Link>
                </li>
              </ul>
            </li>
            {/* <li className="nav-header">DOCUMENTATIONS</li>
            <li className="nav-item">
              <Link to="../docs/introduction.html" className="nav-link">
                <i className="nav-icon bi bi-download"></i>
                <p>Installation</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="../docs/layout.html" className="nav-link">
                <i className="nav-icon bi bi-grip-horizontal"></i>
                <p>Layout</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="../docs/color-mode.html" className="nav-link">
                <i className="nav-icon bi bi-star-half"></i>
                <p>Color Mode</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <i className="nav-icon bi bi-ui-checks-grid"></i>
                <p>
                  Components
                  <i className="nav-arrow bi bi-chevron-right"></i>
                </p>
              </Link>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="../docs/components/main-header.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Main Header</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="../docs/components/main-sidebar.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Main Sidebar</p>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <i className="nav-icon bi bi-filetype-js"></i>
                <p>
                  Javascript
                  <i className="nav-arrow bi bi-chevron-right"></i>
                </p>
              </Link>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="../docs/javascript/treeview.html" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Treeview</p>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link to="../docs/browser-support.html" className="nav-link">
                <i className="nav-icon bi bi-browser-edge"></i>
                <p>Browser Support</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="../docs/how-to-contribute.html" className="nav-link">
                <i className="nav-icon bi bi-hand-thumbs-up-fill"></i>
                <p>How To Contribute</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="../docs/faq.html" className="nav-link">
                <i className="nav-icon bi bi-question-circle-fill"></i>
                <p>FAQ</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="../docs/license.html" className="nav-link">
                <i className="nav-icon bi bi-patch-check-fill"></i>
                <p>License</p>
              </Link>
            </li>
            <li className="nav-header">MULTI LEVEL EXAMPLE</li>
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <i className="nav-icon bi bi-circle-fill"></i>
                <p>Level 1</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <i className="nav-icon bi bi-circle-fill"></i>
                <p>
                  Level 1
                  <i className="nav-arrow bi bi-chevron-right"></i>
                </p>
              </Link>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="#" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Level 2</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="#" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>
                      Level 2
                      <i className="nav-arrow bi bi-chevron-right"></i>
                    </p>
                  </Link>
                  <ul className="nav nav-treeview">
                    <li className="nav-item">
                      <Link to="#" className="nav-link">
                        <i className="nav-icon bi bi-record-circle-fill"></i>
                        <p>Level 3</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="#" className="nav-link">
                        <i className="nav-icon bi bi-record-circle-fill"></i>
                        <p>Level 3</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="#" className="nav-link">
                        <i className="nav-icon bi bi-record-circle-fill"></i>
                        <p>Level 3</p>
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item">
                  <Link to="#" className="nav-link">
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Level 2</p>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <i className="nav-icon bi bi-circle-fill"></i>
                <p>Level 1</p>
              </Link>
            </li>
            <li className="nav-header">LABELS</li>
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <i className="nav-icon bi bi-circle text-danger"></i>
                <p className="text">Important</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <i className="nav-icon bi bi-circle text-warning"></i>
                <p>Warning</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="#" className="nav-link">
                <i className="nav-icon bi bi-circle text-info"></i>
                <p>Informational</p>
              </Link>
            </li> */}
          </ul>
        </nav>
      </OverlayScrollbarsComponent>
    </aside>
  )
}

export default Sidebar;