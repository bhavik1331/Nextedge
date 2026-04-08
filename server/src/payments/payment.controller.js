import Payment from './payment.model.js';
import Member from '../members/member.model.js';
import { uploadBuffer } from '../events/uploadToImageKit.js';

// @desc    Submit a manual payment (Member)
// @route   POST /api/payments/manual
export const submitManualPayment = async (req, res) => {
  try {
    const { amount, purpose, notes } = req.body;
    const memberId = req.member.id; // authenticateMember middleware populates req.member

    if (!amount || !purpose) {
      return res.status(400).json({ success: false, message: 'Amount and purpose are required.' });
    }

    let proofUrl = null;
    let proofPublicId = null;

    if (req.files && req.files.proofImage && req.files.proofImage.length > 0) {
      const file = req.files.proofImage[0];
      const fileName = `payment_proof_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const result = await uploadBuffer(file.buffer, 'payments/proofs', fileName);
      proofUrl = result.url;
      proofPublicId = result.fileId;
    } else {
      return res.status(400).json({ success: false, message: 'Payment proof is required.' });
    }

    const payment = await Payment.create({
      memberId,
      amount,
      purpose,
      paymentType: 'manual',
      proofUrl,
      proofPublicId,
      status: 'Pending',
      notes,
    });

    res.status(201).json({ success: true, payment });
  } catch (error) {
    console.error('Submit Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments for a member
// @route   GET /api/payments/member
export const getMemberPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ memberId: req.member.id }).sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments/admin
export const getAllPayments = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    
    // Populate member details to easily view who made the payment
    const payments = await Payment.find(query)
      .populate('memberId', 'name email status role')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify/Approve Payment (Admin)
// @route   PUT /api/payments/:id/approve
export const approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.status = 'Approved';
    await payment.save();

    // Automatically update member status if it's a membership fee
    if (payment.purpose.toLowerCase().includes('membership')) {
      await Member.findByIdAndUpdate(payment.memberId, { status: 'active' });
    }

    res.json({ success: true, message: 'Payment approved successfully', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject Payment (Admin)
// @route   PUT /api/payments/:id/reject
export const rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.status = 'Rejected';
    await payment.save();

    res.json({ success: true, message: 'Payment rejected successfully', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
