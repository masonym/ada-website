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
  interestedInSponsorship: yup.boolean().required(),
  interestedInSpeaking: yup.boolean().required(),

  // Terms and Conditions
  agreeToTerms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
  agreeToPhotoRelease: yup.boolean().default(false).required(),

  // Tickets
  tickets: yup.array().of(
    yup.object({
      ticketId: yup.string().required('Ticket ID is required'),
      quantity: yup.number().min(1).required(),
      attendeeInfo: yup.array().of(
        yup.object({
          firstName: yup.string().required('First name is required'),
          lastName: yup.string().required('Last name is required'),
          email: yup.string().email().required('Email is required'),
          jobTitle: yup.string().required('Job title is required'),
          company: yup.string().required('Company name is required'),
          businessSize: yup.string().required('Business size is required'),
          industry: yup.string().required('Industry is required'),
          sbaIdentification: yup.string().when('businessSize', {
            is: 'Small Business',
            then: schema => schema.required('Small Business Administration (SBA) identification is required for small businesses'),
            otherwise: schema => schema.optional(),
          }),
        })
      )
    }).test(
      'validate-gov-or-mil-emails',
      'Government or military email (.gov or .mil) is required for complimentary tickets',
      function(ticket) {
        const { ticketId, attendeeInfo } = ticket;
        if (!ticketId || !attendeeInfo) return true;

        if (ticketId.includes('complimentary') || ticketId.includes('govt')) {
          for (const attendee of attendeeInfo) {
            if (!isGovOrMilEmail(attendee.email)) {
              return this.createError({
                path: `${this.path}.attendeeInfo`, // maybe `${this.path}.attendeeInfo[i].email` for exact index
                message: 'Government or military email (.gov or .mil) is required for complimentary tickets'
              });
            }
          }
        }

        return true;
      }
    )
  )

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
