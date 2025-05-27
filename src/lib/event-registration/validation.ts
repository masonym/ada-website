import { RegistrationFormData } from '@/types/event-registration/registration';
import * as yup from 'yup';

export const registrationSchema = yup.object().shape({
  // Attendee Information
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  jobTitle: yup.string().required('Job title is required'),
  company: yup.string().required('Company name is required'),
  companyWebsite: yup.string().matches(/^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm, 'Must be a valid URL'),
  businessSize: yup.string().oneOf([
    'Small Business',
    'Medium-Sized Business',
    'Large-Sized Business',
    'Government Agency',
    'Military Component'
  ] as const).required('Business size is required'),
  industry: yup.string().required('Industry is required'),
  
  // Survey Questions
  howDidYouHearAboutUs: yup.string(),
  interestedInSponsorship: yup.boolean().default(false).required(),
  interestedInSpeaking: yup.boolean().default(false).required(),
  
  // Terms and Conditions
  agreeToTerms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
  agreeToPhotoRelease: yup.boolean().default(false).required(),
  
  // Tickets
  tickets: yup
    .array(
      yup.object({
        ticketId: yup.string().required('Ticket ID is required'),
        quantity: yup
          .number()
          .integer('Quantity must be a whole number')
          .min(1, 'Quantity must be at least 1')
          .required('Quantity is required'),
        attendeeInfo: yup.array().of(
          yup.object({
            firstName: yup.string().required('First name is required'),
            lastName: yup.string().required('Last name is required'),
            email: yup
              .string()
              .email('Invalid email address')
              .required('Email is required'),
            jobTitle: yup.string().required('Job title is required'),
            company: yup.string().required('Company name is required'),
            dietaryRestrictions: yup.string(),
            accessibilityNeeds: yup.string(),
          })
        ),
      })
    )
    .min(1, 'At least one ticket is required')
    .required('At least one ticket is required'),
  
  // Payment
  paymentMethod: yup.string().oneOf(['creditCard', 'free'] as const).required('Payment method is required'),
  promoCode: yup.string(),
});

export async function validateRegistrationData(data: unknown): Promise<{
  isValid: boolean;
  errors: Record<string, string>;
  validatedData: RegistrationFormData | null;
}> {
  try {
    const validatedData = await registrationSchema.validate(data, { abortEarly: false }) as RegistrationFormData;
    return {
      isValid: true,
      errors: {},
      validatedData,
    };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      
      return {
        isValid: false,
        errors,
        validatedData: null,
      };
    }
    
    throw error;
  }
}

export function isGovOrMilEmail(email: string): boolean {
  const domain = email.split('@')[1] || '';
  return domain.endsWith('.gov') || domain.endsWith('.mil');
}

export function validateTicketQuantities(
  ticketSelections: Array<{ ticketId: string; quantity: number }>,
  availableTickets: Array<{ id: string; quantityAvailable?: number }>
): { valid: boolean; error?: string } {
  for (const selection of ticketSelections) {
    const ticket = availableTickets.find((t) => t.id === selection.ticketId);
    
    if (!ticket) {
      return { valid: false, error: `Ticket with ID ${selection.ticketId} not found` };
    }
    
    if (ticket.quantityAvailable !== undefined && selection.quantity > ticket.quantityAvailable) {
      return { 
        valid: false, 
        error: `Only ${ticket.quantityAvailable} tickets available for ${ticket.id}` 
      };
    }
  }
  
  return { valid: true };
}
