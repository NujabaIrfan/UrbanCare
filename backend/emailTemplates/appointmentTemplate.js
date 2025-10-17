// appointmentTemplate.js
export const appointmentTemplate = ({
    patientName,
    doctorName,
    appointmentNumber,
    appointmentDate,
    appointmentTime,
    symptoms,
    notes,
    doctorContact
}) => {
    return `
        <html>
        <head>
            <style>
                .container {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    max-width: 600px;
                    margin: auto;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background: #4CAF50;
                    color: white;
                    text-align: center;
                    padding: 10px;
                    font-size: 20px;
                    font-weight: bold;
                    border-top-left-radius: 10px;
                    border-top-right-radius: 10px;
                }
                .content {
                    padding: 20px;
                    font-size: 16px;
                }
                .footer {
                    text-align: center;
                    font-size: 12px;
                    color: #777;
                    padding: 10px;
                    border-top: 1px solid #ddd;
                }
                ul {
                    list-style: none;
                    padding: 0;
                }
                li {
                    margin-bottom: 8px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">Appointment Confirmation</div>
                <div class="content">
                    <p>Dear ${patientName},</p>
                    <p>Your appointment has been successfully booked with <strong>Dr. ${doctorName}</strong>.</p>
                    <ul>
                        <li><strong>Appointment No:</strong> ${appointmentNumber}</li>
                        <li><strong>Date:</strong> ${appointmentDate}</li>
                        <li><strong>Time:</strong> ${appointmentTime}</li>
                        <li><strong>Symptoms:</strong> ${symptoms}</li>
                        ${notes ? `<li><strong>Additional Notes:</strong> ${notes}</li>` : ''}
                        <li><strong>Doctor Contact:</strong> ${doctorContact || 'Not provided'}</li>
                    </ul>
                    <p>Thank you for choosing Urban Care!</p>
                </div>
                <div class="footer">If you didn't request this, please ignore this email.</div>
            </div>
        </body>
        </html>
    `;
};
