import { Link } from 'react-router-dom';
// import unknownAvatar from '../../assets/images/unknown-user.svg';

const UserBriefInfo = () => {
  return (
    <>
      <div className='tps-user-brief-info tps-hover-animation'>
        <div className="dropdown-toggle" type="button" data-bs-toggle="dropdown">
          {/* <img src={unknownAvatar} alt="User Avatar" className='user-avatar' /> */}
          <div className='user-greeting'>
            <p>Xin chào,</p>
            <p className='user-fullname'>Sáng Say Say</p>
          </div>
        </div>
        <ul className="dropdown-menu dropdown-menu-end mt-1">
          <li><Link className="dropdown-item" to="#">Tài khoản của tôi</Link></li>
          <li><Link className="dropdown-item" to="#">Đơn mua</Link></li>
          <li><hr/></li>
          <li><Link className="dropdown-item" to="#">Đăng xuất</Link></li>
        </ul>
      </div>
    </>
  );
};

export default UserBriefInfo;
