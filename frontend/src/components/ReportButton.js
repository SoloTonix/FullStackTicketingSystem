import { useState, useRef } from 'react';
import { PaperClipIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import emailjs from '@emailjs/browser';


const ReportModal = ({ isOpen, onClose }) => {
  const formRef = useRef();
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    location: '',
    description: '',
    equipment: '',
    actionsTaken: '',
    recommendations: ''
  });
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Initialize EmailJS (put this in your app's initialization)
  // emailjs.init("YOUR_PUBLIC_KEY"); // Move this to your app initialization

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the template parameters
      const templateParams = {
        ...formData,
        date: new Date().toLocaleString(),
        attachment_name: attachment ? attachment.name : 'None'
      };

      // Send the email
      const response = await emailjs.send(
        'YOUR_SERVICE_ID',     // EmailJS service ID
        'YOUR_TEMPLATE_ID',    // EmailJS template ID
        templateParams,
        'YOUR_PUBLIC_KEY'      // EmailJS public key
      );

      if (response.status === 200) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          setFormData({
            title: '',
            client: '',
            location: '',
            description: '',
            equipment: '',
            actionsTaken: '',
            recommendations: ''
          });
          setAttachment(null);
        }, 2000);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (err) {
      console.error('Error sending report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-gray-900">F.S.E. Report</h3>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
                <p>Report submitted successfully! The email has been sent.</p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-md">
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Report Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                      Client Name*
                    </label>
                    <input
                      type="text"
                      name="client"
                      id="client"
                      required
                      value={formData.client}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location*
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="equipment" className="block text-sm font-medium text-gray-700">
                    Equipment/System Involved
                  </label>
                  <input
                    type="text"
                    name="equipment"
                    id="equipment"
                    value={formData.equipment}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Issue Description*
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="actionsTaken" className="block text-sm font-medium text-gray-700">
                    Actions Taken*
                  </label>
                  <textarea
                    name="actionsTaken"
                    id="actionsTaken"
                    rows={3}
                    required
                    value={formData.actionsTaken}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700">
                    Recommendations
                  </label>
                  <textarea
                    name="recommendations"
                    id="recommendations"
                    rows={3}
                    value={formData.recommendations}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">
                    Attachments (Note: EmailJS template will show filename but not the actual file)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="attachment"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="attachment"
                            name="attachment"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF up to 5MB
                      </p>
                    </div>
                  </div>
                  {attachment && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <PaperClipIcon className="flex-shrink-0 mr-1 h-4 w-4" />
                      <span>{attachment.name}</span>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {!submitSuccess && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Sending...' : 'Submit Report'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Example usage in your component:
const ReportButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)} className='px-4 py-1 md:py-2 bg-blue-800 text-white rounded-sm flex gap-2 items-center'>
          <PlusIcon className="w-6 h-6" />Report
      </button>
      
      <ReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ReportButton;

