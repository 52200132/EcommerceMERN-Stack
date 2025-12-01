import { useEffect, useMemo, useRef, useState } from "react";
import ImageUploading from "react-images-uploading";
import { Alert, Badge, Button, Placeholder, Spinner } from "react-bootstrap";
import { BsGoogle, BsImage, BsLink45Deg, BsPencil, BsUpload } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { OFF_CANVAS_BODY_KEYS, useOffCanvasStore, useShallow } from "#custom-hooks";
import { setUserProfileDraft } from "#features/user-profile-slice";
import { useGetProfileQuery, useUpdateProfileMutation } from "#services/user-services";
import { useLazyLinkGoogleAccountQuery } from "#services";
import { BASE_URL, axiosBaseQueryUtil } from "#services/axios-config";
import { uploadSingleImageApi } from "#services/upload-service";
import { formatDateTime } from "#utils";

const PROVIDER_META = {
  google: {
    label: "Google",
    icon: <BsGoogle />,
  },
};

const openCenteredPopup = (url) => {
  const width = 520;
  const height = 640;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  const popup = window.open(
    url,
    "link-account",
    `width=${width},height=${height},top=${top},left=${left}`
  );
  popup?.focus();
  return popup;
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const popupRef = useRef(null);
  const { setShowOffCanvas, setOffCanvasBody } = useOffCanvasStore(
    useShallow((zs) => ({
      setShowOffCanvas: zs.setShow,
      setOffCanvasBody: zs.setActiveOffCanvasBody,
    }))
  );
  const { data, isLoading, isFetching, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isSavingAvatar }] = useUpdateProfileMutation();
  const [linkGoogleAccount] = useLazyLinkGoogleAccountQuery();

  const isPending = isLoading || isFetching;
  const profile = data?.dt || {};
  const linkedAccounts = useMemo(
    () => Array.isArray(profile?.Linked_accounts) ? profile.Linked_accounts : [],
    [profile?.Linked_accounts]
  );

  const [avatarImages, setAvatarImages] = useState([]);

  useEffect(() => {
    if (profile?.image) {
      setAvatarImages([{ dataURL: profile.image }]);
    } else {
      setAvatarImages([]);
    }
  }, [profile?.image]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== BASE_URL.replace("/api", "")) return;
      const payload = event.data;
      if (payload?.ec === 0) {
        toast.success(payload?.em || "Liên kết tài khoản thành công");
        refetch();
      } else if (payload?.em) {
        toast.error(payload.em);
      }
      if (popupRef.current && typeof popupRef.current.close === "function") {
        popupRef.current.close();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [refetch]);

  const handleOpenEditor = () => {
    dispatch(setUserProfileDraft(profile));
    setOffCanvasBody(OFF_CANVAS_BODY_KEYS.PROFILE_FORM);
    setShowOffCanvas(true);
  };

  const renderFieldValue = (value, widthClass = "w-50") =>
    isPending ? (
      <Placeholder as="span" animation="wave" className={`${widthClass} d-block mb-0`}>
        <Placeholder xs={12} bg="secondary" />
      </Placeholder>
    ) : (
      value ?? "Chưa cập nhật"
    );

  const handleSaveAvatar = async () => {
    if (!avatarImages.length) {
      toast.info("Vui lòng chọn ảnh đại diện mới.");
      return;
    }
    let uploadedUrl = avatarImages[0]?.dataURL;
    try {
      const file = avatarImages[0]?.file;
      if (file) {
        const uploadRes = await uploadSingleImageApi(file);
        uploadedUrl = uploadRes?.url || uploadRes?.dt?.url || uploadedUrl;
      }
      axiosBaseQueryUtil.configBehaviors = {
        showSuccessToast: true,
        showErrorToast: true,
        useMessageFromResponse: true,
      };
      axiosBaseQueryUtil.message = {
        success: "Cập nhật ảnh đại diện thành công",
        error: "Không thể cập nhật ảnh đại diện",
      };
      axiosBaseQueryUtil.callbackfn = () => {
        refetch();
      };
      await updateProfile({ image: uploadedUrl }).unwrap();
    } catch (error) {
      toast.error(error?.em || "Upload ảnh không thành công, thử lại nhé.");
    }
  };

  const handleLinkGoogle = () => {
    axiosBaseQueryUtil.configBehaviors = {
      showErrorToast: true,
      useMessageFromResponse: true,
    };
    axiosBaseQueryUtil.message = {
      error: "Không thể tạo liên kết Google, vui lòng thử lại.",
    };
    axiosBaseQueryUtil.callbackfn = (res) => {
      if (res?.dt?.urlRedirect) {
        popupRef.current = openCenteredPopup(res.dt.urlRedirect);
      }
    };
    linkGoogleAccount({ origin: window.location.origin, feRedirectUri: window.location.href });
  };

  return (
    <>
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
          <div>
            <dt>Họ và tên</dt>
            <dd>{renderFieldValue(profile?.username)}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{renderFieldValue(profile?.email)}</dd>
          </div>
          <div>
            <dt>Giới tính</dt>
            <dd>{renderFieldValue(profile?.gender, "w-25")}</dd>
          </div>
        </dl>
      </div>

      <div className="profile-supplement-grid">
        <section className="profile-panel profile-panel--sub">
          <div className="profile-panel__heading">
            <div>
              <h3 className="h5 mb-1">Ảnh đại diện</h3>
              <p className="mb-0">Tải ảnh đại diện bằng ImageUploading</p>
            </div>
          </div>
          <div className="avatar-uploader">
            <div className="avatar-uploader__preview">
              {avatarImages[0]?.dataURL ? (
                <img src={avatarImages[0].dataURL} alt="Avatar preview" />
              ) : (
                <div className="avatar-uploader__placeholder">
                  <BsImage size={28} />
                </div>
              )}
            </div>
            <ImageUploading
              value={avatarImages}
              onChange={(imageList) => setAvatarImages(imageList)}
              dataURLKey="dataURL"
              maxNumber={1}
            >
              {({ onImageUpload, onImageRemoveAll, dragProps }) => (
                <div className="d-flex flex-wrap gap-2">
                  <Button variant="outline-primary" onClick={onImageUpload} {...dragProps}>
                    <BsUpload className="me-2" />
                    Chọn ảnh
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={onImageRemoveAll}
                    disabled={!avatarImages.length}
                  >
                    Xóa ảnh
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveAvatar}
                    disabled={!avatarImages.length || isSavingAvatar}
                  >
                    {isSavingAvatar ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu ảnh đại diện"
                    )}
                  </Button>
                </div>
              )}
            </ImageUploading>
          </div>
        </section>

        <section className="profile-panel profile-panel--sub">
          <div className="profile-panel__heading">
            <div>
              <h3 className="h5 mb-1">Tài khoản liên kết</h3>
              <p className="mb-0">Quản lý liên kết đăng nhập nhanh</p>
            </div>
            <Button variant="outline-primary" size="sm" onClick={handleLinkGoogle}>
              <BsLink45Deg className="me-2" />
              Liên kết Google
            </Button>
          </div>

          {!linkedAccounts.length && (
            <Alert variant="light" className="mb-3">
              Chưa có tài khoản nào được liên kết. Hãy liên kết với tài khoản mạng xã hội để đăng nhập nhanh hơn.
            </Alert>
          )}

          <div className="linked-accounts">
            {linkedAccounts.map((acc, idx) => {
              const meta = PROVIDER_META[acc.provider] || { label: acc.provider };
              return (
                <div key={`${acc.provider}-${acc.provider_id}-${idx}`} className="linked-account">
                  <div className="linked-account__icon">{meta.icon || <BsLink45Deg />}</div>
                  <div className="linked-account__info">
                    <div className="fw-semibold">{meta.label}</div>
                    <div className="text-muted small">
                      Liên kết lúc: {formatDateTime(acc.linked_at)}
                    </div>
                    <div className="text-muted small">
                      Đăng nhập gần nhất: {formatDateTime(acc.last_login)}
                    </div>
                  </div>
                  <Badge bg="success" pill>
                    Đã liên kết
                  </Badge>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
};

export default ProfilePage;
