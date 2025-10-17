const mockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
  user: { id: 'test-user-id' }
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockReceipt = (overrides = {}) => ({
  receiptNo: 'REC-001',
  patientId: 'PAT-001',
  patientName: 'John Doe',
  services: [
    { name: 'Consultation', price: 100 },
    { name: 'X-Ray', price: 200 }
  ],
  total: 300,
  status: 'Pending',
  ...overrides
});

module.exports = {
  mockRequest,
  mockResponse,
  mockReceipt
};