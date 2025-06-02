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
  companyWebsite: yup.string().matches(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/\S*)?$/gm, 'Must be a valid URL'),
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
              .required('Email is required')
              .test({
                name: 'is-gov-or-mil-email-for-free-ticket',
                // We'll use the test context to access the parent ticket type
                test: function(email, context) {
                  // Get the current ticket from the parent context
                  // First, try to get the ticket from the context path
                  const ticketPath = context.path.split('.');
                  const ticketIdPath = ticketPath.slice(0, -2).concat('ticketId').join('.');
                  
                  // Get the ticketId from the parent
                  const ticketId = context.parent && ticketIdPath ? context.parent[ticketIdPath] : null;
                  
                  // If we have a ticketId, try to find the ticket in the REGISTRATION_TYPES
                  if (ticketId) {
                    try {
                      // This will be handled in the API validation
                      // For client-side validation, we'll check if the email ends with .gov or .mil
                      // for any ticket with 'complimentary' in the ID or 'govt' in the ID
                      if (ticketId.includes('complimentary') || ticketId.includes('govt')) {
                        if (!isGovOrMilEmail(email)) {
                          return this.createError({
                            message: 'Government or military email (.gov or .mil) is required for complimentary tickets',
                            path: context.path
                          });
                        }
                      }
                    } catch (error) {
                      console.error('Error checking ticket type:', error);
                    }
                  }
                  
                  return true;
                }
              }),
            jobTitle: yup.string().required('Job title is required'),
            company: yup.string().required('Company name is required'),
            // Added businessSize, industry, and sbaIdentification to attendeeInfo
            businessSize: yup.string().oneOf([
              'Small Business',
              'Medium-Sized Business',
              'Large-Sized Business',
              'Government Agency',
              'Military Component'
            ] as const).required('Business size is required for attendee'),
            industry: yup.string().required('Industry is required for attendee'),
            sbaIdentification: yup.string().when('businessSize', {
              is: 'Small Business',
              then: (schema) => schema.required('SBA identification is required for Small Business'),
              otherwise: (schema) => schema.optional(),
            }),
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
