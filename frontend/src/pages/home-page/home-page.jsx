import HeroSection from "../../components/HeroSection/HeroSection";
import CallAction from "../../components/home-page/CallAction";
import BannerSection from "../../components/home-page/BannerSection";
import ShippingInfo from "../../components/home-page/ShippingInfo";

import ProductLanding from "#components/home-page/products-landing";

const HomePage = () => {
	return (
		<>
			{/* Start Hero Area */}
			<HeroSection />
			{/* End Hero Area */}

			<ProductLanding
				title="Top sản phẩm bán chạy"
				description="Những sản phẩm bán chạy nhất trong tuần qua."
				query={{
					limit: 8,
					page: 1,
					sort_by: "quantity_sold_desc",
				}}
			/>
			<ProductLanding
				title="Sản phẩm mới nhất"
				description="Những sản phẩm mới nhất vừa được cập nhật."
				query={{
					limit: 8,
					page: 1,
					sort_by: "created_at_desc",
				}}
			/>
			<ProductLanding
				title="Tai nghe - chụp tai"
				description="Các loại tai nghe - chụp tai chất lượng cao, đa dạng mẫu mã."
				query={{
					category_name: "Tai nghe - chụp tai",
					limit: 8,
					page: 1,
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