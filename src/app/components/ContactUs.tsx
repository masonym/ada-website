"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { sendEmail } from '@/utils/send-email';
import { Check, AlertCircle, Send } from 'lucide-react';

export type FormData = {
  name: string;
  email: string;
  message: string;
};

const ContactUs: React.FC = () => {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await sendEmail(data);
      reset();
      setSubmitStatus('success');
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  return (
    <section className="py-16 bg-navy-800 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {submitStatus && (
              <div className={`p-4 rounded-md flex items-start ${submitStatus === 'success' ? 'bg-green-800' : 'bg-red-999'
                }`}>
                {submitStatus === 'success' ? (
                  <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                )}
                <div>
                  <h3 className="font-semibold">{submitStatus === 'success' ? 'Success!' : 'Error'}</h3>
                  <p className="text-sm">
                    {submitStatus === 'success'
                      ? 'Your message has been sent successfully.'
                      : 'There was an error sending your message. Please try again.'}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { required: true })}
                className="w-full px-3 py-2 bg-navy-700 border border-navy-600 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                {...register('email', { required: true })}
                className="w-full px-3 py-2 bg-navy-700 border border-navy-600 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                {...register('message', { required: true })}
                className="w-full px-3 py-2 bg-navy-700 border border-navy-600 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your message here..."
              ></textarea>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
