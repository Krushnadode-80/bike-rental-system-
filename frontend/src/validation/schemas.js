import { z } from 'zod';
import toast from 'react-hot-toast';

const requiredText = (label, min = 1, max = 120) => z.string()
  .trim()
  .min(min, `${label} must be at least ${min} characters.`)
  .max(max, `${label} must be ${max} characters or fewer.`);

export const emailSchema = z.string().trim().email('Enter a valid email address.').max(254, 'Email is too long.');
export const phoneSchema = z.string().trim().regex(/^\d{10}$/, 'Enter a valid 10-digit Indian mobile number.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.'),
});

export const registerSchema = z.object({
  name: requiredText('Name', 2, 100),
  email: emailSchema,
  phone: phoneSchema,
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128, 'Password must be 128 characters or fewer.'),
  confirmPassword: z.string(),
  agreed: z.boolean().refine(Boolean, 'You must agree to the Terms & Conditions.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

const acceptedDocumentTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const fileUploadSchema = (documentType) => z.custom((file) => Boolean(file && typeof file.size === 'number' && typeof file.type === 'string'))
  .refine((file) => file.size > 0, 'Choose a file to upload.')
  .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be 5 MB or less.')
  .refine((file) => documentType === 'profile'
    ? ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    : acceptedDocumentTypes.includes(file.type), documentType === 'profile'
    ? 'Profile photo must be a JPG, PNG, or WEBP image.'
    : 'Document must be a JPG, PNG, WEBP, or PDF file.');

export const profileSchema = z.object({
  name: requiredText('Name', 2, 100),
  phone: phoneSchema,
  address: requiredText('Address', 5, 300),
});

export const adminUserSchema = z.object({
  name: requiredText('Name', 2, 100),
  email: emailSchema,
  phone: z.union([z.literal(''), phoneSchema]),
  role: z.enum(['user', 'admin'], { errorMap: () => ({ message: 'Select a valid role.' }) }),
});

const optionalText = (label, max = 120) => z.string().trim().max(max, `${label} must be ${max} characters or fewer.`);
const positiveAmount = z.string().trim().min(1, 'Daily price is required.').refine((value) => Number.isFinite(Number(value)) && Number(value) >= 1 && Number(value) <= 1000000, 'Daily price must be between ₹1 and ₹10,00,000.');
const optionalUrl = z.string().trim().max(2048, 'Image URL must be 2,048 characters or fewer.').refine((value) => {
  if (!value) return true;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch (error) {
    return false;
  }
}, 'Enter a valid HTTP or HTTPS image URL.');
const requiredUrl = optionalUrl.refine((value) => value.length > 0, 'Image URL is required.');

export const adminBikeSchema = z.object({
  bike_name: requiredText('Bike name', 2, 100),
  brand: requiredText('Brand', 2, 80),
  model: requiredText('Model', 1, 40),
  price_per_day: positiveAmount,
  availability: z.enum(['Available', 'Booked', 'Unavailable']),
  image_url: requiredUrl,
  engine: optionalText('Engine', 40),
  mileage: optionalText('Mileage', 40),
  torque: optionalText('Torque', 40),
  fuel_tank: optionalText('Fuel tank', 40),
  plate_number: optionalText('Plate number', 20),
});

export const fleetBikeSchema = z.object({
  bikeName: requiredText('Bike name', 2, 100),
  brand: requiredText('Brand', 2, 80),
  model: requiredText('Model', 1, 40),
  pricePerDay: z.number().min(1, 'Daily price must be at least ₹1.').max(1000000, 'Daily price cannot exceed ₹10,00,000.'),
  availability: z.enum(['Available', 'Booked']),
  imageUrl: optionalUrl,
  engine: optionalText('Engine', 40),
  torque: optionalText('Torque', 40),
  fuelTank: optionalText('Fuel tank', 40),
  mileage: optionalText('Mileage', 40),
  plateNumber: optionalText('Plate number', 20),
});

export const contactSchema = z.object({
  name: requiredText('Name', 2, 100),
  email: emailSchema,
  subject: requiredText('Subject', 3, 120),
  message: requiredText('Message', 10, 2000),
});

export const chatbotSchema = z.string().trim().min(1, 'Enter a message.').max(2000, 'Message must be 2,000 characters or fewer.');

export const kycSchema = z.object({
  name: requiredText('Name', 2, 100),
  phone: phoneSchema,
  aadhaar: z.string().regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits.'),
  address: requiredText('Address', 5, 300),
});

export const otpSchema = z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit verification code.');

export const bookingDatesSchema = z.object({
  bookingDate: z.string().min(1, 'Select a pickup date.'),
  returnDate: z.string().min(1, 'Select a return date.'),
  pickupTime: z.string().optional(),
  returnTime: z.string().optional(),
  rentalType: z.enum(['daily', 'hourly']),
}).superRefine((data, ctx) => {
  const pTime = data.pickupTime || '09:00';
  const rTime = data.returnTime || '18:00';
  const startValue = `${data.bookingDate}T${pTime}`;
  const endValue = `${data.returnDate}T${rTime}`;
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bookingDate'], message: 'Enter valid pickup and return dates.' });
    return;
  }
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  if (data.bookingDate < localToday) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bookingDate'], message: 'Pickup date cannot be in the past.' });
  } else if (data.rentalType === 'hourly' && data.bookingDate === localToday) {
    const nowWithGrace = new Date(Date.now() - 5 * 60 * 1000);
    if (start < nowWithGrace) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pickupTime'], message: 'Pickup time cannot be in the past.' });
    }
  }
  if (end <= start) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['returnTime'], message: 'Return timing must be after pickup timing.' });
  }
});

export const validateWithToast = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success) {
    toast.error(result.error.issues[0]?.message || 'Please check the form fields.');
    return null;
  }
  return result.data;
};
