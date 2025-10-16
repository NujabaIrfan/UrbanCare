export const validateReceipt = (req, res, next) => {
  const { receiptNo, patientId, patientName, services, total } = req.body;
  
  if (!receiptNo || !patientId || !patientName || !services || !total) {
    return res.status(400).json({ 
      message: "All fields are required: receiptNo, patientId, patientName, services, total" 
    });
  }
  
  if (typeof total !== 'number' || total < 0) {
    return res.status(400).json({ 
      message: "Total must be a positive number" 
    });
  }
  
  next();
};

export const validatePayment = (req, res, next) => {
  const { amount, billId, receiptNo } = req.body;
  
  if (!amount || !billId || !receiptNo) {
    return res.status(400).json({ 
      message: "All fields are required: amount, billId, receiptNo" 
    });
  }
  
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ 
      message: "Amount must be a positive number" 
    });
  }
  
  next();
};