import express from "express";
import { listDistricts, listProvinces, listWards } from "#controller/addresses-controller.js";
import { cacheRoute } from "#middleware/cache.js";

const router = express.Router();
// base url: /api/addresses
router.get("/provinces", cacheRoute('1 day'), listProvinces);
router.get("/provinces/:provinceCode/districts", cacheRoute('1 day'), listDistricts);
router.get("/districts/:districtCode/wards", cacheRoute('1 day'), listWards);

export default router;