export const LABTOP_SLUG = "laptop";
export const TAI_NGHE_CHUP_TAI_SLUG = "tai-nghe-chup-tai";
export const BAN_PHIM_SLUG = "ban-phim";

export const filterOptions = {
  [LABTOP_SLUG]: {
    category_name: "Laptop",
    filterFields: [
      {
        attribute: "brand",
        label: "Thương hiệu",
        type: "multiple",
        values: ["Apple", "Lenovo", "ASUS", "HP", "Dell", "MSI", "Acer", "Microsoft"]
      },
      {
        attribute: "price",
        label: "Khoảng giá",
        type: "range",
        values: [10000000, 50000000]
      },
      {
        attribute: "screen_size",
        label: "Kích thước màn hình",
        type: "multiple",
        values: ["13 inch", "14 inch", "15.6 inch", "16 inch", "17 inch"]
      },
      {
        attribute: "resolution",
        label: "Độ phân giải",
        type: "multiple",
        values: ["Full HD (1920x1080)", "2K (2560x1440)", "4K (3840x2160)", "Retina"]
      },
      {
        attribute: "gpu",
        label: "Card đồ họa",
        type: "multiple",
        values: ["Intel UHD", "Intel Iris Xe", "NVIDIA GeForce GTX", "NVIDIA GeForce RTX", "AMD Radeon"]
      },
      // {
      //   attribute: "special_features",
      //   label: "Tính năng đặc biệt",
      //   type: "multiple",
      //   values: ["Màn hình cảm ứng", "Bàn phím có đèn", "Nhận diện khuôn mặt", "Bảo mật vân tay"]
      // },
      // {
      //   attribute: "demand",
      //   label: "Nhu cầu sử dụng",
      //   type: "multiple",
      //   values: ["Văn phòng", "Đồ họa - Kỹ thuật", "Gaming", "Mỏng nhẹ", "Cao cấp - Sang trọng"]
      // },
      {
        attribute: "ram",
        label: "Dung lượng RAM",
        type: "multiple",
        values: ["8GB", "16GB", "32GB", "64GB"]
      },
      {
        attribute: "cpu",
        label: "CPU",
        type: "multiple",
        values: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M1", "Apple M2", "Apple M3"]
      },
      // {
      //   attribute: "ai_technology",
      //   label: "Công nghệ AI",
      //   type: "multiple",
      //   values: ["Hỗ trợ AI", "Không hỗ trợ"]
      // }
    ]
  },
  // [TAI_NGHE_CHUP_TAI_SLUG]: {
  //   category_name: "Tai nghe chụp tai",
  //   filterFields: [
  //     { 
  //       attribute: "brand", 
  //       label: "Thương hiệu", 
  //       type: "multiple", 
  //       values: ["Sony", "Bose", "JBL", "Sennheiser", "Beats", "Audio-Technica", "AKG"] 
  //     },
  //     { 
  //       attribute: "price", 
  //       label: "Khoảng giá", 
  //       type: "range", 
  //       values: [500000, 10000000] 
  //     },
  //     {
  //       attribute: "connection_type",
  //       label: "Kiểu kết nối",
  //       type: "multiple",
  //       values: ["Bluetooth", "Có dây", "Bluetooth & Có dây"]
  //     },
  //     {
  //       attribute: "noise_cancellation",
  //       label: "Chống ồn",
  //       type: "multiple",
  //       values: ["Có chống ồn chủ động (ANC)", "Không chống ồn"]
  //     },
  //     {
  //       attribute: "battery_life",
  //       label: "Thời lượng pin",
  //       type: "multiple",
  //       values: ["Dưới 20 giờ", "20-30 giờ", "Trên 30 giờ"]
  //     }
  //   ]
  // },
  // [BAN_PHIM_SLUG]: {
  //   category_name: "Bàn phím",
  //   filterFields: [
  //     { 
  //       attribute: "brand", 
  //       label: "Thương hiệu", 
  //       type: "multiple", 
  //       values: ["Logitech", "Razer", "Corsair", "SteelSeries", "Keychron", "Leopold", "Filco"] 
  //     },
  //     { 
  //       attribute: "price", 
  //       label: "Khoảng giá", 
  //       type: "range", 
  //       values: [200000, 5000000] 
  //     },
  //     {
  //       attribute: "switch_type",
  //       label: "Loại switch",
  //       type: "multiple",
  //       values: ["Cherry MX Red", "Cherry MX Blue", "Cherry MX Brown", "Gateron", "Kailh", "Membrane"]
  //     },
  //     {
  //       attribute: "connection_type",
  //       label: "Kiểu kết nối",
  //       type: "multiple",
  //       values: ["Có dây", "Bluetooth", "Wireless 2.4GHz", "Đa kết nối"]
  //     },
  //     {
  //       attribute: "layout",
  //       label: "Kích thước",
  //       type: "multiple",
  //       values: ["Full-size (100%)", "TKL (80%)", "75%", "65%", "60%"]
  //     },
  //     {
  //       attribute: "backlight",
  //       label: "Đèn LED",
  //       type: "multiple",
  //       values: ["RGB", "Đơn sắc", "Không có đèn"]
  //     }
  //   ]
  // }
};

export default filterOptions;