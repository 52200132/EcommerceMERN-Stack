import DiscountCode from '../models/DiscountCode.js';
import Order from '../models/Order.js';

export const getAllDiscountCodes = async (req, res) => {
  try {
    const includeOrders = req.query.includeOrders === 'true';
    const pageNumber = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const q = (req.query.q || '').trim();
    const matchStage = q ? { code: { $regex: q, $options: 'i' } } : {};

    if (includeOrders) {
      const pipeline = [
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            codes: [
              {
                $lookup: {
                  from: 'orders',
                  let: { code: '$code' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$discount_code', '$$code'] } } },
                    {
                      $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user',
                        pipeline: [{ $project: { username: 1, email: 1 } }]
                      }
                    },
                    { $addFields: { user: { $first: '$user' } } },
                    {
                      $project: {
                        _id: 1,
                        user: 1,
                        grand_total: 1,
                        order_status: 1,
                        discount: 1,
                        createdAt: 1,
                      }
                    }
                  ],
                  as: 'orders'
                }
              },
              {
                $addFields: {
                  usageFromOrders: { $size: { $ifNull: ['$orders', []] } },
                  usageCount: {
                    $max: [
                      '$usedCount',
                      { $size: { $ifNull: ['$orders', []] } }
                    ]
                  },
                  remainingUses: {
                    $max: [
                      {
                        $subtract: [
                          '$maxUsage',
                          {
                            $max: [
                              '$usedCount',
                              { $size: { $ifNull: ['$orders', []] } }
                            ]
                          }
                        ]
                      },
                      0
                    ]
                  }
                }
              },
              { $skip: pageSize * (pageNumber - 1) },
              { $limit: pageSize }
            ],
            totalDocs: [{ $count: 'count' }]
          }
        },
        {
          $project: {
            codes: 1,
            total: { $ifNull: [{ $arrayElemAt: ['$totalDocs.count', 0] }, 0] }
          }
        }
      ];

      const result = await DiscountCode.aggregate(pipeline);
      const codes = result[0]?.codes || [];
      const total = result[0]?.total || 0;
      return res.json({
        ec: 0,
        em: 'Discount codes retrieved successfully',
        dt: {
          codes,
          page: pageNumber,
          pages: Math.ceil(total / pageSize) || 1,
          total,
        }
        });
      }

      const [total, codes] = await Promise.all([
        DiscountCode.countDocuments(matchStage),
        DiscountCode.find(matchStage)
          .sort({ createdAt: -1 })
          .skip(pageSize * (pageNumber - 1))
          .limit(pageSize),
      ]);

      res.json({
        ec: 0,
        em: 'Discount codes retrieved successfully',
        dt: {
          codes,
          page: pageNumber,
          pages: Math.max(Math.ceil(total / pageSize), 1),
          total,
        }
      });
    } catch (error) {
      res.status(500).json({ ec: 500, em: error.message });
    }
  };

export const getDiscountCode = async (req, res) => {
  try {
    const code = (req.query.code || '').toString().trim();
    const discountCode = await DiscountCode.findOne({ code });
    if (!discountCode) {
      return res.status(404).json({ ec: 404, em: 'Discount code not found' });
    }
    res.json({ ec: 0, em: 'Discount code retrieved successfully', dt: discountCode });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const getDiscountCodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const discountCode = await DiscountCode.findById(id);
    if (!discountCode) {
      return res.status(404).json({ ec: 404, em: 'Discount code not found' });
    }
    res.json({ ec: 0, em: 'Discount code retrieved successfully', dt: discountCode });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const createDiscountCode = async (req, res) => {
  try {
    const {
      code,
      valueType = 'fixed',
      value,
      maxUsage = 10,
      minOrderValue = 0,
      isActive = true,
    } = req.body;

    const payload = {
      code,
      valueType,
      value,
      maxUsage,
      minOrderValue,
      isActive,
    };

    const discountCode = await DiscountCode.create(payload);
    res.status(201).json({ ec: 0, em: 'Discount code created successfully', dt: discountCode });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const useDiscountCode = async (req, res) => {
  try {
    const { code, total_amount = 0 } = req.body;
    const discountCode = await DiscountCode.findOne({ code });
    if (!discountCode) {
      return res.status(404).json({ ec: 404, em: 'Discount code not found' });
    }

    const discount = discountCode.calculateDiscount(total_amount);
    if (discount <= 0) {
      return res.status(400).json({
        ec: 400,
        em: 'Discount code is not applicable for this order amount or has no remaining uses',
      });
    }

    const remainingUses = Math.max(discountCode.maxUsage - discountCode.usedCount, 0);
    return res.json({
      ec: 0,
      em: 'Discount code is valid',
      dt: {
        code: discountCode.code,
        discount,
        remainingUses,
        valueType: discountCode.valueType,
        value: discountCode.value,
      },
    });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const updateDiscountCode = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      valueType,
      value,
      maxUsage,
      minOrderValue,
      isActive,
      limit,
      condition,
      discount,
    } = req.body;

    const discountCode = await DiscountCode.findById(id);
    if (!discountCode) {
      return res.status(404).json({ ec: 404, em: 'Discount code not found' });
    }

    const nextCode = code !== undefined ? (code || '').toString().toUpperCase() : discountCode.code;
    const nextValueType = valueType !== undefined ? valueType : discountCode.valueType;
    const nextValue = Number(discount ?? value ?? discountCode.value) || 0;
    const nextMax = Math.max(0, Math.min(Number(limit ?? maxUsage ?? discountCode.maxUsage) || 0, 10));
    const nextMinOrder = Math.max(0, Number(condition ?? minOrderValue ?? discountCode.minOrderValue) || 0);
    const nextActive = typeof isActive === 'boolean' ? isActive : discountCode.isActive;

    if (nextCode.length !== 5) {
      return res.status(400).json({ ec: 400, em: 'Mã giảm giá phải đúng 5 ký tự' });
    }
    if (!/^[A-Z0-9]{5}$/.test(nextCode)) {
      return res.status(400).json({ ec: 400, em: 'Mã chỉ cho phép A-Z và 0-9' });
    }
    if (nextValueType === 'percent' && (nextValue < 1 || nextValue > 100)) {
      return res.status(400).json({ ec: 400, em: 'Giá trị phần trăm phải từ 1 đến 100' });
    }
    if (nextValueType === 'fixed' && nextValue < 1000) {
      return res.status(400).json({ ec: 400, em: 'Giá trị giảm cố định phải từ 1000 trở lên' });
    }
    if (nextValue <= 0) {
      return res.status(400).json({ ec: 400, em: 'Giá trị giảm phải lớn hơn 0' });
    }
    if (nextMax < 0 || nextMax > 10) {
      return res.status(400).json({ ec: 400, em: 'Số lần sử dụng phải từ 0 đến 10' });
    }
    if (nextMinOrder < 0) {
      return res.status(400).json({ ec: 400, em: 'Điều kiện áp dụng không được âm' });
    }

    if (nextCode !== discountCode.code) {
      const existed = await DiscountCode.findOne({ code: nextCode });
      if (existed) {
        return res.status(400).json({ ec: 400, em: 'Mã giảm giá đã tồn tại' });
      }
    }

    discountCode.code = nextCode;
    discountCode.valueType = nextValueType;
    discountCode.value = nextValue;
    discountCode.maxUsage = nextMax;
    discountCode.minOrderValue = nextMinOrder;
    discountCode.isActive = nextActive;

    await discountCode.save();

    res.json({ ec: 0, em: 'Discount code updated successfully', dt: discountCode });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const deleteDiscountCode = async (req, res) => {
  try {
    const { id } = req.params;
    const discountCode = await DiscountCode.findByIdAndDelete(id);
    if (!discountCode) {
      return res.status(404).json({ ec: 404, em: 'Discount code not found' });
    }
    res.json({ ec: 0, em: 'Discount code deleted successfully', dt: discountCode });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const getOrdersByDiscountCode = async (req, res) => {
  try {
    const code = (req.params.code || '').trim();
    const pageNumber = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const q = (req.query.q || '').trim();

    const orderFilter = { discount_code: code };
    if (q) {
      orderFilter._id = { $regex: q, $options: 'i' };
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(orderFilter),
      Order.find(orderFilter)
        .sort({ createdAt: -1 })
        .skip(pageSize * (pageNumber - 1))
        .limit(pageSize)
        .populate('user_id', 'username email')
        .select('user_id grand_total order_status discount createdAt')
    ]);

    return res.json({
      ec: 0,
      em: 'Orders retrieved successfully',
      dt: {
        orders,
        page: pageNumber,
        pages: Math.ceil(total / pageSize) || 1,
        total,
      }
    });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};
