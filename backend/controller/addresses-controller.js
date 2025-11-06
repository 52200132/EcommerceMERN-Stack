// backend/controller/addresses-controller.js
const TINHTHANHPHO_COM_API =
  process.env.TINHTHANHPHO_COM_API ?? 'https://tinhthanhpho.com/api/v1';

const fetchJson = (url) => {
  return fetch(url,
    {
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`Failed to fetch data from ${url}: ${response.status} ${response.statusText} ${text}`);
        });
      }
      return response.json();
    })
    .then(jsonDT => jsonDT?.data ?? jsonDT)
    .catch(error => {
      throw new Error(`Failed to fetch data from ${url}: ${error.message}`);
    });
};

export const listProvinces = async (req, res, next) => {
  try {
    const provinces = await fetchJson(`${TINHTHANHPHO_COM_API}/provinces?limit=63`) || [];
    res.status(200).json({
      ec: 0,
      em: `Lấy danh sách ${provinces.length} tỉnh/thành phố thành công`,
      dt: provinces,
    });
  } catch (error) {
    next(error);
  }
};

export const listDistricts = async (req, res, next) => {
  const { provinceCode } = req.params;
  if (!provinceCode) {
    return res.status(400).json({ ec: 1, em: 'Vui lòng cung cấp mã tỉnh/thành phố' });
  }

  try {
    const districts = await fetchJson(`${TINHTHANHPHO_COM_API}/provinces/${provinceCode}/districts`) || [];
    res.status(200).json({
      ec: 0,
      em: `Lấy danh sách ${districts.length} quận/huyện thành công`,
      dt: districts,
    });
  } catch (error) {
    next(error);
  }
};

export const listWards = async (req, res, next) => {
  const { districtCode } = req.params;
  if (!districtCode) {
    return res.status(400).json({ ec: 1, em: 'Vui lòng cung cấp mã quận/huyện' });
  }

  try {
    const wards = await fetchJson(`${TINHTHANHPHO_COM_API}/districts/${districtCode}/wards`) || [];
    res.status(200).json({
      ec: 0,
      em: `Lấy danh sách ${wards.length} phường/xã thành công`,
      dt: wards,
    });
  } catch (error) {
    next(error);
  }
};