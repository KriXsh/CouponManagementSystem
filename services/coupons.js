'use strict'

import { standardManageError, errorMapping } from "../controllers/failureHandler.js";
import { validate } from "../middileware/index.js";
import { db } from '../controllers/index.js'
import { ObjectId } from 'mongodb';


const createCoupons = async (req, res) => {
    try {
        const createCoupons = await validate.payload(req.body, 'createCouponSchema');
        const dbPaylaod = {
            ...createCoupons,
            createdAt: new Date(),
        }
        console.log(dbPaylaod)
        const result = await db.insert('Coupons', [dbPaylaod]);
        return res.status(200).json({
            code: 200,
            message: 'Coupon created successfully',
            data: result
        });
    } catch (exception) {
        console.error(exception);
        const errorMessage = errorMapping[exception.code] ||
            'An unexpected error occurred. Please try again later.';
        return standardManageError(
            req,
            res,
            errorMessage,
            'exception'
        );
    }
}

const getCoupons = async (req, res) => {
    try {
        const id = req.params;
        if (!ObjectId.isValid(id)) {
            return standardManageError(
                req,
                res,
                'Invalid coupon ID format.Please provide vaild Coupons Id',
                'validate'
            );
        }
        const getCoupons = await db.getDocById('coupons', id);
        if (!getCoupons) {
            return standardManageError(
                req,
                res,
                `Coupons not found`,
                'notFound'
            );
        }
        return res.status(200).json({
            code: 200,
            message: 'Coupon retrieved successfully',
            data: getCoupons
        });
    } catch (exception) {
        console.error(exception);
        const errorMessage = errorMapping[exception.code] ||
            'An unexpected error occurred. Please try again later.';
        return standardManageError(
            req,
            res,
            errorMessage,
            'exception'
        );
    }
}


const getAllCoupons = async (req, res) => {
    try {
        const coupons = await db.getMany('coupons', null);
        if (!coupons) {
            return standardManageError(
                req,
                res,
                `Coupons not found`,
                'notFound'
            );
        }
        res.status(200).json({
            code: 200,
            message: 'Coupons retrieved successfully',
            data: coupons
        });

    } catch (exception) {
        console.error(exception);
        const errorMessage = errorMapping[exception.code] ||
            'An unexpected error occurred. Please try again later.';
        return standardManageError(
            req,
            res,
            errorMessage,
            'exception'
        );
    }
}

const updateCoupons = async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return standardManageError(
                req,
                res,
                'Invalid coupon ID format.Please provide vaild Coupons Id',
                'validate'
            );
        }
        const getCoupons = await db.getDocById('coupons', id);
        if (getCoupons) {
            const updatePayload = {};
            const keysToUpdate = ['type', 'discountDetails', 'conditions', 'validityStart', 'validityEnd'];
            // Allowed keys to update

            keysToUpdate.forEach((key) => {
                if (req.body[key] !== undefined) {
                    updatePayload[key] = req.body[key];
                }
            });

            await db.updateDocById('coupons', id, updatePayload);
            return res.status(200).json({
                message: 'Coupon updated successfully',
                updatedFields: updatePayload
            });
        } else {
            return standardManageError(
                req,
                res,
                `Coupons not found`,
                'notFound'
            );
        }
    } catch (exception) {
        console.error(exception);
        const errorMessage = errorMapping[exception.code] ||
            'An unexpected error occurred. Please try again later.';
        return standardManageError(
            req,
            res,
            errorMessage,
            'exception'
        );
    }
}


const deleteCoupons = async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return standardManageError(
                req,
                res,
                'Invalid coupon ID format.Please provide vaild Coupons Id',
                'validate'
            );
        }
        const getCoupons = await db.getDocById('coupons', id);
        if (!getCoupons) {
            return standardManageError(
                req,
                res,
                `Coupons not found`,
                'notFound'
            );
        }
        await db.deleteDoc('coupons', id);
        return res.status(200).json({
            code: 200,
            message: "Coupons deleted sucessfully."
        })
    } catch (exception) {
        console.error(exception);
        const errorMessage = errorMapping[exception.code] ||
            'An unexpected error occurred. Please try again later.';
        return standardManageError(
            req,
            res,
            errorMessage,
            'exception'
        );
    }
}


const getApplicableCoupons = async (req, res) => {
    try {
        const cart = await validate.payload(req.body, 'cartSchema');
        const currentDate = new Date();
        const coupons = await db.getMany('coupons', null);

        const applicableCoupons = coupons.filter((coupon) => {
            const isWithinValidity =
                currentDate >= new Date(coupon.validityStart) &&
                currentDate <= new Date(coupon.validityEnd);

            if (!isWithinValidity) return false;
            if (coupon.type === 'cart-wise') {
                return cart.total >= coupon.conditions.minCartTotal;
            }
            if (coupon.type === 'product-wise') {
                const applicableItems = cart.items.filter((item) =>
                    coupon.conditions.productIds
                        ? coupon.conditions.productIds.includes(item.productId)
                        : true
                );
                return applicableItems.length > 0 && cart.total >= coupon.conditions.minCartTotal;
            }
            if (coupon.type === 'BxGy') {
                const eligibleItems = cart.items.filter((item) =>
                    coupon.conditions.buyProducts
                        ? coupon.conditions.buyProducts.includes(item.productId)
                        : true
                );
                return eligibleItems.length >= coupon.conditions.buyQuantity;
            }
            return false;
        });

        const couponsWithDiscount = applicableCoupons.map((coupon) => {
            let discount = 0;
            if (coupon.type === 'cart-wise') {
                discount = (cart.total * coupon.discountDetails.percentage) / 100;
            } else if (coupon.type === 'product-wise') {
                const applicableItems = cart.items.filter((item) =>
                    coupon.conditions.productIds
                        ? coupon.conditions.productIds.includes(item.productId)
                        : true
                );
                discount = applicableItems.reduce(
                    (sum, item) => sum + (item.price * item.quantity * coupon.discountDetails.percentage) / 100,
                    0
                );
            } else if (coupon.type === 'BxGy') {
                discount = coupon.discountDetails.freeProducts.reduce(
                    (sum, freeProduct) => sum + freeProduct.price,
                    0
                );
            }
            return { couponId: coupon._id.$oid, discount };
        });
        return res.status(200).json({
            code: 200,
            message: 'Applicable coupons retrieved successfully',
            data: couponsWithDiscount
        });
    } catch (exception) {
        console.error(exception);
        const errorMessage = errorMapping[exception.code] ||
            'An unexpected error occurred. Please try again later.';
        return standardManageError(
            req,
            res,
            errorMessage,
            'exception'
        );
    }
};



const applyCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const cart = await validate.payload(req.body, 'cartSchema');
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                code: 400, message: 'Invalid coupon ID format'
            });
        }
        const coupon = await db.getDocById('coupons', id);
        if (!coupon) {
            return res.status(404).json({
                code: 404,
                message: 'Coupon not found or invalid'
            });
        }
        const currentDate = new Date();
        const isWithinValidity =
            currentDate >= new Date(coupon.validityStart) &&
            currentDate <= new Date(coupon.validityEnd);

        if (!isWithinValidity) {
            return res.status(400).json({
                code: 400,
                message: 'Coupon is not within the validity period.'
            });
        }
        let discount = 0;
        if (coupon.type === 'cart-wise') {
            if (cart.total >= coupon.conditions.minCartTotal) {
                discount = (cart.total * coupon.discountDetails.percentage) / 100;
                cart.total -= discount;
            } else {
                return res.status(400).json({
                    code: 400,
                    message: 'Cart total does not meet the minimum requirement.'
                });
            }
        } else if (coupon.type === 'product-wise') {
            const updatedItems = cart.items.map((item) => {
                if (coupon.conditions.productIds.includes(item.productId)) {
                    const itemDiscount = (item.price * coupon.discountDetails.percentage) / 100;
                    discount += itemDiscount * item.quantity;
                    return { ...item, price: item.price - itemDiscount };
                }
                return item;
            });
            cart.items = updatedItems;
            cart.total -= discount;
        } else if (coupon.type === 'BxGy') {
            const eligibleItems = cart.items.filter((item) =>
                coupon.conditions.buyProducts.includes(item.productId)
            );
            if (eligibleItems.length >= coupon.conditions.buyQuantity) {
                discount = coupon.discountDetails.freeProducts.reduce(
                    (sum, freeProduct) => sum + freeProduct.price,
                    0
                );
                cart.total -= discount;
            } else {
                return res.status(400).json({
                    code: 400,
                    message: 'Cart does not meet the BxGy requirements.'
                });
            }
        }
        return res.status(200).json({
            code: 200,
            message: 'Coupon applied successfully',
            data: {
                updatedCart: cart,
                discount
            }
        });
    } catch (exception) {
        console.error(exception);
        const errorMessage = errorMapping[exception.code] ||
            'An unexpected error occurred. Please try again later.';
        return standardManageError(
            req,
            res,
            errorMessage,
            'exception'
        );
    }
};


export {
    createCoupons,
    getCoupons,
    updateCoupons,
    getAllCoupons,
    deleteCoupons,
    getApplicableCoupons,
    applyCoupon
}