import { useEffect, useMemo, useState } from "react";
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
import { useNavigate } from "react-router-dom";

const defaultProfile = {
  username: "phngtnphc003",
  displayName: "Phùng Tấn Phước",
  email: "ph***********@gmail.com",
  phone: "********67",
  gender: "male",
  birthday: "1995-05-05",
  avatarUrl: "",
};

const navSchema = [
  { id: "notifications", label: "Thông Báo", icon: <BsBell />, editable: false },
  {
    id: "account",
    label: "Tài Khoản Của Tôi",
    icon: <BsPersonCircle />,
    children: [
      { id: "profile", label: "Hồ Sơ", icon: <BsPerson />, link: "/thong-tin-nguoi-dung/ho-so" },
      { id: "addresses", label: "Địa Chỉ", icon: <BsGeoAlt />, link: "/thong-tin-nguoi-dung/danh-sach-dia-chi" },
      { id: "password", label: "Đổi Mật Khẩu", icon: <BsShieldLock />, link: "/thong-tin-nguoi-dung/doi-mat-khau" },
    ],
  },
  {
    id: "orders", label: "Đơn Hàng", icon: <BsBagCheck />,
    children: [
      { id: "orders-histories", label: "Lịch Sử Mua Hàng", link: "/thong-tin-nguoi-dung/lich-su-mua-hang" },
      { id: "orders-tracking", label: "Theo Dõi Đơn Hàng", link: "/thong-tin-nguoi-dung/theo-doi-don-hang" },
    ],
  },
  { id: "vouchers", label: "Kho Voucher", icon: <BsTicketPerforated />, editable: false },
];

const ProfileSmUpSidebar = ({
  user,
  addresses,
}) => {
  const navigate = useNavigate();
  const profile = useMemo(() => ({ ...defaultProfile, ...user }), [user]);
  const resolvedAddresses = addresses?.length ? addresses : [];

  const [activeSection, setActiveSection] = useState("profile");
  const [defaultAddressId, setDefaultAddressId] = useState(() => {
    const defaultAddr = resolvedAddresses.find((addr) => addr.isDefault);
    return defaultAddr ? defaultAddr.id : resolvedAddresses[0]?.id || null;
  });
  const [expandedNavs, setExpandedNavs] = useState(() =>
    navSchema.reduce((acc, item) => {
      if (item.children?.length) {
        acc[item.id] = true;
      }
      return acc;
    }, {})
  );

  useEffect(() => {
    const defaultAddr = resolvedAddresses.find((addr) => addr.isDefault);
    setDefaultAddressId(defaultAddr ? defaultAddr.id : resolvedAddresses[0]?.id || null);
  }, [resolvedAddresses]);

  const toggleNavGroup = (groupId) => {
    setExpandedNavs((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
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

  const handleChildNavClick = (navItem) => {
    setActiveSection(navItem.id);
    if (navItem.link) {
      navigate(navItem.link);
    }
  };

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
          <button type="button" className="profile-card__edit" onClick={() => openEditor("profile")}>
            <BsPencil className="me-2" />
            Sửa Hồ Sơ
          </button>
        </div>
      </div>
      <nav className="profile-nav">
        {navSchema.map((section) => (
          <div key={section.id} className="profile-nav__group">
            <button
              type="button"
              className={`profile-nav__item ${activeSection === section.id ? "is-active" : ""} ${section.children ? "has-children" : ""
                }`}
              onClick={() => {
                if (!section.children) {
                  setActiveSection(section.id);
                } else {
                  toggleNavGroup(section.id)
                }
              }}
            >
              <span className="profile-nav__icon">{section.icon}</span>
              <span className="profile-nav__label">{section.label}</span>
              {section.children && (!expandedNavs[section.id] ? <BsChevronRight className="profile-nav__chevron" /> : <BsChevronDown className="profile-nav__chevron" />)}
            </button>
            {section.children && (
              <Collapse in={expandedNavs[section.id]}>
                <div className="profile-nav__children">
                  {section.children.map((child) => (
                    <button
                      type="button"
                      key={child.id}
                      className={`profile-nav__child ${activeSection === child.id ? "is-active" : ""}`}
                      onClick={() => handleChildNavClick(child)}
                    >
                      <span className="profile-nav__icon">{child.icon}</span>
                      <span>{child.label}</span>
                    </button>
                  ))}
                </div>
              </Collapse>
              // <div className="profile-nav__children">
              //   {section.children.map((child) => (
              //     <button
              //       type="button"
              //       key={child.id}
              //       className={`profile-nav__child ${activeSection === child.id ? "is-active" : ""}`}
              //       onClick={() => setActiveSection(child.id)}
              //     >
              //       <span className="profile-nav__icon">{child.icon}</span>
              //       <span>{child.label}</span>
              //     </button>
              //   ))}
              // </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
    // {/* <div className="profile-dashboard__content">{renderSection()}</div> */}
    // </div>
    // </section>
  );
};

export default ProfileSmUpSidebar;
