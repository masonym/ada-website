import React from 'react';
import { policyHTML } from './privacy-policy';

const PrivacyPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Privacy Policy</h1>
            <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: policyHTML }}
            />
        </div>
    );
};

export default PrivacyPolicy;