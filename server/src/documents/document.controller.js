import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import Member from '../members/member.model.js';
import Payment from '../payments/payment.model.js';
import path from 'path';

const getDocumentHeader = () => {
  return `
    <div style="text-align: center; border-bottom: 2px solid #0056b3; padding-bottom: 20px; margin-bottom: 30px;">
      <h1 style="color: #0056b3; margin: 0; font-size: 28px;">NextEdge Society</h1>
      <p style="font-style: italic; color: #555; margin: 5px 0;">"Edge of Innovation. Core of Learning"</p>
      <p style="font-weight: bold; margin: 5px 0;">Government Polytechnic Vikramgad</p>
      <p style="font-size: 12px; color: #777; margin: 0;">Address: Vikramgad, Palghar, Maharashtra | Email: contact@nextedge.com | Web: www.nextedge.com</p>
    </div>
  `;
};

const getDocumentFooter = () => {
  return `
    <div style="margin-top: 50px; padding-top: 20px; text-align: left; display: flex; justify-content: space-between;">
      <div>
        <p>_______________________</p>
        <p style="font-weight: bold;">Authorized Signatory</p>
        <p style="font-size: 12px; color: #777;">NextEdge Society</p>
      </div>
      <div>
        <!-- QR Placeholder -->
      </div>
    </div>
  `;
};

const generatePdf = async (htmlContent, res, printName) => {
  try {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: 'new' });
    } catch (e) {
      console.log('Default chromium not found, trying local Windows Chrome path...');
      browser = await puppeteer.launch({ 
        headless: 'new', 
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
      });
    }
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '30px', right: '40px', bottom: '30px', left: '40px' }
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${printName}.pdf"`
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate document' });
  }
};

// @desc Generate Membership Certificate
// @route GET /api/documents/certificate/:memberId
export const generateCertificate = async (req, res) => {
  try {
    const member = await Member.findById(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    
    const refNo = `NES/CERT/${new Date().getFullYear()}/${member._id.toString().slice(-4).toUpperCase()}`;
    const date = new Date().toLocaleDateString();
    const memberName = member.name || member.email;
    
    const qrCodeDataUrl = await QRCode.toDataURL(`https://nextedgesociety.com/verify?id=${member._id}`);

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        ${getDocumentHeader()}
        <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 40px;">
          <p><strong>Ref No:</strong> ${refNo}</p>
          <p><strong>Date:</strong> ${date}</p>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
          <h2 style="font-size: 24px; text-decoration: underline; margin-bottom: 40px;">MEMBERSHIP CERTIFICATE</h2>
          
          <p style="font-size: 18px; line-height: 1.8;">This is to certify that</p>
          <h3 style="font-size: 26px; color: #333; margin: 10px 0;">${memberName}</h3>
          
          <p style="font-size: 16px; line-height: 1.8;">is an official member of the NextEdge Society with the enrollment number <strong>${member.enrollmentNumber || 'N/A'}</strong>.</p>
          <p style="font-size: 16px; line-height: 1.8;">This membership is valid for the academic year ${new Date().getFullYear()}-${new Date().getFullYear() + 1}. We commend their dedication to technological innovation and learning.</p>
        </div>
        
        <div style="margin-top: 100px; padding-top: 20px; text-align: left; display: flex; justify-content: space-between;">
          <div style="text-align: center;">
            <p>_______________________</p>
            <p style="font-weight: bold;">Authorized Signatory</p>
            <p style="font-size: 12px; color: #777;">NextEdge Society</p>
          </div>
          <div style="text-align: right;">
            <img src="${qrCodeDataUrl}" style="width: 100px; height: 100px;" alt="QR Code" />
            <p style="font-size: 10px; color: #555;">Scan to verify</p>
          </div>
        </div>
      </div>
    `;

    await generatePdf(html, res, `Membership_Certificate_${memberName.replace(/[^a-zA-Z0-9]/g, '_')}`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Generate Payment Receipt
// @route GET /api/documents/receipt/:paymentId
export const generateReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('memberId');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    
    const member = payment.memberId;
    const refNo = `NES/REC/${new Date(payment.createdAt).getFullYear()}/${payment._id.toString().slice(-4).toUpperCase()}`;
    const date = new Date(payment.createdAt).toLocaleDateString();
    const memberName = member.name || member.email || 'Unknown Member';
    
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        ${getDocumentHeader()}
        <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 30px;">
          <p><strong>Receipt No:</strong> ${refNo}</p>
          <p><strong>Date:</strong> ${date}</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="font-size: 22px; text-decoration: underline;">OFFICIAL PAYMENT RECEIPT</h2>
        </div>
        
        <div style="margin-left: 20px; font-size: 16px; line-height: 2;">
          <p><strong>Received with thanks from:</strong> ${memberName}</p>
          <p><strong>Enrollment Number:</strong> ${member.enrollmentNumber || 'N/A'}</p>
          <p><strong>The sum of:</strong> $${payment.amount} (USD)</p>
          <p><strong>Towards:</strong> ${payment.purpose}</p>
          <p><strong>Payment Method:</strong> ${payment.paymentType.toUpperCase()}</p>
          <p><strong>Status:</strong> <span style="color: ${payment.status === 'Approved' ? 'green' : 'black'}">${payment.status}</span></p>
        </div>
        
        ${getDocumentFooter()}
      </div>
    `;

    await generatePdf(html, res, `Payment_Receipt_${refNo.replace(/\//g, '_')}`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Generate Appointment Letter
// @route GET /api/documents/appointment/:memberId
export const generateAppointment = async (req, res) => {
  try {
    const member = await Member.findById(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    
    const refNo = `NES/APT/${new Date().getFullYear()}/${member._id.toString().slice(-4).toUpperCase()}`;
    const date = new Date().toLocaleDateString();
    const memberName = member.name || member.email.split('@')[0];
    const role = member.role === 'admin' ? 'Co-ordinator / Faculty Advisor' : 'Club Committee Member';

    const qrCodeDataUrl = await QRCode.toDataURL(`https://nextedgesociety.com/verify?id=${member._id}`);

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        ${getDocumentHeader()}
        <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 30px;">
          <p><strong>Ref No:</strong> ${refNo}</p>
          <p><strong>Date:</strong> ${date}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <p>To,</p>
          <p style="font-weight: bold; margin: 2px 0;">${memberName},</p>
          <p style="margin: 2px 0;">${member.email}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p><strong>Subject: Appointment Letter for the position of ${role}</strong></p>
        </div>
        
        <div style="line-height: 1.6; text-align: justify; margin-bottom: 40px;">
          <p>Dear ${memberName},</p>
          <p>We are pleased to officially appoint you to the position of <strong>${role}</strong> for the NextEdge Society, Government Polytechnic Vikramgad.</p>
          <p>Your responsibilities will include managing activities relevant to your role, organizing technological events, and upholding the integrity of the "Edge of Innovation, Core of Learning" standard that our club represents.</p>
          <p>This appointment is valid for the academic year ${new Date().getFullYear()}-${new Date().getFullYear() + 1}, subject to satisfactory performance and adherence to the club's code of conduct.</p>
          <p>We look forward to a successful and innovative year under your leadership and participation.</p>
        </div>
        
        <div style="margin-top: 60px; padding-top: 20px; text-align: left; display: flex; justify-content: space-between;">
          <div style="text-align: center;">
            <p>_______________________</p>
            <p style="font-weight: bold;">Authorized Signatory</p>
            <p style="font-size: 12px; color: #777;">NextEdge Society</p>
          </div>
          <div style="text-align: right;">
            <img src="${qrCodeDataUrl}" style="width: 100px; height: 100px;" alt="QR Code" />
            <p style="font-size: 10px; color: #555;">Official Appointment Tracker</p>
          </div>
        </div>
      </div>
    `;

    await generatePdf(html, res, `Appointment_${memberName.replace(/[^a-zA-Z0-9]/g, '_')}`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
