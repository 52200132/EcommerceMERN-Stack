import HeroSection from "../components/HeroSection/HeroSection";
import TrendingProducts from "../components/TrendingProducts";
import CallAction from "../components/CallAction";
import BannerSection from "../components/BannerSection";
import ShippingInfo from "../components/ShippingInfo";

import { default as HP } from "../pages/home-page/home-page";
import ProductLanding from "#components/home-page/products-landing";

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

			<ProductLanding query={{
				brand_names: ["Apple", "Lenovo", "ASUS"],
				limit: 8,
				page: 1,
				// sort_by: "quantity_sold_desc",
			}}
			/>
			<ProductLanding
				title="Tai nghe - chụp tai"
				description="Các loại tai nghe - chụp tai chất lượng cao, đa dạng mẫu mã."
				query={{
					category_name: "Tai nghe - chụp tai",
					limit: 8,
					page: 1,
					// sort_by: "quantity_sold_desc",
				}}
			/>
			<ProductLanding
				title="Máy tính xách tay"
				description="Các loại máy tính xách tay chất lượng cao, đa dạng mẫu mã."
				query={{
					category_name: "Laptop",
					limit: 8,
					page: 1,
					// sort_by: "quantity_sold_desc",
				}}
			/>
			<ProductLanding
				title="Bàn phím"
				description="Các loại bàn phím chất lượng cao, đa dạng mẫu mã."
				query={{
					category_name: "Bàn phím",
					limit: 8,
					page: 1,
					// sort_by: "quantity_sold_desc",
				}}
			/>
		</>
	);
};

export default HomePage;