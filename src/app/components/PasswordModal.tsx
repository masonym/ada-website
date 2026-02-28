import React from 'react';

type PasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  error: string;
  setEnteredPassword: React.Dispatch<React.SetStateAction<string>>;
};

const PasswordModal = ({ isOpen, onClose, onSubmit, error, setEnteredPassword }: PasswordModalProps) => {
  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const password = (e.target as any).elements.password.value;
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-1 text-gray-700">Enter password to view presentations</h2>
        <p className="text-sm mb-2 font-gotham text-gray-600">Check the email associated with your registration for information on the password. The password will be sent out the week after the event has ended.</p>
        <form onSubmit={handleFormSubmit}>
          <input
            type="password"
            name="password"
            onChange={(e) => setEnteredPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
