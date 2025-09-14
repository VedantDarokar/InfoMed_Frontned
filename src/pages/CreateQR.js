import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { infoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import { Button, Input, Textarea, Alert, Card } from '../components/common/UI';

const CreateQR = () => {
  const { admin, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    // Medicine-specific fields
    medicineName: '',
    usage: '',
    dosage: '',
    exp: '',
    man: '',
    price: '',
    btno: '',
    compName: '',
    instr: '',
    drugs: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [qrResult, setQrResult] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth status:', { isAuthenticated, admin });
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
    }
  }, [isAuthenticated, admin]);

  const validateForm = () => {
    const newErrors = {};

    // Medicine-specific Validation
    if (!formData.medicineName.trim()) {
      newErrors.medicineName = 'Medicine name is required';
    }

    if (!formData.usage.trim()) {
      newErrors.usage = 'Usage/Purpose is required';
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage instructions are required';
    }

    if (!formData.exp.trim()) {
      newErrors.exp = 'Expiry date is required';
    }

    if (!formData.man.trim()) {
      newErrors.man = 'Manufacturing date is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    }

    if (!formData.btno.trim()) {
      newErrors.btno = 'Batch number is required';
    }

    if (!formData.compName.trim()) {
      newErrors.compName = 'Company name is required';
    }

    if (!formData.instr.trim()) {
      newErrors.instr = 'Storage instructions are required';
    }

    if (!formData.drugs.trim()) {
      newErrors.drugs = 'Drug composition is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear general error
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    console.log('Current errors:', errors);
    
    if (!validateForm()) {
      console.log('Validation failed. Errors:', errors);
      return;
    }

    console.log('Validation passed, sending to API...');
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Sending data to API:', formData);
      const response = await infoAPI.create(formData);
      console.log('API response:', response);
      
      setSuccess(true);
      setQrResult(response.data);
      
      // Reset form
      setFormData({
        medicineName: '',
        usage: '',
        dosage: '',
        exp: '',
        man: '',
        price: '',
        btno: '',
        compName: '',
        instr: '',
        drugs: '',
      });
      
    } catch (err) {
      console.error('API Error:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(err.message || 'Failed to create QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrResult?.qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrResult.qrCodeDataUrl;
    link.download = `qr-code-${qrResult.infoRecord.medicineName.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateAnother = () => {
    setSuccess(false);
    setQrResult(null);
    setError('');
  };

  if (success && qrResult) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              QR Code Created Successfully!
            </h1>
            <p className="text-gray-600">
              Your QR code has been generated and is ready to use.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code Display */}
            <Card className="p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your QR Code</h3>
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block">
                <img
                  src={qrResult.qrCodeDataUrl}
                  alt="Generated QR Code"
                  className="max-w-full h-auto"
                  style={{ maxWidth: '256px', maxHeight: '256px' }}
                />
              </div>
              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleDownloadQR}
                  variant="green"
                  size="lg"
                  className="w-full"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download QR Code
                </Button>
                <p className="text-sm text-gray-600">
                  URL: <a href={qrResult.qrCodeUrl} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600 break-all">
                    {qrResult.qrCodeUrl}
                  </a>
                </p>
              </div>
            </Card>

            {/* Record Details */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Record Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                  <p className="text-gray-900">{qrResult.infoRecord.medicineName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage/Purpose</label>
                  <p className="text-gray-900">{qrResult.infoRecord.usage}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Instructions</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{qrResult.infoRecord.dosage}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{qrResult.infoRecord.exp}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacture Date</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{qrResult.infoRecord.man}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{qrResult.infoRecord.price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{qrResult.infoRecord.btno}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer/Company Name</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{qrResult.infoRecord.compName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Storage Instructions</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{qrResult.infoRecord.instr}</p>
                </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drugs</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{qrResult.infoRecord.drugs}</p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Created:</span> {new Date(qrResult.infoRecord.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span> Active
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-center space-x-4 mt-8">
            <Button
              onClick={handleCreateAnother}
              variant="outline"
              size="lg"
            >
              Create Another QR Code
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="green"
              size="lg"
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Create New Medicine QR Code
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Fill in the medicine information below to generate a QR code for easy access to drug details.
            </p>
          </div>

          <Card className="p-4 sm:p-6 lg:p-8">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError('')}
                className="mb-6"
              />
            )}
            
            {/* Validation Errors Summary - for debugging */}
            {Object.keys(errors).length > 0 && (
              <Alert
                type="warning"
                message={`Please fill in the following required fields: ${Object.keys(errors).join(', ')}`}
                className="mb-6"
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Medicine Details Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Medicine Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <Input
                    label="Medicine Name"
                    name="medicineName"
                    value={formData.medicineName}
                    onChange={handleChange}
                    error={errors.medicineName}
                    required
                    placeholder="e.g., Paracetamol"
                    maxLength="200"
                    className="sm:col-span-2 lg:col-span-3"
                  />
                  <Textarea
                    label="Usage/Purpose"
                    name="usage"
                    value={formData.usage}
                    onChange={handleChange}
                    error={errors.usage}
                    required
                    rows={3}
                    placeholder="What is this medicine used for?"
                    maxLength="500"
                    className="sm:col-span-2 lg:col-span-3"
                  />
                  <Textarea
                    label="Dosage Instructions"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    error={errors.dosage}
                    required
                    rows={3}
                    placeholder="How should this medicine be taken?"
                    maxLength="1000"
                    className="sm:col-span-2 lg:col-span-3"
                  />
                  <Textarea
                    label="Drug Composition"
                    name="drugs"
                    value={formData.drugs}
                    onChange={handleChange}
                    error={errors.drugs}
                    required
                    rows={3}
                    placeholder="Active ingredients and composition"
                    maxLength="1000"
                    className="sm:col-span-2 lg:col-span-3"
                  />
                </div>
              </div>

              {/* Product Details Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Product Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <Input
                    label="Manufacturing Date"
                    name="man"
                    type="date"
                    value={formData.man}
                    onChange={handleChange}
                    error={errors.man}
                    required
                  />
                  <Input
                    label="Expiry Date"
                    name="exp"
                    type="date"
                    value={formData.exp}
                    onChange={handleChange}
                    error={errors.exp}
                    required
                  />
                  <Input
                    label="Price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    error={errors.price}
                    required
                    placeholder="e.g., ₹25.00"
                  />
                  <Input
                    label="Batch Number"
                    name="btno"
                    value={formData.btno}
                    onChange={handleChange}
                    error={errors.btno}
                    required
                    placeholder="e.g., BT001234"
                    maxLength="100"
                  />
                  <Input
                    label="Company Name"
                    name="compName"
                    value={formData.compName}
                    onChange={handleChange}
                    error={errors.compName}
                    required
                    placeholder="e.g., ABC Pharmaceuticals"
                    maxLength="200"
                    className="sm:col-span-2 lg:col-span-1"
                  />
                  <Textarea
                    label="Storage Instructions"
                    name="instr"
                    value={formData.instr}
                    onChange={handleChange}
                    error={errors.instr}
                    required
                    rows={3}
                    placeholder="How should this medicine be stored?"
                    maxLength="1000"
                    className="sm:col-span-2 lg:col-span-3"
                  />
                </div>
              </div>

              {/* Information Panel */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start">
                  <svg className="w-6 h-6 text-blue-500 mr-0 sm:mr-3 mb-2 sm:mb-0 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-blue-800 font-semibold mb-2">Medicine QR Code System</h4>
                    <p className="text-blue-700 text-sm leading-relaxed mb-2">
                      After creating the QR code, patients and healthcare providers can scan it to instantly access:
                    </p>
                    <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
                      <li>Complete medicine information in multiple languages</li>
                      <li>Dosage instructions and usage guidelines</li>
                      <li>Expiry dates and storage requirements</li>
                      <li>Manufacturer details and batch information</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  variant="green"
                  size="lg"
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  {loading ? 'Generating...' : 'Generate Medicine QR Code'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreateQR;
