import { Link } from "react-router-dom";

const FollowUs = () => {
  return (
    <>
      {/* Start Nav Social */}
      <div className="nav-social">
        <h5 className="title">Follow Us:</h5>
        <ul>
          <li>
            <Link to="#"><i className="lni lni-facebook-filled"></i></Link>
          </li>
          <li>
            <Link to="#"><i className="lni lni-twitter-original"></i></Link>
          </li>
          <li>
            <Link to="#"><i className="lni lni-instagram"></i></Link>
          </li>
          <li>
            <Link to="#"><i className="lni lni-skype"></i></Link>
          </li>
        </ul>
      </div>
      {/* End Nav Social */}</>
  );
};

export default FollowUs;