interface InvoiceData {
  invoiceNumber: string;
  clientDetails: {
    title?: string;
    matricule?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    amount: number;
  }[];
}

const numberToWords = (num: number): string => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  if (num === 0) return 'zero Dinars';

  const convertHundreds = (n: number): string => {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      if (n % 10 > 0) result += '-' + ones[n % 10];
      result += ' ';
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
    } else if (n > 0) {
      result += ones[n] + ' ';
    }
    return result;
  };

  const parts = num.toFixed(3).split('.');
  const integerPart = parseInt(parts[0]);
  const decimalPart = parts[1] ? parseInt(parts[1]) : 0;

  let result = '';

  if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000);
    result += convertHundreds(thousands) + 'thousand ';
    const remainder = integerPart % 1000;
    if (remainder > 0) {
      result += convertHundreds(remainder);
    }
  } else {
    result += convertHundreds(integerPart);
  }

  result = result.trim() + ' Dinars';

  if (decimalPart > 0) {
    result += ' and ' + convertHundreds(decimalPart).trim() + ' millimes';
  }

  return result;
};

export const generateInvoiceHTML = (data: InvoiceData): string => {
  const currentDate = new Date().toLocaleDateString();
  const baseAmount = data.items.reduce((sum, item) => sum + item.amount, 0);
  const tvaAmount = baseAmount * 0.19;
  const timbreAmount = 1.000;
  const totalAmount = baseAmount + tvaAmount + timbreAmount;
  const totalInWords = numberToWords(totalAmount);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${data.invoiceNumber}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; margin: 0; padding: 0; min-height: 100vh; display: flex; flex-direction: column; }
        .invoice-container { width: 100%; max-width: 210mm; margin: 0 auto; flex: 1; display: flex; flex-direction: column; padding: 20px; }
        .main-content { flex: 1; }
        .header-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .from-section { flex: 1; }
        .to-section { flex: 1; text-align: right; }
        .from-title, .to-title { background: #1f2937; color: white; padding: 8px 16px; font-weight: 600; margin-bottom: 16px; }
        .invoice-title { text-align: center; margin: 30px 0; }
        .invoice-title h1 { font-size: 32px; margin: 0; color: #1f2937; }
        .invoice-number { font-size: 18px; color: #6b7280; margin-top: 8px; }
        .content { margin: 40px 0; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th { background: #1f2937; color: white; padding: 16px; text-align: left; font-weight: 600; }
        td { padding: 16px; border-bottom: 1px solid #e5e7eb; }
        .amount-column { text-align: right; }
        .total-row { text-align: right; margin-top: 20px; padding: 16px 0; border-top: 2px solid #1f2937; }
        .total-amount { font-size: 24px; font-weight: 600; color: #1f2937; }
        .footer { text-align: center; padding: 20px; color: #6b7280; border-top: 1px solid #e5e7eb; margin-top: auto; }
        .print-btn { position: fixed; top: 20px; right: 20px; background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .print-btn:hover { background: #2563eb; }
        @media print { .print-btn { display: none; } body { padding: 0; } }
      </style>
    </head>
    <body>
      <button class="print-btn" onclick="window.print()">Print</button>
      <div class="invoice-container">
        <div class="main-content">
          <div class="header-section">
            <div class="from-section">
              <div class="from-title">FROM</div>
              <div>
                <strong>OSSEvent</strong><br>
                Matricule: AS-20567<br>
                Email: contact@oss-events.com.tn<br>
                Phone: +216 99 630 983<br>
                Address: Msaken, Sousse, Tunisia
              </div>
            </div>
            <div class="to-section">
              <div class="to-title">TO</div>
              <div>
                <strong>${data.clientDetails?.title || 'N/A'}</strong><br>
                Matricule: ${data.clientDetails?.matricule || 'N/A'}<br>
                Email: ${data.clientDetails?.email || 'N/A'}<br>
                Phone: ${data.clientDetails?.phone || 'N/A'}<br>
                Address: ${data.clientDetails?.address || 'N/A'}
              </div>
            </div>
          </div>
          
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <div class="invoice-number">#${data.invoiceNumber} - ${currentDate}</div>
          </div>
          
          <div class="content">
            <table>
              <thead>
                <tr>
                  <th>Service Description</th>
                  <th>Period</th>
                  <th class="amount-column">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                  <tr>
                    <td>
                      <strong>${item.title}</strong><br>
                      <small style="color: #6b7280;">${item.description || ''}</small>
                    </td>
                    <td>
                      ${item.startDate ? `From: ${new Date(item.startDate).toLocaleDateString()}<br>` : ''}
                      ${item.endDate ? `To: ${new Date(item.endDate).toLocaleDateString()}` : ''}
                    </td>
                    <td class="amount-column"><strong>${item.amount.toFixed(3)} TND</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals-section" style="margin-top: 30px; text-align: right;">
              <div style="margin-bottom: 10px; font-size: 18px; font-weight: 600; border-top: 2px solid #1f2937; padding-top: 15px;">
                Total HT: ${baseAmount.toFixed(3)} TND
              </div>
              <div style="margin-bottom: 10px; font-size: 16px;">
                TVA (19%): ${tvaAmount.toFixed(3)} TND
              </div>
              <div style="margin-bottom: 15px; font-size: 16px;">
                Timbre Fiscal: ${timbreAmount.toFixed(3)} TND
              </div>
              <div style="font-size: 24px; font-weight: 600; color: #1f2937; padding-top: 15px;">
                Total TTC: ${totalAmount.toFixed(3)} TND
              </div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>This Invoice close with amount total ${totalAmount.toFixed(3)} TND (${totalInWords})</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const openInvoiceInNewTab = (data: InvoiceData) => {
  const invoiceWindow = window.open('', '_blank');
  if (invoiceWindow) {
    invoiceWindow.document.write(generateInvoiceHTML(data));
    invoiceWindow.document.close();
  }
};