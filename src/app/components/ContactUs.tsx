"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { sendEmail } from '@/utils/send-email';
import { Check, AlertCircle } from 'lucide-react';

export type FormData = {
  name: string;
  email: string;
  message: string;
};

const ContactUs: React.FC = () => {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await sendEmail(data);
      if (result.success) {
        reset();
        setSubmitStatus('success');
        setStatusMessage(result.message);
      } else {
        setSubmitStatus('error');
        setStatusMessage(result.message);
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      setSubmitStatus('error');
      setStatusMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmitStatus(null);
        setStatusMessage('');
      }, 5000); // Clear status after 5 seconds
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="padding-container max-container flex w-full flex-col">
      <h2 className="self-start text-left font-gotham font-bold ss:text-[72px] text-[40px] md:text-[64px] text-slate-900">
        Have a question?
      </h2>
      <p className="flex-1 font-gotham font-bold ss:text-[72px] text-[16px] text-slate-500 mb-6">Send us your inquiry below.</p>
      
      {submitStatus && (
        <div className={`mb-4 p-4 rounded-md flex items-start ${
          submitStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {submitStatus === 'success' ? (
            <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
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

      <div className='mb-5'>
        <label htmlFor='name' className='mb-3 block text-base font-medium text-black'>
          Full Name
        </label>
        <input
          type='text'
          placeholder='Full Name'
          className='w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-blue-500 focus:shadow-md'
          {...register('name', { required: true })}
        />
      </div>
      <div className='mb-5'>
        <label htmlFor='email' className='mb-3 block text-base font-medium text-black'>
          Email Address
        </label>
        <input
          type='email'
          placeholder='example@domain.com'
          className='w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-blue-500 focus:shadow-md'
          {...register('email', { required: true })}
        />
      </div>
      <div className='mb-5'>
        <label htmlFor='message' className='mb-3 block text-base font-medium text-black'>
          Message
        </label>
        <textarea
          rows={4}
          placeholder='Type your message'
          className='w-full resize-none rounded-md border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-blue-500 focus:shadow-md'
          {...register('message', { required: true })}
        ></textarea>
      </div>
      <div>
        <button 
          type="submit"
          disabled={isSubmitting}
          className={`rounded-md py-3 px-8 text-base font-semibold text-white outline-none transition-all duration-300 ${
            isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Sending...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default ContactUs;