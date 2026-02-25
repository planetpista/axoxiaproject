import axios from 'axios';
import { ShippingData, Currency } from '../types';

const BREVO_API_KEY = 'YOUR_BREVO_API_KEY'; // Replace with your Brevo API key
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
}

export const sendShippingConfirmation = async (
  shippingData: ShippingData,
  totalCost: number,
  currency: Currency,
  paymentDetails?: any
): Promise<boolean> => {
  try {
    const emailData: EmailData = {
      to: shippingData.sender.email,
      subject: 'Axoxia Shipping Confirmation',
      htmlContent: generateEmailTemplate(shippingData, totalCost, currency, paymentDetails)
    };

    const response = await axios.post(BREVO_API_URL, {
      sender: {
        name: 'Axoxia Shipping',
        email: 'affairsplanet@outlook.com'
      },
      to: [{
        email: emailData.to,
        name: `${shippingData.sender.firstName} ${shippingData.sender.lastName}`
      }],
      subject: emailData.subject,
      htmlContent: emailData.htmlContent
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      }
    });

    return response.status === 201;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

const generateEmailTemplate = (
  shippingData: ShippingData,
  totalCost: number,
  currency: Currency,
  paymentDetails?: any
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Axoxia Shipping Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .section { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Axoxia Shipping</h1>
          <p>Easy, Simple, and Fast</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h2>Shipping Confirmation</h2>
            <p>Dear ${shippingData.sender.firstName} ${shippingData.sender.lastName},</p>
            <p>Your shipping request has been confirmed. Here are the details:</p>
          </div>
          
          <div class="section">
            <h3>Shipment Details</h3>
            <p><strong>Category:</strong> ${shippingData.category}</p>
            <p><strong>Weight:</strong> ${shippingData.weight} kg</p>
            <p><strong>Country:</strong> ${shippingData.country}</p>
            <p><strong>Description:</strong> ${shippingData.details}</p>
          </div>
          
          <div class="section">
            <h3>Sender Information</h3>
            <p><strong>Name:</strong> ${shippingData.sender.firstName} ${shippingData.sender.lastName}</p>
            <p><strong>Address:</strong> ${shippingData.sender.address}</p>
            <p><strong>Contact:</strong> ${shippingData.sender.contact}</p>
          </div>
          
          <div class="section">
            <h3>Recipient Information</h3>
            <p><strong>Name:</strong> ${shippingData.recipient.firstName} ${shippingData.recipient.lastName}</p>
            <p><strong>Address:</strong> ${shippingData.recipient.address}</p>
            <p><strong>Contact:</strong> ${shippingData.recipient.contact}</p>
          </div>
          
          <div class="section">
            <h3>Cost Summary</h3>
            <p><strong>Total Cost:</strong> ${currency.symbol}${totalCost.toFixed(2)}</p>
            ${paymentDetails ? `<p><strong>Payment Status:</strong> Paid</p>` : ''}
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Axoxia!</p>
          <p>Contact us: affairsplanet@outlook.com | 010101010</p>
        </div>
      </div>
    </body>
    </html>
  `;
};