import React, { useState, useEffect } from 'react';
import { Check, Clock, AlertCircle, Upload, X, Search, FileText, ChevronDown, Eye, Trash2 } from 'lucide-react';

// Mock Data
const mockCNData = {
  'CN-2025-00123': {
    id: 'CN-2025-00123',
    amount: 15000,
    paymentType: 'Credit Card (Visa)',
    refundCondition: 'Cross-Day Refund',
    originalTransaction: '2025-10-08',
    customerName: 'ABC Company Ltd.',
    customerType: 'Corporate',
    hasSalesOrder: true,
    salesOrderId: 'SO-2025-00456',
    salesOrderAmount: 8000
  },
  'CN-2025-00124': {
    id: 'CN-2025-00124',
    amount: 5000,
    paymentType: 'Cash',
    refundCondition: 'Same-Day Refund',
    originalTransaction: '2025-10-10',
    customerName: 'นาย สมชาย ใจดี',
    customerType: 'Individual',
    hasSalesOrder: false,
    salesOrderId: null,
    salesOrderAmount: 0
  }
};

const mockRequests = [
  {
    id: 'RFN-20251009-001',
    cnId: 'CN-2025-00123',
    customerName: 'ABC Company Ltd.',
    amount: 15000,
    status: 'Pending Head CS Approval',
    createdBy: 'CS-Agent-01',
    createdAt: '2025-10-09T14:30:00',
    daysInQueue: 1,
    assignedTo: 'Head CS'
  },
  {
    id: 'RFN-20251008-002',
    cnId: 'CN-2025-00124',
    customerName: 'นาย สมชาย ใจดี',
    amount: 5000,
    status: 'Pending Accounting Approval',
    createdBy: 'CS-Agent-02',
    createdAt: '2025-10-08T10:15:00',
    daysInQueue: 2,
    assignedTo: 'Accounting'
  }
];

const banks = [
  'ธนาคารกสิกรไทย',
  'ธนาคารกรุงเทพ',
  'ธนาคารไทยพาณิชย์',
  'ธนาคารกรุงศรีอยุธยา',
  'ธนาคารทหารไทยธนชาต'
];

const steps = [
  { id: 1, name: 'ลูกค้าแจ้งความประสงค์', status: 'completed', owner: 'พนักงานขาย' },
  { id: 2, name: 'ตรวจสอบสินค้า', status: 'completed', owner: 'ฝ่ายคลังสินค้า' },
  { id: 3, name: 'ออกใบลดหนี้ (CN)', status: 'completed', owner: 'ฝ่ายบัญชี' },
  { id: 4, name: 'การคืนเงิน', status: 'in-progress', owner: 'ระบบอัตโนมัติ' },
  { id: 5, name: 'เอกสารที่ต้องรวบรวม', status: 'active', owner: 'Customer Support' },
  { id: 6, name: 'Key Gate Approval', status: 'pending', owner: 'ผู้จัดการฝ่าย CS' },
  { id: 7, name: 'การอนุมัติ Payout', status: 'pending', owner: 'ฝ่ายบัญชี' },
  { id: 8, name: 'การโอนเงินคืน', status: 'pending', owner: 'ระบบการเงิน' }
];

const ProgressChecklist = ({ currentStep = 5 }) => {
  const getStepStyle = (step) => {
    if (step.status === 'completed') {
      return 'bg-green-500 text-white border-green-500';
    } else if (step.status === 'active') {
      return 'bg-blue-600 text-white border-blue-600';
    } else if (step.status === 'in-progress') {
      return 'bg-amber-50 text-amber-600 border border-amber-300';
    } else {
      return 'bg-white text-gray-400 border-2 border-gray-300';
    }
  };

  const getIcon = (step) => {
    if (step.status === 'completed') return <Check className="w-5 h-5" />;
    if (step.status === 'active') return <Clock className="w-5 h-5" />;
    if (step.status === 'in-progress') return <Clock className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getTextColor = (step) => {
    if (step.status === 'completed') return 'text-green-600';
    if (step.status === 'active') return 'text-blue-600';
    return 'text-gray-400';
  };

  return (
    <div className="bg-white border-b border-gray-200 py-6 px-4 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Progress</h2>
          <p className="text-sm text-gray-500">ขั้นตอนทั้งหมด</p>
        </div>

        <div className="flex items-start justify-between gap-1">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStepStyle(step)} transition-all shadow-sm mb-3`}>
                  {getIcon(step)}
                </div>

                <div className="text-center w-full px-1">
                  <div className={`text-sm font-semibold mb-1 ${getTextColor(step)} line-clamp-2`}>
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    Step {step.id}/8
                  </div>
                  <div className="text-xs text-gray-400 line-clamp-2">
                    {step.owner}
                  </div>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="flex items-center" style={{ marginTop: '24px', width: '40px' }}>
                  <div className={`h-0.5 w-full ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const DocumentUpload = ({ customerType, documents, onUpload, onDelete }) => {
  const requiredDocs = customerType === 'Corporate'
    ? [
        { id: 'companyReg', label: 'ใบจดทะเบียนบริษัท', required: true },
        { id: 'taxId', label: 'เอกสารเลขประจำตัวผู้เสียภาษี (ภ.พ.20)', required: true },
        { id: 'authId', label: 'บัตรประชาชนผู้มีอำนาจลงนาม', required: true },
        { id: 'bankStmt', label: 'Statement บัญชีบริษัท', required: true }
      ]
    : [
        { id: 'nationalId', label: 'บัตรประชาชน (หน้า-หลัง)', required: true },
        { id: 'bankStmt', label: 'Statement บัญชีธนาคาร (3 เดือนล่าสุด)', required: true }
      ];

  const uploadedCount = requiredDocs.filter(doc => documents[doc.id]).length;

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">เอกสารแนบ</h3>
        <span className="text-sm text-gray-600">
          {uploadedCount}/{requiredDocs.length} เอกสาร
        </span>
      </div>

      <div className="space-y-3">
        {requiredDocs.map(doc => (
          <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3 flex-1">
              {documents[doc.id] ? (
                <>
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{doc.label}</div>
                    <div className="text-xs text-gray-500">{documents[doc.id].name}</div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-700">{doc.label}</div>
              )}
            </div>

            {documents[doc.id] ? (
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(doc.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      onUpload(doc.id, e.target.files[0]);
                    }
                  }}
                />
                <div className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  อัปโหลด
                </div>
              </label>
            )}
          </div>
        ))}
      </div>

      {uploadedCount < requiredDocs.length && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            ขาดเอกสารที่จำเป็น {requiredDocs.length - uploadedCount} รายการ<br/>
            ปุ่มส่งคำขอจะถูกปิดการใช้งาน
          </div>
        </div>
      )}
    </div>
  );
};

const RequestForm = ({ onSubmit, onCancel }) => {
  const [cnSearch, setCnSearch] = useState('');
  const [cnData, setCnData] = useState(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    notes: ''
  });
  const [documents, setDocuments] = useState({});
  const [errors, setErrors] = useState({});
  const [showProgress, setShowProgress] = useState(false);

  const handleCnSearch = () => {
    const data = mockCNData[cnSearch];
    if (data) {
      setCnData(data);
      setShowProgress(true);
      setFormData(prev => ({ ...prev, accountName: data.customerName }));
    } else {
      alert('ไม่พบข้อมูล Credit Note');
    }
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === 'accountNumber') {
      if (!/^\d{10,13}$/.test(value.replace(/-/g, ''))) {
        newErrors.accountNumber = 'กรุณากรอกเลขบัญชี 10-13 หลัก';
      } else {
        delete newErrors.accountNumber;
      }
    }

    if (name === 'accountName' && cnData) {
      if (value !== cnData.customerName) {
        newErrors.accountName = 'ชื่อบัญชีต้องตรงกับชื่อใน Credit Note';
      } else {
        delete newErrors.accountName;
      }
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleDocumentUpload = (docId, file) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์มีขนาดเกิน 5MB');
      return;
    }
    setDocuments(prev => ({ ...prev, [docId]: file }));
  };

  const handleDocumentDelete = (docId) => {
    setDocuments(prev => {
      const newDocs = { ...prev };
      delete newDocs[docId];
      return newDocs;
    });
  };

  const isFormValid = () => {
    if (!cnData) return false;
    if (!formData.bankName || !formData.accountNumber || !formData.accountName) return false;
    if (Object.keys(errors).length > 0) return false;

    const requiredDocCount = cnData.customerType === 'Corporate' ? 4 : 2;
    return Object.keys(documents).length >= requiredDocCount;
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      if (confirm('ยืนยันการส่งคำขอไปยังหัวหน้าฝ่าย CS?')) {
        onSubmit({ cnData, formData, documents });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showProgress && <ProgressChecklist currentStep={5} />}

      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={onCancel}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
        >
          <span>←</span> กลับไปหน้าแรก
        </button>

        {cnData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">รายละเอียดจำนวนเงินที่ต้องคืน (แยกตามประเภทการชำระเงิน)</h3>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💵</span>
                  <span className="text-sm font-medium text-gray-700">เงินสด</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">฿2,000</div>
              </div>

              <div className="border-l-4 border-purple-500 bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📱</span>
                  <span className="text-sm font-medium text-gray-700">QR Code / โอนเงิน</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">฿1,500</div>
              </div>

              <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏦</span>
                  <span className="text-sm font-medium text-gray-700">โอนผ่าน บัญชีธนาคาร</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">฿1,490</div>
              </div>

              <div className="border-l-4 border-amber-500 bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💳</span>
                  <span className="text-sm font-medium text-gray-700">บัตรเครดิต</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">฿1,000</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <span className="text-lg font-semibold text-gray-700">ยอดเงินคืนทั้งหมด</span>
              </div>
              <div className="text-3xl font-bold text-red-600">฿5,990</div>
            </div>
          </div>
        )}

        {!cnData ? (
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">ค้นหา Credit Note</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={cnSearch}
                onChange={(e) => setCnSearch(e.target.value)}
                placeholder="CN-2025-00123"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCnSearch()}
              />
              <button
                onClick={handleCnSearch}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                ค้นหา
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              ตัวอย่าง: CN-2025-00123, CN-2025-00124
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">ข้อมูล Credit Note</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">CN ID</div>
                  <div className="font-medium text-gray-900">{cnData.id}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">เงื่อนไขการคืนเงิน</div>
                  <div className="font-medium text-gray-900">{cnData.refundCondition}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">วันที่ทำรายการ</div>
                  <div className="font-medium text-gray-900">{cnData.originalTransaction}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">ชื่อลูกค้า</div>
                  <div className="font-medium text-gray-900">{cnData.customerName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">ประเภทลูกค้า</div>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {cnData.customerType === 'Corporate' ? 'นิติบุคคล' : 'บุคคลธรรมดา'}
                  </div>
                </div>
                {cnData.hasSalesOrder && (
                  <>
                    <div className="pt-3 border-t border-gray-300">
                      <div className="text-xs text-gray-500 mb-1">Sales Order ใบใหม่</div>
                      <div className="font-medium text-blue-600">{cnData.salesOrderId}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">จำนวนเงิน SO</div>
                      <div className="font-medium text-orange-600">฿{cnData.salesOrderAmount.toLocaleString()}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="text-xs text-blue-800">
                        <span className="font-semibold">เงินคืนจริง:</span> ฿{(cnData.amount - cnData.salesOrderAmount).toLocaleString()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">ข้อมูลที่ต้องกรอก</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ธนาคาร <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">เลือกธนาคาร</option>
                    {banks.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เลขที่บัญชี <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="XXX-X-XXXXX-X"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  {errors.accountNumber && (
                    <div className="text-xs text-red-600 mt-1">{errors.accountNumber}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">รูปแบบ: XXX-X-XXXXX-X</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อบัญชี <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  {errors.accountName && (
                    <div className="text-xs text-red-600 mt-1">{errors.accountName}</div>
                  )}
                  {!errors.accountName && formData.accountName === cnData.customerName && (
                    <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" /> ตรงกับชื่อใน CN
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">ต้องตรงกับชื่อผู้รับใน Credit Note</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หมายเหตุพิเศษ
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    maxLength={500}
                    placeholder="ข้อมูลเพิ่มเติม (ถ้ามี)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.notes.length}/500 ตัวอักษร
                  </div>
                </div>
              </div>
            </div>

            <DocumentUpload
              customerType={cnData.customerType}
              documents={documents}
              onUpload={handleDocumentUpload}
              onDelete={handleDocumentDelete}
            />
          </div>
        )}

        {cnData && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                isFormValid()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FileText className="w-5 h-5" />
              ส่งคำขอ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ requests, myQueueRequests, onViewRequest, onCreateNew, userRole }) => {
  const [activeTab, setActiveTab] = useState('myQueue');
  const [filterStatus, setFilterStatus] = useState('all');

  const displayRequests = activeTab === 'myQueue' ? myQueueRequests : requests;

  const getStatusStyle = (status) => {
    const styles = {
      'Pending Head CS Approval': 'bg-yellow-100 text-yellow-800',
      'Pending Accounting Approval': 'bg-amber-100 text-amber-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Draft': 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleDescription = () => {
    switch (userRole) {
      case 'CS Staff':
        return 'สร้างคำขอคืนเงินและจัดการเอกสาร';
      case 'Head CS':
        return 'ตรวจสอบและอนุมัติคำขอจากทีม CS';
      case 'Accounting':
        return 'อนุมัติการจ่ายเงินและดำเนินการโอนเงิน';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">ระบบจัดการคำขอคืนเงิน</h1>
              <p className="text-sm text-gray-600 mt-1">{getRoleDescription()}</p>
            </div>
            {userRole === 'CS Staff' && (
              <button
                onClick={onCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                สร้างคำขอใหม่
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('myQueue')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'myQueue'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                คิวของฉัน ({myQueueRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('allRequests')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'allRequests'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                คำขอทั้งหมด ({requests.length})
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200 flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="rejected">ปฏิเสธ</option>
            </select>
            <input
              type="text"
              placeholder="ค้นหา Request ID, CN ID, หรือชื่อลูกค้า..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Request ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">CN Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">ชื่อลูกค้า</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">จำนวนเงิน</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">สถานะ</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Days in Queue</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Assigned To</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayRequests.map(request => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{request.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{request.cnId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{request.customerName}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      ฿{request.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {request.daysInQueue > 2 ? (
                        <span className="text-red-600 font-semibold">{request.daysInQueue} วัน</span>
                      ) : (
                        <span className="text-gray-600">{request.daysInQueue} วัน</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{request.assignedTo}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onViewRequest(request)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {displayRequests.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {activeTab === 'myQueue'
                ? 'ไม่มีรายการที่ต้องดำเนินการในขณะนี้'
                : 'ไม่พบรายการคำขอ'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReviewScreen = ({ request, onApprove, onReject, onBack, userRole }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState('');

  // Payment breakdown data
  const paymentBreakdown = {
    cash: 2000,
    paymentGateway: 0,
    mobileBanking: 1500,
    creditCard: 1000,
    points: 500,
    giftVoucher: 990
  };

  const refundCondition = request.status === 'Pending Accounting Approval' ? 'ไม่ซื้อต่อ' : 'ซื้อใหม่';
  const hasSalesOrder = true;
  const salesOrderAmount = 2000; // จำนวนเงินที่ซื้อใหม่
  const isCrossDay = true; // บัตรเครดิตข้ามวันจะโอนเงินคืน

  // Calculate refund methods
  const getRefundMethods = () => {
    const methods = [];

    // Bank Transfer Group (includes Cash, Payment Gateway, Mobile Banking, and Gift Voucher)
    const bankTransferTotal = paymentBreakdown.cash + paymentBreakdown.paymentGateway + paymentBreakdown.mobileBanking + paymentBreakdown.giftVoucher;
    if (bankTransferTotal > 0) {
      const items = [];
      if (paymentBreakdown.cash > 0) {
        items.push({ icon: '💵', name: 'เงินสด', amount: paymentBreakdown.cash });
      }
      if (paymentBreakdown.paymentGateway > 0) {
        items.push({ icon: '🌐', name: 'Payment Gateway', amount: paymentBreakdown.paymentGateway });
      }
      if (paymentBreakdown.mobileBanking > 0) {
        items.push({ icon: '📱', name: 'Mobile Banking / QR Code', amount: paymentBreakdown.mobileBanking });
      }
      if (paymentBreakdown.giftVoucher > 0) {
        items.push({ icon: '🎫', name: 'บัตรกำนัล (GV)', amount: paymentBreakdown.giftVoucher, note: 'คืน GV ด้วย QR เข้า LINE BCRM' });
      }

      methods.push({
        type: 'bank-transfer',
        title: 'โอนเงินเข้าบัญชีธนาคารลูกค้า',
        total: bankTransferTotal,
        items: items,
        color: 'blue'
      });
    }

    // Credit Card
    if (paymentBreakdown.creditCard > 0) {
      const action = refundCondition === 'ไม่ซื้อต่อ'
        ? 'Refund เข้าบัตรเดิม'
        : 'Refund ส่วนต่างเข้าบัตรเดิม';

      methods.push({
        type: 'credit-card',
        title: 'บัตรเครดิต',
        icon: '💳',
        amount: paymentBreakdown.creditCard,
        action: action,
        color: 'purple'
      });
    }

    // Points
    if (paymentBreakdown.points > 0) {
      const action = refundCondition === 'ไม่ซื้อต่อ'
        ? 'คืน Point'
        : 'คืน Point, จ่ายด้วย Point';

      methods.push({
        type: 'points',
        title: 'แต้ม (Points)',
        icon: '⭐',
        amount: paymentBreakdown.points,
        action: action,
        color: 'yellow'
      });
    }

    return methods;
  };

  const refundMethods = getRefundMethods();

  const handleApprove = () => {
    const nextStep = userRole === 'Head CS' ? 'ฝ่ายบัญชี' : 'ระบบการเงิน';
    if (confirm(`ยืนยันการอนุมัติคำขอนี้และส่งต่อไปยัง${nextStep}?`)) {
      onApprove(request.id);
    }
  };

  const handleReject = () => {
    if (rejectReason.length < 20) {
      alert('กรุณาระบุเหตุผลการปฏิเสธอย่างน้อย 20 ตัวอักษร');
      return;
    }
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    onReject(request.id, rejectReason);
    setShowRejectModal(false);
  };

  const canApproveOrReject = () => {
    if (userRole === 'Head CS' && request.status === 'Pending Head CS Approval') return true;
    if (userRole === 'Accounting' && request.status === 'Pending Accounting Approval') return true;
    return false;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', dot: 'bg-blue-500' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', dot: 'bg-purple-500' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', dot: 'bg-yellow-500' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-900', dot: 'bg-pink-500' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressChecklist currentStep={userRole === 'Head CS' ? 6 : 7} />

      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={onBack}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
        >
          <span>←</span> กลับไปที่ Dashboard
        </button>

        <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-blue-700 font-medium">บทบาท: {userRole}</span>
        </div>

        {userRole === 'Accounting' && refundMethods.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-2xl">💸</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900">การดำเนินการคืนเงินตามเงื่อนไข</h4>
            </div>

            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-200">
              <span className="text-sm font-medium text-gray-600">เงื่อนไข:</span>
              <span className="text-sm font-bold text-gray-900">{refundCondition}</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {refundMethods.map((method, idx) => {
                const colorClass = getColorClasses(method.color);

                if (method.type === 'bank-transfer') {
                  return (
                    <div key={idx} className={`${colorClass.bg} rounded-xl p-5 border-2 ${colorClass.border} shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🏦</span>
                        <h5 className={`font-bold ${colorClass.text} text-base`}>
                          โอนเงินเข้าบัญชีธนาคารลูกค้า
                        </h5>
                      </div>

                      <div className="text-3xl font-bold text-gray-900 mb-4">
                        ฿{method.total.toLocaleString()}
                      </div>

                      <div className="space-y-2">
                        {method.items.map((item, i) => (
                          <div key={i} className="bg-white bg-opacity-70 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{item.icon}</span>
                              <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">฿{item.amount.toLocaleString()}</div>
                            {item.note && (
                              <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                <span>→</span>
                                <span>{item.note.includes('ข้ามวัน') ? 'โอนคืน' : 'QR LINE'}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {method.deducted > 0 && (
                        <div className="mt-3 pt-3 border-t-2 border-gray-300">
                          <div className="text-sm text-orange-600 font-bold">
                            หัก SO: -฿{method.deducted.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                } else if (method.type === 'credit-card') {
                  return (
                    <div key={idx} className={`${colorClass.bg} rounded-xl p-5 border-2 ${colorClass.border} shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{method.icon}</span>
                        <span className={`font-bold ${colorClass.text} text-base`}>{method.title}</span>
                      </div>

                      <div className="text-3xl font-bold text-gray-900 mb-4">
                        ฿{method.amount.toLocaleString()}
                      </div>

                      <div className="bg-white bg-opacity-70 rounded-lg p-3 mb-2 border border-gray-200">
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full ${colorClass.dot} mt-2 flex-shrink-0`}></div>
                          <div className="text-sm">
                            <span className="font-bold text-gray-900">เงื่อนไข:</span>
                            <div className="text-gray-700 mt-1 font-medium">{method.action}</div>
                          </div>
                        </div>
                      </div>

                      {method.deducted > 0 && (
                        <div className="pt-3 border-t-2 border-gray-300">
                          <div className="text-sm text-orange-600 font-bold">
                            หัก SO: -฿{method.deducted.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                } else if (method.type === 'points') {
                  return (
                    <div key={idx} className={`${colorClass.bg} rounded-xl p-5 border-2 ${colorClass.border} shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{method.icon}</span>
                        <span className={`font-bold ${colorClass.text} text-base`}>{method.title}</span>
                      </div>

                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {method.amount.toLocaleString()} แต้ม
                      </div>

                      <div className="bg-white bg-opacity-70 rounded-lg p-3 mb-2 mt-4 border border-gray-200">
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full ${colorClass.dot} mt-2 flex-shrink-0`}></div>
                          <div className="text-sm">
                            <span className="font-bold text-gray-900">เงื่อนไข:</span>
                            <div className="text-gray-700 mt-1 font-medium">{method.action}</div>
                          </div>
                        </div>
                      </div>

                      {method.deducted > 0 && (
                        <div className="pt-3 border-t-2 border-gray-300">
                          <div className="text-sm text-orange-600 font-bold">
                            หัก SO: -{method.deducted.toLocaleString()} แต้ม
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">ข้อมูล Credit Note</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Request ID</div>
                  <div className="font-medium text-gray-900">{request.id}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">CN Reference</div>
                  <div className="font-medium text-gray-900">{request.cnId}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">เงื่อนไขการคืนเงิน</div>
                  <div className="font-medium text-gray-900">Cross-Day Refund</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">วันที่ทำรายการ</div>
                  <div className="font-medium text-gray-900">2025-10-08</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">ชื่อลูกค้า</div>
                  <div className="font-medium text-gray-900">{request.customerName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">ประเภทลูกค้า</div>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    นิติบุคคล
                  </div>
                </div>
                {hasSalesOrder && salesOrderAmount > 0 && (
                  <>
                    <div className="pt-3 border-t border-gray-300">
                      <div className="text-xs text-gray-500 mb-1">Sales Order ใบใหม่</div>
                      <div className="font-medium text-blue-600">SO-2025-00456</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">จำนวนเงิน SO</div>
                      <div className="font-medium text-orange-600">฿{salesOrderAmount.toLocaleString()}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="text-xs text-blue-800">
                        <span className="font-semibold">เงินคืนจริง:</span> ฿{(request.amount - salesOrderAmount).toLocaleString()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">รายละเอียดบัญชี</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">ธนาคาร</div>
                <div className="font-medium text-gray-900">ธนาคารกสิกรไทย</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">เลขที่บัญชี</div>
                <div className="font-medium text-gray-900">123-4-56789-0</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">ชื่อบัญชี</div>
                <div className="font-medium text-gray-900">{request.customerName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">หมายเหตุพิเศษ</div>
                <div className="text-sm text-gray-600">-</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">เอกสารแนบ (4)</h3>
            <div className="space-y-2">
              {['ใบจดทะเบียนบริษัท', 'เอกสารภ.พ.20', 'บัตรประชาชนผู้มีอำนาจ', 'Statement บัญชี'].map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">{doc}</span>
                  </div>
                  <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                    ดู PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">สร้างโดย: {request.createdBy}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(request.createdAt).toLocaleString('th-TH')}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">รอการตรวจสอบ</div>
                  <div className="text-xs text-gray-500">โดย {request.assignedTo}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">การตัดสินใจ</h3>

            {canApproveOrReject() ? (
              <>
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    การดำเนินการนี้ไม่สามารถย้อนกลับได้
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เหตุผลการปฏิเสธ (ถ้ามี)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    placeholder="ระบุเหตุผลหากต้องการปฏิเสธคำขอ (ขั้นต่ำ 20 ตัวอักษร)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {rejectReason.length}/500 ตัวอักษร
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleApprove}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    อนุมัติและส่งต่อ
                  </button>
                  <button
                    onClick={handleReject}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    ปฏิเสธคำขอ
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  คุณไม่มีสิทธิ์อนุมัติคำขอนี้<br/>
                  สถานะ: {request.status}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">ยืนยันการปฏิเสธ</h3>
            </div>

            <p className="text-gray-600 mb-4">
              คำขอนี้จะถูกส่งกลับไปยัง {request.createdBy}
            </p>

            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="text-sm font-medium text-gray-700 mb-1">เหตุผล:</div>
              <div className="text-sm text-gray-600">{rejectReason}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [requests, setRequests] = useState(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userRole, setUserRole] = useState('CS Staff');

  const getRoleSpecificRequests = () => {
    switch (userRole) {
      case 'CS Staff':
        return requests.filter(req => req.status === 'Draft' || req.status === 'Rejected');
      case 'Head CS':
        return requests.filter(req => req.status === 'Pending Head CS Approval');
      case 'Accounting':
        return requests.filter(req => req.status === 'Pending Accounting Approval');
      default:
        return requests;
    }
  };

  const handleCreateNew = () => {
    setCurrentView('form');
  };

  const handleSubmitRequest = (data) => {
    const newRequest = {
      id: `RFN-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${String(requests.length + 1).padStart(3, '0')}`,
      cnId: data.cnData.id,
      customerName: data.cnData.customerName,
      amount: data.cnData.amount,
      status: 'Pending Head CS Approval',
      createdBy: 'CS-Agent-Current',
      createdAt: new Date().toISOString(),
      daysInQueue: 0,
      assignedTo: 'Head CS'
    };

    setRequests([newRequest, ...requests]);
    alert('✓ ส่งคำขอสำเร็จ!');
    setCurrentView('dashboard');
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setCurrentView('review');
  };

  const handleApprove = (requestId) => {
    setRequests(requests.map(req => {
      if (req.id === requestId) {
        if (userRole === 'Head CS') {
          return { ...req, status: 'Pending Accounting Approval', assignedTo: 'Accounting' };
        } else if (userRole === 'Accounting') {
          return { ...req, status: 'Approved' };
        }
      }
      return req;
    }));
    alert('✓ อนุมัติคำขอสำเร็จ!');
    setCurrentView('dashboard');
  };

  const handleReject = (requestId, reason) => {
    setRequests(requests.map(req =>
      req.id === requestId
        ? { ...req, status: 'Rejected' }
        : req
    ));
    alert('คำขอถูกปฏิเสธและส่งกลับไปยังผู้สร้าง');
    setCurrentView('dashboard');
  };

  return (
    <div className="font-sans">
      {currentView === 'dashboard' && (
        <>
          <div className="fixed top-4 right-4 z-50">
            <div className="relative">
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="appearance-none bg-white border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 text-base font-medium text-gray-900 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm"
              >
                <option value="CS Staff">👤 CS Staff</option>
                <option value="Head CS">👤 Head CS</option>
                <option value="Accounting">👤 Accounting</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          <Dashboard
            requests={requests}
            myQueueRequests={getRoleSpecificRequests()}
            onViewRequest={handleViewRequest}
            onCreateNew={handleCreateNew}
            userRole={userRole}
          />
        </>
      )}

      {currentView === 'form' && (
        <RequestForm
          onSubmit={handleSubmitRequest}
          onCancel={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'review' && selectedRequest && (
        <ReviewScreen
          request={selectedRequest}
          onApprove={handleApprove}
          onReject={handleReject}
          onBack={() => setCurrentView('dashboard')}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default App;
