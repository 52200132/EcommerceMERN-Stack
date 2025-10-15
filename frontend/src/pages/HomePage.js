import HeroSection from '../components/HeroSection/HeroSection';
import TrendingProducts from '../components/TrendingProducts';
import CallAction from '../components/CallAction';
import BannerSection from '../components/BannerSection';
import ShippingInfo from '../components/ShippingInfo';

const HomePage = () => {
    return (
        <>
            {/* Start Hero Area */}
            <HeroSection />
            {/* End Hero Area */}

            {/* Start Trending Product Area */}
            <TrendingProducts />
            {/* End Trending Product Area */}

            {/* Start Call Action Area */}
            <CallAction />
            {/* End Call Action Area */}

            {/* Start Banner Area */}
            <BannerSection />
            {/* End Banner Area */}

            {/* Start Shipping Info */}
            <ShippingInfo />
            {/* End Shipping Info */}
        </>
    );
};

export default HomePage;