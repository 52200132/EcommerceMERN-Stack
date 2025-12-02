import { useState } from "react";
import { Collapse } from "react-bootstrap";
import {
  BsBagCheck,
  BsBell,
  BsChevronDown,
  BsChevronRight,
  BsGeoAlt,
  BsPencil,
  BsPerson,
  BsPersonCircle,
  BsShieldLock,
  BsTicketPerforated,
} from "react-icons/bs";
import { useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";

const defaultProfile = {
  username: "phngtnphc003",
  displayName: "Phùng Tấn Phước",
  email: "ph***********@gmail.com",
  phone: "********67",
  gender: "male",
  birthday: "1995-05-05",
  avatarUrl: "",
};

const NAV_ITEMS = [
  { id: "notifications", label: "Thông Báo", icon: <BsBell />, link: "/thong-tin-ca-nhan/thong-bao" },
  {
    id: "account",
    label: "Tài Khoản Của Tôi",
    icon: <BsPersonCircle />,
    children: [
      { id: "account-profile", label: "Hồ Sơ", icon: <BsPerson />, link: "/thong-tin-ca-nhan/ho-so" },
      { id: "account-addresses", label: "Địa Chỉ", icon: <BsGeoAlt />, link: "/thong-tin-ca-nhan/danh-sach-dia-chi" },
      { id: "account-password", label: "Đổi Mật Khẩu", icon: <BsShieldLock />, link: "/thong-tin-ca-nhan/doi-mat-khau" },
    ],
  },
  {
    id: "orders", label: "Đơn Hàng", icon: <BsBagCheck />,
    children: [
      { id: "orders-histories", label: "Lịch Sử Mua Hàng", link: "/thong-tin-ca-nhan/lich-su-mua-hang" },
      { id: "orders-tracking", label: "Theo Dõi Đơn Hàng", link: "/thong-tin-ca-nhan/theo-doi-don-hang" },
    ],
  },
  { id: "points", label: "Tích điểm", icon: <BsTicketPerforated />, link: "/thong-tin-ca-nhan/tich-diem" },
];

const ProfileSmUpSidebar = () => {
  const navigate = useNavigate();
  const profile = useSelector((state) => state.auth.user);
  const [activeSection, setActiveSection] = useState("account-profile");

  const [expandedSections, setExpandedSections] = useState(() => {
    const openExpandedSectionsInit = new Set(["account"])
    return NAV_ITEMS.reduce((acc, item) => {
      if (item.children?.length) {
        acc[item.id] = openExpandedSectionsInit.has(item.id);
      }
      return acc;
    }, {});
  });

  const toggleSectionExpansion = (sectionId) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const openEditor = (type, payload) => {

  };

  const initials = profile.displayName
    ? profile.displayName
      .split(" ")
      .filter(Boolean)
      .slice(-2)
      .map((chunk) => chunk[0])
      .join("")
      .toUpperCase()
    : profile.username?.charAt(0)?.toUpperCase() || "U";

  // const handleChildNavClick = (navItem) => {
  //   setActiveSection(navItem.id);
  //   if (navItem.link) {
  //     navigate(navItem.link);
  //   }
  // };

  return (
    // <section className="profile-dashboard-wrap">
    // <div className="profile-dashboard">
    <aside className="profile-dashboard__sidebar">
      <div className="profile-card">
        <div className="profile-card__avatar">
          {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayName} /> : <span>{initials}</span>}
        </div>
        <div>
          <h3>{profile.username}</h3>
          {/* <button type="button" className="profile-card__edit" onClick={() => openEditor("profile")}>
            <BsPencil className="me-2" />
            Sửa Hồ Sơ
          </button> */}
        </div>
      </div>
      <nav className="profile-nav">
        {NAV_ITEMS.map((section) => section.children ?
          (<div key={section.id} className="profile-nav__group">
            <button
              type="button"
              className={`profile-nav__item ${expandedSections[section.id] ? "is-active" : ""} has-children`}
              onClick={() => toggleSectionExpansion(section.id)}
            >
              <span className="profile-nav__icon">{section.icon}</span>
              <span className="profile-nav__label">{section.label}</span>
              {!expandedSections[section.id] ? <BsChevronRight className="profile-nav__chevron" /> : <BsChevronDown className="profile-nav__chevron" />}
            </button>
            <Collapse in={expandedSections[section.id]}>
              <div className="profile-nav__children">
                {section.children.map((child) => (
                  <NavLink key={child.id} to={child.link}
                    className={({ isActive }) => `profile-nav__child ${isActive ? 'is-active' : ''}`}
                  >
                    <span className="profile-nav__icon">{child.icon}</span>
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </div>
            </Collapse>
          </div>) :
          (<NavLink key={section.id} to={section.link}
            className={({ isActive }) => `profile-nav__item ${isActive ? 'is-active' : ''}`}
          >
            <span className="profile-nav__icon">{section.icon}</span>
            <span className="profile-nav__label">{section.label}</span>
          </NavLink>)
        )}
      </nav>
    </aside>
    // {/* <div className="profile-dashboard__content">{renderSection()}</div> */}
    // </div>
    // </section>
  );
};

export default ProfileSmUpSidebar;
