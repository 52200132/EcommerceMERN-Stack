import React from 'react';

const CallAction = () => {
  return (
    <section className="call-action section">
      <div className="container">
        <div className="row ">
          <div className="col-lg-8 offset-lg-2 col-12">
            <div className="inner">
              <div className="content">
                <h2 className="wow fadeInUp" data-wow-delay=".4s">
                  Currently You are using ShopGrids<br />
                  eCommerce React Application
                </h2>
                <p className="wow fadeInUp" data-wow-delay=".6s">
                  Please, explore our modern React-based eCommerce solution with<br />
                  all the latest features and responsive design.
                </p>
                <div className="button wow fadeInUp" data-wow-delay=".8s">
                  <button className="btn" onClick={() => window.location.href = '#'}>
                    Explore More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallAction;