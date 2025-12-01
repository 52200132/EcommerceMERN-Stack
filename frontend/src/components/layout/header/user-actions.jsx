import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

import { OverlayTrigger, Popover } from 'react-bootstrap';
import { useLazyLinkGoogleAccountQuery } from '#services';
import { axiosBaseQueryUtil, BASE_URL } from '#services/axios-config';
import { closeOverlayPreloader, overlayPreloader } from '#utils';
import { useRenderCount, useTpsSelector } from '#custom-hooks';
import { logout } from '#features/auth-slice';

import unknownAvatar from '../../../assets/images/cat-avatar.jpg';

const openWindowPopup = (url) => {
  const width = 500;
  const height = 600;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  const popup = window.open(
    url,
    'googleAuth',
    `width=${width},height=${height},top=${top},left=${left}`
  );
  const timer = setInterval(() => {
    if (popup?.closed) {
      clearInterval(timer);
      closeOverlayPreloader();
    }
  }, 1500)
  console.log('Opened popup window for Google linking:', popup);
  popup.focus();
  return popup;
}

const UserActions = () => {
  // useRenderCount('user-actions', 'ui');
  const dispatch = useDispatch();
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const user = useTpsSelector((state) => state.auth.user, { includeProps: ['token', 'username', 'image'] });
  const [linkGoogleAccount] = useLazyLinkGoogleAccountQuery();

  const handleLinkGoogleAccount = () => {
    axiosBaseQueryUtil.configBehaviors = {
      showErrorToast: true,
    };
    axiosBaseQueryUtil.message = {
      error: 'Không thể tạo liên kết tài khoản Google. Vui lòng thử lại sau!'
    };
    axiosBaseQueryUtil.callbackfn = (data) => {
      // Chuyển hướng người dùng đến URL liên kết Google
      overlayPreloader()
      if (data?.dt?.urlRedirect) {
        popupRef.current = openWindowPopup(data.dt.urlRedirect);
      }
    }
    linkGoogleAccount({ origin: window.location.origin, feRedirectUri: '' });
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  useEffect(() => {
    const handleMessage = (event) => {
      // Kiểm tra origin backend
      if (event.origin !== BASE_URL.replace('/api', '')) return;
      const data = event.data;
      console.log('Received message from popup:', data);

      if (data?.ec === 0) {
        if (data?.em) toast.info(data.em);
      } else {
        console.error('Lỗi liên kết tài khoản Google:', data?.em);
        toast.error('Lỗi liên kết tài khoản Google');
      }
      if (data?.dt?.feRedirectUri) navigate(data.dt.feRedirectUri);
      if (typeof popupRef?.current?.close === 'function') popupRef.current.close();
      closeOverlayPreloader();
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {!user?.token ?
        (<div className='tps-auth-buttons'>
          <ul>
            <li><a href="/login">Đăng nhập</a></li>
            <li><a href="/register">Đăng ký</a></li>
          </ul>
        </div>)
        :
        (<OverlayTrigger
          trigger="click"
          placement="bottom-end"
          rootClose
          overlay={
            <Popover className='no-style-popover'>
              <ul className="user-popover-menu">
                <li className="popover-item"><Link to="/thong-tin-nguoi-dung/tich-diem">Điểm thành viên</Link></li>
                <li className="popover-item"><Link to="/thong-tin-nguoi-dung/ho-so">Tài khoản của tôi</Link></li>
                <li className="popover-item"><Link to="/thong-tin-nguoi-dung/lich-su-mua-hang">Đơn mua</Link></li>
                <li><hr /></li>
                <li onClick={handleLogout} className="popover-item"><Link to='/'>Đăng xuất</Link></li>
              </ul>
            </Popover>
          }
        >
          <div className="tps-user-brief-info">
            <img title={`Xin chào ${user?.username || 'Bạn'}`} src={user?.image || unknownAvatar} alt="User Avatar" className='user-avatar' />
            <div className='user-greeting d-none d-lg-block'>
              <p>Xin chào,</p>
              <p>{user?.username || 'Bạn'}</p>
            </div>
          </div>
        </OverlayTrigger>)}
    </>
  );
};

export default UserActions;
