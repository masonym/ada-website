interface TermsAndConditionsProps {
  agreed: boolean;
  onChange: (agreed: boolean) => void;
  error?: string;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  agreed,
  onChange,
  error,
}) => (
  <div className="mt-4">
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          checked={agreed}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor="terms" className="font-medium text-gray-700">
          I agree to the terms and conditions *
        </label>
        <p className="text-gray-500">
          By checking this box, you agree to our Terms of Service and Privacy Policy.
        </p>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  </div>
);
