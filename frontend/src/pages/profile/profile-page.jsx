import { Button, Placeholder } from "react-bootstrap";
import { BsPencil } from "react-icons/bs";
import { useDispatch } from "react-redux";

import { OFF_CANVAS_BODY_KEYS, useOffCanvasStore, useShallow } from "#custom-hooks";
import { setUserProfileDraft } from "#features/user-profile-slice";
import { useGetProfileQuery } from "#services/user-services";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { setShowOffCanvas, setOffCanvasBody } = useOffCanvasStore(
    useShallow(zs => ({
      setShowOffCanvas: zs.setShow,
      setOffCanvasBody: zs.setActiveOffCanvasBody,
    }))
  );
  const { data, isLoading, isFetching } = useGetProfileQuery();
  const isPending = isLoading || isFetching;
  const profile = data?.dt || {};
  const handleOpenEditor = () => {
    // set values cho form profile
    dispatch(setUserProfileDraft(profile));
    // mở offcanvas
    setOffCanvasBody(OFF_CANVAS_BODY_KEYS.PROFILE_FORM);
    setShowOffCanvas(true);
  }
  const renderFieldValue = (value, widthClass = "w-50") => (
    isPending ? (
      <Placeholder as="span" animation="wave" className={`${widthClass} d-block mb-0`}>
        <Placeholder xs={12} bg="secondary" />
      </Placeholder>
    ) : (value ?? "Chưa cập nhật")
  );
  return (
    <div className="profile-panel">
      <div className="profile-panel__heading">
        <div>
          <h2>Hồ Sơ Của Tôi</h2>
          <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
        </div>
        <Button variant="outline-primary" onClick={handleOpenEditor}>
          <BsPencil className="me-2" />
          Sửa Hồ Sơ
        </Button>
      </div>
      <dl className="profile-detail-list">
        {/* <div>
          <dt>Tên đăng nhập</dt>
          <dd>{profile.username}</dd>
        </div> */}
        <div>
          <dt>Họ và tên</dt>
          <dd>{renderFieldValue(profile?.username)}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{renderFieldValue(profile?.email)}</dd>
        </div>
        {/* <div>
          <dt>Số điện thoại</dt>
          <dd>{profile.phone}</dd>
        </div> */}
        <div>
          <dt>Giới tính</dt>
          <dd>{renderFieldValue(profile?.gender, "w-25")}</dd>
        </div>
        {/* <div>
          <dt>Ngày sinh</dt>
          <dd>{profile.birthday ? new Date(profile.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</dd>
        </div> */}
      </dl>
    </div>
  );
}

export default ProfilePage;