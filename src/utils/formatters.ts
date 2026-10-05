export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatAadhaar(aadhaar: string): string {
  const cleaned = aadhaar.replace(/\D/g, '').slice(0, 12);
  const parts = cleaned.match(/[\s\S]{1,4}/g) || [];
  return parts.join(' ');
}

export function maskAadhaar(aadhaar: string): string {
  const cleaned = aadhaar.replace(/\D/g, '');
  if (cleaned.length < 12) return aadhaar;
  return `XXXX XXXX ${cleaned.slice(-4)}`;
}

export function formatPAN(pan: string): string {
  return pan.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
}

export function generateRefNo(prefix = 'ROY'): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let random = '';
  for (let i = 0; i < 8; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${Date.now().toString().slice(-4)}-${random}`;
}

export function numberToWordsINR(num: number): string {
  if (num === 0) return 'ZERO RUPEES.';
  const a = [
    '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
    'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN',
    'EIGHTEEN', 'NINETEEN',
  ];
  const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

  const convertLessThanOneThousand = (n: number): string => {
    let current = '';
    if (n >= 100) {
      current += a[Math.floor(n / 100)] + ' HUNDRED ';
      n %= 100;
    }
    if (n >= 20) {
      current += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    } else if (n > 0) {
      current += a[n];
    }
    return current.trim();
  };

  const integerPart = Math.floor(num);
  let words = '';

  const crore = Math.floor(integerPart / 10000000);
  let remainder = integerPart % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  if (crore > 0) {
    words += convertLessThanOneThousand(crore) + ' CRORE ';
  }
  if (lakh > 0) {
    words += convertLessThanOneThousand(lakh) + ' LAKH ';
  }
  if (thousand > 0) {
    words += convertLessThanOneThousand(thousand) + ' THOUSAND ';
  }
  if (remainder > 0) {
    words += convertLessThanOneThousand(remainder);
  }

  return words.trim() + ' RUPEES.';
}
