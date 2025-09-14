import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { infoAPI, translationAPI } from '../services/api';
import Layout from '../components/common/Layout';
import { Select, LoadingSpinner, Alert, Card, Button } from '../components/common/UI';

const ViewInfo = () => {
  const { uniqueId } = useParams();
  const [infoRecord, setInfoRecord] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [translatedData, setTranslatedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [availableLanguages, setAvailableLanguages] = useState([]);

  const fetchInfoRecord = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await infoAPI.getByUniqueId(uniqueId);
      setInfoRecord(response.data.infoRecord);
      setQrCodeImage(response.data.qrCodeImage);
      setQrCodeUrl(response.data.qrCodeUrl);
    } catch (err) {
      setError(err.message || 'Failed to fetch information');
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await translationAPI.getLanguages();
      setAvailableLanguages(response.data.languages);
    } catch (err) {
      console.error('Failed to fetch languages:', err);
    }
  };

  useEffect(() => {
    if (uniqueId) {
      fetchInfoRecord();
    }
    fetchLanguages();
  }, [uniqueId]);

  const handleDownloadQR = () => {
    if (!qrCodeImage || !infoRecord) return;

    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = `qr-code-${infoRecord.medicineName.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLanguageChange = async (event) => {
    const targetLang = event.target.value;
    setSelectedLanguage(targetLang);
    setError(''); // Clear any previous errors

    if (targetLang === 'en' || !infoRecord) {
      setTranslatedData(null);
      return;
    }

    try {
      setTranslating(true);
      const textsToTranslate = [
        infoRecord.medicineName || '',
        infoRecord.usage || '',
        infoRecord.dosage || '',
        infoRecord.drugs || '',
        infoRecord.instr || ''
      ].filter(text => text.trim() !== ''); // Remove empty texts

      if (textsToTranslate.length === 0) {
        setError('No content available for translation.');
        setTranslating(false);
        return;
      }

      const response = await translationAPI.translateBatch({
        texts: textsToTranslate,
        targetLang
      });

      if (response.data && response.data.translatedTexts) {
        setTranslatedData({
          medicineName: response.data.translatedTexts[0] || infoRecord.medicineName,
          usage: response.data.translatedTexts[1] || infoRecord.usage,
          dosage: response.data.translatedTexts[2] || infoRecord.dosage,
          drugs: response.data.translatedTexts[3] || infoRecord.drugs,
          instr: response.data.translatedTexts[4] || infoRecord.instr,
          // Keep non-translatable fields as-is
          exp: infoRecord.exp,
          man: infoRecord.man,
          price: infoRecord.price,
          btno: infoRecord.btno,
          compName: infoRecord.compName,
          language: targetLang
        });
      } else {
        throw new Error('Invalid translation response');
      }
    } catch (err) {
      console.error('Translation failed:', err);
      setError(`Translation to ${availableLanguages.find(lang => lang.code === targetLang)?.name || targetLang} failed. Showing original content.`);
      setTranslatedData(null);
      // Reset to English on error
      setSelectedLanguage('en');
    } finally {
      setTranslating(false);
    }
  };

  if (loading) {
    return (
      <Layout showNavigation={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading information...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout showNavigation={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full">
            <Alert
              type="error"
              message={error}
              className="mb-4"
            />
            <div className="text-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!infoRecord) {
    return (
      <Layout showNavigation={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full text-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Information Not Found</h2>
              <p className="text-gray-600">The QR code you scanned might be invalid or the information has been removed.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const displayData = translatedData || infoRecord;
  const currentLanguageName = availableLanguages.find(lang => lang.code === selectedLanguage)?.name || 'English';

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Language Selector */}
          <div className="mb-6 sm:mb-8">
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <h3 className="font-medium text-gray-700">Choose Language</h3>
                    {translatedData && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Translated
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {translatedData ? (
                      <>Medicine information translated to <span className="font-medium text-green-600">{currentLanguageName}</span></>
                    ) : (
                      <>Content is currently displayed in <span className="font-medium">{currentLanguageName}</span></>
                    )}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {translating && (
                    <div className="flex items-center justify-center sm:justify-start space-x-2 text-blue-600 order-2 sm:order-1">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm font-medium">Translating...</span>
                    </div>
                  )}
                  <div className="order-1 sm:order-2">
                    <Select
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                      disabled={translating}
                      options={[{ value: 'en', label: 'English (Original)' }, ...availableLanguages.filter(lang => lang.code !== 'en').map(lang => ({
                        value: lang.code,
                        label: lang.name
                      }))].sort((a, b) => a.label.localeCompare(b.label))}
                      className="w-full sm:w-56"
                    />
                  </div>
                </div>
              </div>
              {error && (
                <Alert
                  type="warning"
                  message={error}
                  onClose={() => setError('')}
                  className="mt-4"
                />
              )}
            </Card>
          </div>

          {/* QR Code Display */}
          {qrCodeImage && (
            <div className="mb-6 sm:mb-8">
              <Card className="p-4 sm:p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4" />
                    </svg>
                    QR Code for {infoRecord.medicineName}
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* QR Code Image */}
                    <div className="flex-shrink-0">
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm inline-block">
                        <img
                          src={qrCodeImage}
                          alt={`QR Code for ${infoRecord.medicineName}`}
                          className="w-40 h-40 sm:w-48 sm:h-48"
                        />
                      </div>
                    </div>
                    
                    {/* QR Code Info */}
                    <div className="flex-1 text-center sm:text-left space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Scan to View Medicine Details</h4>
                        <p className="text-sm text-gray-600">
                          Anyone can scan this QR code to view complete medicine information including
                          usage, dosage, and safety instructions.
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleDownloadQR}
                          variant="green"
                          size="md"
                          className="w-full sm:w-auto"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download QR Code
                        </Button>
                        
                        <Button
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: `QR Code - ${infoRecord.medicineName}`,
                                text: `View medicine information for ${infoRecord.medicineName}`,
                                url: qrCodeUrl
                              });
                            } else {
                              navigator.clipboard.writeText(qrCodeUrl).then(() => {
                                alert('QR code URL copied to clipboard!');
                              });
                            }
                          }}
                          variant="outline"
                          size="md"
                          className="w-full sm:w-auto"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          Share QR Code
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* QR URL */}
                  <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1 font-medium">QR Code URL:</p>
                    <code className="text-xs text-gray-800 break-all">{qrCodeUrl}</code>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Content Display */}
          <div className="space-y-4 sm:space-y-6">
            {/* Medicine Header */}
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-start space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Card>

            {/* Medicine Information */}
            <Card className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Medicine Information
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Medicine Name */}
                <div className="lg:col-span-2">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{displayData.medicineName}</h3>
                  <div className="w-full h-px bg-gray-200 mb-4"></div>
                </div>

                {/* Usage */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Usage/Purpose
                  </h4>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{displayData.usage}</p>
                </div>

                {/* Dosage */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Dosage Instructions
                  </h4>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">{displayData.dosage}</p>
                </div>

                {/* Drug Composition */}
                <div className="lg:col-span-2">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Drug Composition
                  </h4>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">{displayData.drugs}</p>
                </div>
              </div>
            </Card>

            {/* Product Details */}
            <Card className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
                Product Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Manufacturing Date */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-gray-700 text-sm">Manufacturing Date</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{displayData.man}</p>
                </div>

                {/* Expiry Date */}
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-gray-700 text-sm">Expiry Date</span>
                  </div>
                  <p className="text-red-700 font-semibold">{displayData.exp}</p>
                </div>

                {/* Price */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="font-medium text-gray-700 text-sm">Price</span>
                  </div>
                  <p className="text-blue-700 font-semibold">{displayData.price}</p>
                </div>

                {/* Batch Number */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-medium text-gray-700 text-sm">Batch Number</span>
                  </div>
                  <p className="text-yellow-700 font-semibold">{displayData.btno}</p>
                </div>

                {/* Company Name */}
                <div className="bg-purple-50 rounded-lg p-4 sm:col-span-2 lg:col-span-2">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium text-gray-700 text-sm">Manufacturer</span>
                  </div>
                  <p className="text-purple-700 font-semibold">{displayData.compName}</p>
                </div>
              </div>
            </Card>

            {/* Storage Instructions */}
            <Card className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Storage Instructions
              </h2>
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                  {displayData.instr}
                </p>
              </div>
            </Card>


            {/* Metadata */}
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created by:</span>
                  <p className="text-gray-600">{infoRecord.adminId?.name || 'Unknown'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created on:</span>
                  <p className="text-gray-600">
                    {new Date(infoRecord.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Views:</span>
                  <p className="text-gray-600">{infoRecord.viewCount}</p>
                </div>
              </div>
            </Card>

            {/* Translation Notice */}
            {translatedData && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <p className="text-sm text-blue-800">
                    This content has been automatically translated to {currentLanguageName}. 
                    Translation quality may vary.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Powered by InfoMed - Create your own QR codes at{' '}
              <a href="/" className="text-green-500 hover:text-green-600">
                our website
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewInfo;
